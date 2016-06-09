$(document).ready(function(){

  // Getting canvas reference
  var canvas = $("#traffic-canvas")[0];
  var ctx = canvas.getContext("2d");

  $("#traffic-canvas").click(function(e){
    console.log("x: "+e.offsetX, "y: "+e.offsetY);
  });

  // Instantiate a slider
  var carSlider = $("#car-num-slider");
  var velSlider = $("#vel-num-slider");

  carSlider.slider()
  velSlider.slider()

  carSlider.on('slidechange', function(e, ui){
    car_slide_val_elem.innerText = ui.value;
    n_cars = ui.value;
  });

  velSlider.on('slidechange', function(e, ui){
    vel_slide_val_elem.innerText = ui.value;
    car_vel = ui.value;
  });

  // handling buttons
  var start_b = $("#start-b");
  var restart_b = $("#restart-b");
  var stop_b = $("#stop-b");

  // UI Elements
  var timer_elem = $("#sim-timer")[0];
  var avg_wait_time_elem = $("#sim-avg-wait-time")[0];
  var car_count_elem = $("#sim-car-count")[0];
  var car_slide_val_elem = $("#car-slider-value")[0];
  var vel_slide_val_elem = $("#vel-slider-value")[0];

  var fountain_img_loaded = false;
  var timer = 0;
  var timeScale = 0.05;
  var totalWaitingTime = 0;
  var numCarsOut = 0  ;
  var traffic_light_thickness = 10; //thickness of traffic lights collider
  var timer_speed = 1; //traffic lights timer speed
  var car_vel = 1;
  var n_cars = 10; //num cars to be generated using the generateCars function
  var response; //response object to be used in collision calculations
  var collision; //collision object used in collision calculations true if there is a collision
  var noCollisions; //true if a car does not collide with any collider
  var colRecord = false; //collision record used to determine is the car crossed start line
  var intersectionOptions = [Globals.RIGHT_TAG, Globals.LEFT_TAG, Globals.FORWARD_TAG]; //default options for a intersections that a car can do
  var roadOptions = [Globals.END_TAG]; //default options for a start and end of roads that a car can do
  var traffic_light_time_limit = 300;
  var interval = undefined;
  var roads;
  var start_roads;
  var cars;
  var colliders;
  var tempCollider;

  // load fountain image
  var img = new Image();
  img.onload = function() {
    fountain_img_loaded = true;
  };
  img.src = 'https://raw.githubusercontent.com/AbdulazizAlaa/Traffic-Simulator/master/images/fountain-image.png';

  start_b.on('click', function(e){

    if(interval != undefined)
      clearInterval(interval);

    //draw fountain and grass
    // ctx.drawImage()

    // Adding roads
    roads = new Array();
    // roads.push(new road(100, 0, 80, 50, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, roadOptions, ctx));
    // roads.push(new road(0, 100, 50, 80, Globals.ROAD_COLOR, Globals.HORIZONTAL_TAG, roadOptions, ctx));

    // options parameter contains
    // options that car can perform when colliding with collider
    // margin of the collider to push out of its regular place
    // type of the collider {road, start_road, curve}
    // dir is it a start or end collider
    // you have start_oprions and end_options for the start and end collider

    //// upper horizontal roads
    roads.push(new road(50, 220, 380, 30, Globals.ROAD_COLOR, Globals.HORIZONTAL_TAG, 2, {options: [Globals.LEFT_TAG], margin: 35, type: Globals.ROAD_TAG, num_lanes: 2, dir: 0}, undefined, ctx));

      // traffic light
    // roads.push(new road(430, 220, 120, 30, Globals.ROAD_COLOR, Globals.HORIZONTAL_TAG, 2, {options: roadOptions, margin: 0, type: Globals.TRAFFIC_LIGHT_TAG, num_lanes: 1, dir: 0}, undefined, ctx));
    roads.push(new road(430, 220, 120, 30, Globals.ROAD_COLOR, Globals.HORIZONTAL_TAG, 2, undefined, undefined, ctx));

    roads.push(new road(550, 220, 0, 30, Globals.ROAD_COLOR, Globals.HORIZONTAL_TAG, 2, {options: [Globals.FORWARD_TAG, Globals.LEFT_TAG], margin: 120, type: Globals.ROAD_TAG, num_lanes: 1, dir: 0}, {options: roadOptions, margin: 0, type: Globals.START_ROAD_TAG, dir: 1}, ctx));
    // roads.push(new road(550, 220, 0, 30, Globals.ROAD_COLOR, Globals.HORIZONTAL_TAG, 2, {options: [Globals.STOP_TAG], margin: 120, type: Globals.ROAD_TAG, num_lanes: 1, dir: 0}, {options: roadOptions, margin: 0, type: Globals.START_ROAD_TAG, dir: 1}, ctx));

    //// lower horizontal roads
      // traffic light
    // roads.push(new road(200, 330, 100, 30, Globals.ROAD_COLOR, Globals.HORIZONTAL_TAG, 2, undefined, {options: roadOptions, margin: 0, type: "", num_lanes: 1, dir: 1}, ctx));
    roads.push(new road(200, 330, 100, 30, Globals.ROAD_COLOR, Globals.HORIZONTAL_TAG, 2, undefined, undefined, ctx));

    roads.push(new road(300, 330, 250, 30, Globals.ROAD_COLOR, Globals.HORIZONTAL_TAG, 2, undefined, {options: [Globals.FORWARD_TAG, Globals.LEFT_TAG], margin: 35, type: Globals.ROAD_TAG, num_lanes: 1, dir: 1}, ctx));
    roads.push(new road(550, 330, 0, 30, Globals.ROAD_COLOR, Globals.HORIZONTAL_TAG, 2, undefined, {options: roadOptions, margin: 0, type: Globals.ROAD_TAG, num_lanes: 1, dir: 1}, ctx));

    //// middle

      // left

    roads.push(new road(300, 0, 30, 80, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, 2, {options: roadOptions, margin: 0, type: Globals.START_ROAD_TAG, num_lanes: 1, dir: 0}, {options: [Globals.FORWARD_TAG, Globals.LEFT_TAG], margin: 0, type: Globals.ROAD_TAG, num_lanes: 2, dir: 1}, ctx));
    // roads.push(new road(300, 0, 30, 80, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, 2, {options: roadOptions, margin: 0, type: Globals.START_ROAD_TAG, num_lanes: 1, dir: 0}, {options: [Globals.LEFT_TAG], margin: 0, type: Globals.ROAD_TAG, num_lanes: 2, dir: 1}, ctx));

      // traffic light
    // roads.push(new road(300, 80, 30, 140, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, 2, undefined, {options: roadOptions, margin: 0, type: "", num_lanes: 1, dir: 1}, ctx));
    roads.push(new road(300, 80, 30, 140, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, 2, undefined, undefined, ctx));

    roads.push(new road(300, 250, 30, 80, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, 2, undefined, undefined, ctx));

    // roads.push(new road(300, 360, 30, 60, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, 2, undefined, {options: [Globals.LEFT_TAG, Globals.FORWARD_TAG], margin: 10, type: Globals.ROAD_TAG, num_lanes: 1, dir: 1}, ctx));
    roads.push(new road(300, 360, 30, 60, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, 2, undefined, {options: [Globals.LEFT_TAG], margin: 10, type: Globals.ROAD_TAG, num_lanes: 1, dir: 1}, ctx));

    roads.push(new road(300, 420, 30, 130, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, 2, undefined, {options: roadOptions, margin: 0, type: Globals.ROAD_TAG, num_lanes: 1, dir: 1}, ctx));

      // right

    roads.push(new road(400, 0, 30, 120, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, 2, {options: roadOptions, margin: 0, type: Globals.ROAD_TAG, num_lanes: 1, dir: 1}, undefined, ctx));
    // roads.push(new road(400, 120, 30, 100, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, 2, {options: [Globals.LEFT_TAG, Globals.FORWARD_TAG], margin: 25, type: Globals.ROAD_TAG, num_lanes: 1, dir: 1}, undefined, ctx));
    roads.push(new road(400, 120, 30, 100, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, 2, {options: [Globals.LEFT_TAG], margin: 25, type: Globals.ROAD_TAG, num_lanes: 1, dir: 1}, undefined, ctx));

    roads.push(new road(400, 250, 30, 80, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, 2, undefined, undefined, ctx));

      // traffic light
    // roads.push(new road(400, 360, 30, 120, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, 2, {options: roadOptions, margin: 0, type: Globals.ROAD_TAG, num_lanes: 1, dir: 0}, undefined, ctx));
    roads.push(new road(400, 360, 30, 120, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, 2, undefined, undefined, ctx));

    // roads.push(new road(400, 480, 30, 70, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, 2, {options: [Globals.LEFT_TAG, Globals.FORWARD_TAG], margin: 15, type: Globals.ROAD_TAG, num_lanes: 1, dir: 0}, {options: roadOptions, margin: 0, type: Globals.START_ROAD_TAG, num_lanes: 1, dir: 1}, ctx));

    roads.push(new road(400, 480, 30, 70, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, 2, {options: [Globals.FORWARD_TAG], margin: 15, type: Globals.ROAD_TAG, num_lanes: 1, dir: 0}, {options: roadOptions, margin: 0, type: Globals.START_ROAD_TAG, num_lanes: 1, dir: 1}, ctx));

    //// left verticale roads
    roads.push(new road(170, 330, 30, 100, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, 2, {options: [Globals.RIGHT_TAG], margin: 35, type: Globals.ROAD_TAG, num_lanes: 1, dir: 0}, undefined, ctx));
    roads.push(new road(170, 430, 30, 120, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, 2, undefined, {options: roadOptions, margin: 0, type: Globals.START_ROAD_TAG, num_lanes: 1, dir: 1}, ctx));

    roads.push(new road(50, 250, 30, 180, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, 2, undefined, {options: [Globals.FORWARD_TAG, Globals.LEFT_TAG], margin: 0, type: Globals.ROAD_TAG, num_lanes: 2, dir: 1}, ctx));
    roads.push(new road(50, 430, 30, 120, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, 2, undefined, {options: roadOptions, margin: 0, type: "", num_lanes: 1, dir: 1}, ctx));

    //// middle Horizontal u-turn
    roads.push(new road(330, 80, 70, 30, Globals.ROAD_COLOR, Globals.HORIZONTAL_TAG, 1, undefined, {options: [Globals.LEFT_TAG], margin: -20, type: Globals.U_TURN_TAG, num_lanes: 1, dir: 1}, ctx));
    roads.push(new road(330, 110, 70, 30, Globals.ROAD_COLOR, Globals.HORIZONTAL_TAG, 1, {options: [Globals.LEFT_TAG], margin: 20, type: Globals.U_TURN_TAG, num_lanes: 1, dir: 1}, undefined, ctx));

    roads.push(new road(330, 430, 70, 30, Globals.ROAD_COLOR, Globals.HORIZONTAL_TAG, 1, undefined, {options: [Globals.LEFT_TAG], margin: -20, type: Globals.U_TURN_TAG, num_lanes: 1, dir: 1}, ctx));
    roads.push(new road(330, 460, 70, 30, Globals.ROAD_COLOR, Globals.HORIZONTAL_TAG, 1, {options: [Globals.LEFT_TAG], margin: 20, type: Globals.U_TURN_TAG, num_lanes: 1, dir: 1}, undefined, ctx));

    //// left horizontal u-turn
    roads.push(new road(80, 430, 90, 30, Globals.ROAD_COLOR, Globals.HORIZONTAL_TAG, 1, undefined, {options: [Globals.LEFT_TAG], margin: -20, type: Globals.U_TURN_TAG, num_lanes: 1, dir: 1}, ctx));
    roads.push(new road(80, 460, 90, 30, Globals.ROAD_COLOR, Globals.HORIZONTAL_TAG, 1, undefined, {options: [Globals.LEFT_TAG], margin: 0, type: Globals.U_TURN_TAG, num_lanes: 1, dir: 1}, ctx));

    //// right verticale u-turn
    roads.push(new road(635, 250, 30, 80, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, 1, undefined, {options: [Globals.LEFT_TAG], margin: 0, type: Globals.U_TURN_TAG, num_lanes: 1, dir: 1}, ctx));
    roads.push(new road(605, 250, 30, 80, Globals.ROAD_COLOR, Globals.VERTICALE_TAG, 1, undefined, {options: [Globals.LEFT_TAG], margin: -60, type: Globals.U_TURN_TAG, num_lanes: 1, dir: 1}, ctx));

    // start road
    // we are adding the start_roads colliders only to this array
    // we use it to generate cars so we do not need all the roads
    // we loop over the roads array and check if the collider is a start_road collider

    start_roads = new Array();
    for(var i=0 ; i<roads.length ; i++){
      for(var j=0 ; j<roads[i].options.length ; j++){
        if(roads[i].options[j] !== undefined && roads[i].options[j].type == Globals.START_ROAD_TAG){
          // start_roads.push({x: roads[i].x, y: roads[i].y, width: roads[i].width, height: roads[i].height, orient: roads[i].orient});
          start_roads.push(roads[i]);
        }
      }
    }

    // Adding cars
    cars = generateCars(start_roads, n_cars, ctx);

    // Creating collidiers
    colliders = new Array();
    // Adding cars collidiers
    for(var i=0; i<cars.length ; i++){
      colliders.push(cars[i]);
    }
    // roads start and end
    for(var i=0 ; i<roads.length ; i++){
      for(var j=0 ; j<roads[i].options.length ; j++){
          if(roads[i].options[j] !== undefined){
            colliders.push({collider: roads[i].colliders[j], type: Globals.ROAD_TAG, options: roads[i].options[j]});
          }
      }
    }

    interval = setInterval(mainLoop, Globals.FRAME_DELAY);

  });
  restart_b.on('click', function(e){
    console.log(e);
    if(interval != undefined)
      clearInterval(interval);
    interval = setInterval(mainLoop, Globals.FRAME_DELAY);
  });
  stop_b.on('click', function(e){
    console.log(e);
    clearInterval(interval);
  });

  // Main program loop all drawing happens here
  var mainLoop = function(){
    //clearing the canvas to draw again
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // count Time
    timer += timeScale;
    timer_elem.innerText = timer.toFixed(2);

    //update average waiting time
    if(numCarsOut != 0)
      avg_wait_time_elem.innerText = (totalWaitingTime/numCarsOut).toFixed(2);

    // update car count
    car_count_elem.innerText = cars.length;

    //draw grass
    // ctx.fillStyle = "#097090";
    // ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    //draw fountain image
    ctx.drawImage(img, 330, 255, 70, 70);

    //draw roads
    for(var i=0; i<roads.length ; i++){
      roads[i].draw();
    }
    //draw cars
    for(var i=0; i<cars.length ; i++){
      cars[i].draw();
    }

    // for(var i=0 ; i<intersections.length ; i++){
    //   for(var j=0; j<intersections[i].timers.length ; j++){
    //     intersections[i].timers[j] += timer_speed;
    //     // console.log("Traffic Light "+ j + ":" + intersections[i].timers[j]);
    //   }
    // }

    // Check if cars crossed the start line so it can start calculate collisions
    for(var i=0 ; i<cars.length ; i++){
      colRecord = false; //no collison record of any kind
      if(cars[i].crossedStartLine) //if car crossedStartLine no checks have to be done
        continue;
      for(var j=0 ; j<roads.length ; j++){ //loops over roads to check for collision with car i
          for(var k = 0 ; k<roads[j].colliders.length ; k++){ //loops over road start and end colliders to check collision with car i
            if(roads[j].colliders[k] === undefined)
              continue;
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
      if(cars[i].crossedStartLine)
        cars[i].timer += timeScale;
      for(var j=0; j<colliders.length ; j++){
          response = new SAT.Response();
          collision = SAT.testPolygonPolygon(cars[i].collider.toPolygon(), colliders[j].collider.toPolygon(), response);

          // there are 3 reasons to neglect detected collisions
          // if i == j this means i am checking collision against my own self
          // if still not crossed start line and collideded with a road. to ignore start road Collision
          // if collideded with a car from behind so ignore that
          if((i==j) ||
             (colliders[j].type == Globals.CAR_TAG && !cars[i].car_in_front(colliders[j].collider)) ||
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
                  // console.log(option);
                  ////////////
                }
              }else if(colliders[j].type == Globals.CAR_TAG){
                if(!cars[i].reducedSpeed && cars[i].car_in_front(colliders[j].collider)){
                  cars[i].previousAcc = .9*cars[i].acc;
                  cars[i].acc = .75*cars[j].acc;
                  // cars[i].acc = .1;

                  cars[i].reducedSpeed = true;
                }
                // cars[i].acc = 0;
                // cars[i].n_carCollisions++;
                // console.log("cars::"+i+":"+cars[i].car_in_front(colliders[j].collider));
                // console.log(colliders[j].collider.pos.x, cars[i].x);
              }else if(colliders[j].type == Globals.ROAD_TAG){
                // cars[i].acc = 0;

                var optionIndex = Math.floor(Math.random() * colliders[j].options.options.length);
                var option = colliders[j].options.options[optionIndex];
                // console.log(option, optionIndex, colliders[j].options.options.length);
                if(option == Globals.END_TAG){
                  totalWaitingTime += cars[i].timer;
                  numCarsOut++;
                  colliders.splice(i, 1);
                  cars.splice(i, 1);
                }else if(option == Globals.FORWARD_TAG){
                  cars[i].crossedStartLine = false;
                  cars[i].option = undefined;
                }else if(option == Globals.STOP_TAG){
                  // cars[i].acc = 0;
                }else{
                  cars[i].crossedStartLine = false;
                  cars[i].option = option;
                  cars[i].currentCollision = colliders[j].options.num_lanes;
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
      // if(!cars[i].crossedStartLine && cars[i].n_carCollisions == 1){
      //   cars[i].neglectCarCollision = true;
      //   noCollisions = true;
      // }else{
      //   cars[i].neglectCarCollision = false;
      // }

      if(cars[i].reducedSpeed){
        // console.log(cars[i].acc);
        cars[i].holdOutTime += timeScale;
        if(cars[i].holdOutTime > 2){
          cars[i].holdOutTime = 0;
          cars[i].reducedSpeed = false;
        }
      }

      if(noCollisions && !cars[i].reducedSpeed){
        cars[i].acc = cars[i].previousAcc;
      }
      if(cars[i].crossedStartLine && cars[i].option !== undefined){
        cars[i].change_lane(cars[i].option);
        cars[i].option = undefined;
        if(cars[i].lane_index == 0)
          cars[i].lane_index = 1;
        else if(cars[i].lane_index == 1)
          cars[i].lane_index = 0;
      }
    }
    ////////////


    // Drawing collidiers
    drawColliders(colliders, ctx);

  };


});
