$(document).ready(function(){

  // Getting canvas reference
  var canvas = $("#traffic-canvas")[0];
  var ctx = canvas.getContext("2d");

  $("#traffic-canvas").click(function(e){
    console.log("x: "+e.offsetX, "y: "+e.offsetY);
  });

  var traffic_light_thickness = 10; //thickness of traffic lights collider
  var timer_speed = 1; //traffic lights timer speed
  var n_cars = 0; //num cars to be generated using the generateCars function
  var response; //response object to be used in collision calculations
  var collision; //collision object used in collision calculations true if there is a collision
  var noCollisions; //true if a car does not collide with any collider
  var colRecord = false; //collision record used to determine is the car crossed start line
  var intersectionOptions = [Globals.RIGHT_TAG, Globals.LEFT_TAG, Globals.FORWARD_TAG]; //default options for a intersections that a car can do
  var roadOptions = [Globals.END_TAG]; //default options for a start and end of roads that a car can do
  var traffic_light_time_limit = 300;
  // Adding roads
  var roads = new Array();
  // roads.push(new road(100, 0, 80, 50, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, roadOptions, ctx));
  // roads.push(new road(0, 100, 50, 80, Globals.ROAD_COLOR, Globals.HORIZONTAL_TAG, roadOptions, ctx));
  roads.push(new road(50, 220, 400, 30, Globals.ROAD_COLOR, Globals.HORIZONTAL_TAG, roadOptions, undefined, ctx));
  roads.push(new road(450, 220, 0, 30, Globals.ROAD_COLOR, Globals.HORIZONTAL_TAG, roadOptions, undefined, ctx));

  roads.push(new road(200, 330, 250, 30, Globals.ROAD_COLOR, Globals.HORIZONTAL_TAG, roadOptions, undefined, ctx));
  roads.push(new road(450, 330, 0, 30, Globals.ROAD_COLOR, Globals.HORIZONTAL_TAG, roadOptions, undefined, ctx));

  roads.push(new road(80, 420, 120, 30, Globals.ROAD_COLOR, Globals.HORIZONTAL_TAG, roadOptions, undefined, ctx));

  roads.push(new road(50, 250, 30, 200, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, roadOptions, undefined, ctx));
  roads.push(new road(170, 330, 30, 90, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, roadOptions, undefined, ctx));

  roads.push(new road(420, 250, 30, 80, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, undefined, undefined, ctx));

  // Adding Intersection
  var intersections = new Array();
  intersections.push(new intersection(100, 100, 80, 80, traffic_light_thickness, intersectionOptions));

  // Adding cars
  var cars = generateCars(roads, n_cars, ctx);

  // Creating collidiers

  var colliders = new Array();
  var tempCollider;
  // Adding cars collidiers
  for(var i=0; i<cars.length ; i++){
    colliders.push(cars[i]);
  }
  // roads start and end
  for(var i=0 ; i<roads.length ; i++){
    for(var j=0 ; j<roads[i].colliders.length ; j++){
        colliders.push({collider: roads[i].colliders[j], type: Globals.ROAD_TAG, options: roads[i].options[j]});
    }
    // colliders.push({collider: roads[i].colliders[0], type: Globals.ROAD_TAG, options: roads[i].options});
    // colliders.push({collider: roads[i].colliders[1], type: Globals.ROAD_TAG, options: roads[i].options});
  }
  // Intersection
  for(var i=0 ; i<intersections.length ; i++){
    for(var j=0; j<intersections[i].traffic_lights.length ; j++){
      colliders.push({collider: intersections[i].traffic_lights[j] , type: Globals.TRAFFIC_LIGHT_TAG, intersection_index: i, light_index: j, options: intersections[i].options});
    }
  }

  // Main program loop all drawing happens here
  var mainLoop = function(){
    //clearing the canvas to draw again
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    //draw roads
    for(var i=0; i<roads.length ; i++){
      roads[i].draw();
    }
    //draw cars
    for(var i=0; i<cars.length ; i++){
      cars[i].draw();
    }

    for(var i=0 ; i<intersections.length ; i++){
      for(var j=0; j<intersections[i].timers.length ; j++){
        intersections[i].timers[j] += timer_speed;
        // console.log("Traffic Light "+ j + ":" + intersections[i].timers[j]);
      }
    }

    // Check if cars crossed the start line so it can start calculate collisions
    for(var i=0 ; i<cars.length ; i++){
      colRecord = false; //no collison record of any kind
      if(cars[i].crossedStartLine) //if car crossedStartLine no checks have to be done
        continue;
      for(var j=0 ; j<roads.length ; j++){ //loops over roads to check for collision with car i
          for(var k = 0 ; k<roads[j].colliders.length ; k++){ //loops over road start and end colliders to check collision with car i
            response = new SAT.Response();
            collision = SAT.testPolygonPolygon(cars[i].collider.toPolygon(), roads[j].colliders[k].toPolygon(), response);
            if(collision){
              cars[i].startedCrossing = true; //set this true to start checking if the car has finished colliding with that collider
              colRecord = true;
            }
          }
      }
      if(cars[i].startedCrossing && !colRecord){
        //if car started crossing and now there is no collision this means it has exited the collider
        //this means car has crossedStartLine
        cars[i].crossedStartLine = true;
      }
    }

    // Detect collision
    for(var i=0; i<cars.length ; i++){
      noCollisions = true;
      cars[i].n_carCollisions = 0;
      for(var j=0; j<colliders.length ; j++){
          response = new SAT.Response();
          collision = SAT.testPolygonPolygon(cars[i].collider.toPolygon(), colliders[j].collider.toPolygon(), response);

          if((i==j) ||
             (!cars[i].crossedStartLine && colliders[j].type == Globals.ROAD_TAG) ||
             (cars[i].neglectCarCollision && colliders[j].type == Globals.CAR_TAG))
          {
            collision = false;
          }

          if(collision)
          {
            noCollisions = false;
            //Collision Happened
            // console.log("car "+i+" collision with collider "+j+" type "+colliders[j].type+"  "+colliders[j].dir);
            if(colliders[j].type == Globals.TRAFFIC_LIGHT_TAG)
              {
                //collision with a traffic light
                if(intersections[colliders[j].intersection_index].timers[colliders[j].light_index] > 0 && intersections[colliders[j].intersection_index].timers[colliders[j].light_index] < traffic_light_time_limit){
                  //traffic light is closed stop cars
                  // console.log("Traffic Light");
                  cars[i].acc = 0;
                }else if(intersections[colliders[j].intersection_index].timers[colliders[j].light_index] > traffic_light_time_limit*2 ){
                  //reset traffic light timer to start from the begining
                  intersections[colliders[j].intersection_index].timers[colliders[j].light_index] = 0;
                }else{

                  ///////////NEEDS WORK//////////////////
                  var optionIndex = Math.floor(Math.random() * colliders[j].options.length);
                  var option = colliders[j].options[optionIndex];
                  cars[i].acc = cars[i].previousAcc;
                  if(option == Globals.RIGHT_TAG || option == Globals.LEFT_TAG)
                    cars[i].change_lane(option);
                  console.log(option);
                  ////////////
                }
              }else if(colliders[j].type == Globals.CAR_TAG){
                cars[i].acc = 0;
                cars[i].n_carCollisions++;
              }else if(colliders[j].type == Globals.ROAD_TAG){

                cars[i].acc = 0;

                var optionIndex = Math.floor(Math.random() * colliders[j].options.length);
                var option = colliders[j].options[optionIndex];
                if(option == Globals.END_TAG){
                    colliders.splice(i, 1);
                    cars.splice(i, 1);
                }
              }else{
                // cars[i].acc = cars[i].previousAcc;
              }
          }else{
            //No Collision Happened
            // cars[i].move();
            // cars[i].acc = cars[i].previousAcc;

          }
      }
      // preform step movement for car i for this frame
      cars[i].move();
      if(!cars[i].crossedStartLine && cars[i].n_carCollisions == 1){
      // if(cars[i].n_carCollisions == 1){
        cars[i].neglectCarCollision = true;
        noCollisions = true;
      }else{
        cars[i].neglectCarCollision = false;
      }

      if(noCollisions){
        cars[i].acc = cars[i].previousAcc;
      }
    }
    ////////////


    // Drawing collidiers
    drawColliders(colliders, ctx);

  };

  setInterval(mainLoop, Globals.FRAME_DELAY);

});
