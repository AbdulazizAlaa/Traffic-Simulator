$(document).ready(function(){

  // Getting canvas reference
  var canvas = $("#traffic-canvas")[0];
  var ctx = canvas.getContext("2d");

  $("#traffic-canvas").click(function(e){
    console.log("x: "+e.offsetX, "y: "+e.offsetY);
  });

  // Adding cars
  var cars = new Array();
  cars.push(new car(100, 20, 20, 50, .05, "#fff000", "V", "d", ctx));
  cars.push(new car(100, 80, 20, 50, .01, "#fff000", "V", "d", ctx));
  cars.push(new car(400, 150, 20, 50, -.05, "#000fff", "H", "l", ctx));
  cars.push(new car(150, 400, 20, 50, -.05, "#0afddd", "V", "u", ctx));
  cars.push(new car(10, 100, 20, 50, 0.5, "#a213aa", "H", "r", ctx));

  // Adding roads
  var roads = new Array();
  roads.push(new road(100, 0, 80, 50, "#000", "V", ctx));
  roads.push(new road(0, 100, 50, 80, "#000", "H", ctx));

  // Creating collidiers
  var colliders = new Array();
  var tempCollider;
  // Adding cars collidiers
  for(var i=0; i<cars.length ; i++){
    // colliders.push(cars[i]);
    colliders.push({collider: cars[i].collider, type: "car", orient: cars[i].orient});
  }
  // roads start and end
  for(var i=0 ; i<roads.length ; i++){
    colliders.push({collider: roads[i].startCollider, type: "road"});
    colliders.push({collider: roads[i].endCollider, type: "road"});
  }
  // Interection
  tempCollider = new SAT.Box(new SAT.Vector(100, 100), 80, 80);
  colliders.push({collider: tempCollider, type: "intersection", timer: 0});



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

    cars[0].move();
    cars[1].move();
    // c1.pos.x = cars[0].x;c1.pos.y = cars[0].y;c1.w = cars[0].width;c1.h = cars[0].height;
    // c2.pos.x = cars[1].x;c2.pos.y = cars[1].y;c2.w = cars[1].width;c2.h = cars[1].height;
    // if(SAT.testPolygonPolygon(c1.toPolygon(), c2.toPolygon(), new SAT.Response())){
    //   console.log("collision");
    // }

    // for(var i=0 ; i<collidiers.length ; i++){
    //   if(collidiers[i].type == "intersection"){
    //
    //     // if(collidiers[i].timer > 100 && collidiers[i].timer < 200){
    //     //   console.log("end");
    //     //   // collidiers[i].timer = 0;
    //     // }else
    //     if(collidiers[i].timer < 200){
    //       collidiers[i].timer += 1;
    //       // console.log(collidiers[i].timer);
    //     }else{
    //       collidiers[i].timer = 0;
    //     }
    //   }
    // }

    // Detect collision
    // for(var i=0; i<cars.length ; i++){
    //   for(var j=0; j<collidiers.length ; j++){
    //       if(!cars[i].collision(collidiers[j])){
    //         cars[i].move();
    //       }else{
    //         // cars[i].acc = 0;
    //         if(collidiers[j].type == "intersection")
    //           {
    //             cars[i].change_lane("r");
    //             if(collidiers[j].timer > 0 && collidiers[j].timer < 200){
    //               console.log("intersection");
    //               // cars[i].acc = 0;
    //               // cars[i].x -= 40;
    //               // cars[i].y -= 20;
    //
    //             }else{
    //               // cars[i].acc = cars[i].previousAcc;
    //             }
    //           }else{
    //             cars[i].acc = 0;
    //           }
    //
    //       }
    //   }
    // }

    // Drawing collidiers
    drawColliders(colliders, ctx);

  };

  setInterval(mainLoop, 1000/60);

});
