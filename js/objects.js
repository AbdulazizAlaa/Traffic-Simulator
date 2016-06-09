var car = function(x, y, width, height, accelration, color, orientation, direction, options, lane, ctx){

  this.x = x;
  this.y = y;
  this.acc = accelration;
  this.previousAcc = this.acc;
  this.orient = orientation;
  this.dir = direction;
  this.color = color;
  this.ctx = ctx;
  this.type = Globals.CAR_TAG;
  this.id = 0;
  this.options = options;
  this.crossedStartLine = false; // true when car crosses the start line indecating that collisions with roads are valid
  this.startedCrossing = false; // true if the car is collideded with a road and it is still not crosssed start line
  this.neglectCarCollision = false; //true if you want to neglect any car collisions with this car
  this.n_carCollisions = 0; // number of cars collideded with this car
  this.timer = 0;
  this.lane_index = lane;
  this.option = undefined;
  this.currentCollision = undefined;
  this.reducedSpeed = false;
  this.holdOutTime = 0;

  if(this.orient === Globals.VERTICALE_TAG){
    this.width = width;
    this.height = height;
    this.x_offset = 0; // car batch offset from car original x
    this.y_offset = this.height/3; // car batch offset from car original y
    this.batch_w = this.width; // car batch width as a ratio from car original width
    this.batch_h = this.height/2.5; // car batch height as a ratio from car original height
  }else if(this.orient === Globals.HORIZONTAL_TAG){
    this.width = height;
    this.height = width;
    this.x_offset = this.width/3;
    this.y_offset = 0;
    this.batch_w = this.width/2.5;
    this.batch_h = this.height;
  }
  this.collider = new SAT.Box(new SAT.Vector(this.x, this.y), this.width, this.height);


  this.draw =  function(){
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x, this.y, this.width, this.height);

    this.ctx.fillStyle = "rgba(0,0,0, .5)";
    this.ctx.fillRect(this.x+this.x_offset, this.y+this.y_offset, this.batch_w, this.batch_h);
  };

  this.set_orient = function(orient){
    this.orient = orient;
    temp_w = this.width;
    if(orient === Globals.HORIZONTAL_TAG){
      this.width = this.height;
      this.height = temp_w;
      this.x_offset = this.width/3;
      this.y_offset = 0;
      this.batch_w = this.width/2.5;
      this.batch_h = this.height;
    }else if(orient === Globals.VERTICALE_TAG){
      this.width = this.height;
      this.height = temp_w;
      this.x_offset = 0;
      this.y_offset = this.height/3;
      this.batch_w = this.width;
      this.batch_h = this.height/2.5;
    }
    this.collider = new SAT.Box(new SAT.Vector(this.x, this.y), this.width, this.height);
  };


  this.car_in_front = function(collider){
    var isInFront = false;
    if(this.orient == Globals.HORIZONTAL_TAG){
      if(this.dir == Globals.RIGHT_TAG){
        isInFront = collider.pos.x > this.x;
      }else if(this.dir == Globals.LEFT_TAG){
        isInFront = this.x > collider.pos.x;
      }
    }else if(this.orient == Globals.VERTICALE_TAG){
      if(this.dir == Globals.UP_TAG){
        isInFront = collider.pos.y > this.y;
      }else if(this.dir == Globals.DOWN_TAG){
        isInFront = this.y > collider.pos.y;
      }
    }
    return isInFront;
  };


  this.change_lane = function(dir, lane_index){
    var dx = 15;
    var dy = 20;
    var num_lanes = this.currentCollision;

    if(this.orient == Globals.VERTICALE_TAG){
      this.set_orient(Globals.HORIZONTAL_TAG);
      if(this.dir == Globals.DOWN_TAG){
        if(dir == Globals.RIGHT_TAG){
          this.y += 2*dy+dy/4;
          this.x -= dx+dx/2;

          this.acc = -this.acc;
          this.dir = Globals.LEFT_TAG;
        }else if(dir == Globals.LEFT_TAG){
          this.x += (num_lanes-1)*dx+this.lane_index*(num_lanes-1)*1*dx;

          this.acc = this.acc;
          this.dir = Globals.RIGHT_TAG;
        }
      }else if(this.dir == Globals.UP_TAG){
        if(dir == Globals.RIGHT_TAG){
          this.y += .8*dy-this.lane_index*(num_lanes-1)*.8*dy;
          this.x += dx/4+this.lane_index*dx;

          this.acc = -this.acc;
          this.dir = Globals.RIGHT_TAG;
        }else if(dir == Globals.LEFT_TAG){
          this.y -= this.lane_index*(num_lanes-1)*.8*dy;
          this.x -= 2*dx+this.lane_index*1*dx;

          this.acc = this.acc;
          this.dir = Globals.LEFT_TAG;
        }
      }
    }else if(this.orient == Globals.HORIZONTAL_TAG){
      this.set_orient(Globals.VERTICALE_TAG);
      if(this.dir == Globals.RIGHT_TAG){
        if(dir == Globals.RIGHT_TAG){
          this.y += 2*dy;
          this.x += 2*dx-dx/3;

          this.acc = this.acc;
          this.dir = Globals.DOWN_TAG;
        }else if(dir == Globals.LEFT_TAG){
          this.y -= 1.7*dy+this.lane_index*(num_lanes-1)*.8*dy ;
          this.x += 1.3*dx;

          this.acc = -this.acc;
          // this.acc = 0;
          this.dir = Globals.UP_TAG;
        }
      }else if(this.dir == Globals.LEFT_TAG){
        if(dir == Globals.RIGHT_TAG){
          this.y -= 2*dy+dy/4;
          this.x -= dx;

          this.acc = this.acc;
          this.dir = Globals.UP_TAG;
        }else if(dir == Globals.LEFT_TAG){
          this.y += dy+this.lane_index*.7*dy;
          this.x += this.lane_index*(num_lanes-1)*dx;

          this.acc = -this.acc;
          this.dir = Globals.DOWN_TAG;
        }
      }

    }
    this.collider.pos.y = this.y;
    this.collider.pos.x = this.x;
    this.previousAcc = this.acc;
  };

  this.move = function(){
    if(this.orient == Globals.VERTICALE_TAG){
      this.y += this.acc;
      this.collider.pos.y = this.y;
    }else if(this.orient == Globals.HORIZONTAL_TAG){
      this.x += this.acc;
      this.collider.pos.x = this.x;
    }
  };

};


var road = function(x, y, width, height, color, orientation, num_lanes, start_options, end_options, ctx){

  this.x = x;
  this.y = y;
  this.orient = orientation;
  this.color = color;
  this.ctx = ctx;
  this.colliderW = 2;
  this.colliders = new Array();
  this.carCount = [1, 1]; // number of cars generated in each road
  this.options = [start_options, end_options];
  this.num_lanes = num_lanes;

  if(this.orient == Globals.HORIZONTAL_TAG){
    this.width = (width==0)? (ctx.canvas.width - this.x) : width; // lw el width ewaul zero yb2a ana 3awz el width bta3 el canvas same with height
    this.height = height;
    if(this.num_lanes == 1)
      this.height /= 2;

    if(this.options[0] !== undefined) // if the options is undefined means i don't want to create a collider
      this.colliders.push(new SAT.Box(new SAT.Vector(this.x+this.options[0].margin, this.y), this.colliderW, this.height));
    else
      this.colliders.push(undefined);

    if(this.options[1] !== undefined)
      this.colliders.push(new SAT.Box(new SAT.Vector(this.x+this.width-this.colliderW+this.options[1].margin, this.y), this.colliderW, this.height));
  }else if(this.orient == Globals.VERTICALE_TAG){
    this.width = width;
    this.height = (height==0)? (ctx.canvas.height - this.y) : height;
    if(this.num_lanes == 1)
      this.width /= 2;

    if(this.options[0] !== undefined)
      this.colliders.push(new SAT.Box(new SAT.Vector(this.x, this.y+this.options[0].margin), this.width, this.colliderW));
    else
      this.colliders.push(undefined);

    if(this.options[1] !== undefined)
      this.colliders.push(new SAT.Box(new SAT.Vector(this.x, this.y+this.height-this.colliderW+this.options[1].margin), this.width, this.colliderW));
  }

  this.draw = function(){
      if(this.orient == Globals.HORIZONTAL_TAG){
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);

        if(this.num_lanes == 2){
          this.ctx.fillStyle = "#FFFFFF";
          this.ctx.fillRect(this.x, this.y+this.height/2-this.height/40, this.width, this.height/20);
        }
      }else if(this.orient == Globals.VERTICALE_TAG){
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);

        if(this.num_lanes == 2){
          this.ctx.fillStyle = "#FFFFFF";
          this.ctx.fillRect(this.x+this.width/2-this.width/40, this.y, this.width/20, this.height);
        }

      }

  };

};

var intersection = function(x, y, width, height, thickness, options){
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.thickness = thickness;
  this.timers = [0, 350, 0, 350];
  this.options = options;

  this.traffic_lights = new Array();

  this.traffic_lights.push(new SAT.Box(new SAT.Vector(this.x+this.thickness, this.y-this.thickness), this.width/2-2*this.thickness, this.thickness));
  this.traffic_lights.push(new SAT.Box(new SAT.Vector(this.x-this.thickness, this.y+this.thickness), this.thickness, this.height/2-2*this.thickness));
  this.traffic_lights.push(new SAT.Box(new SAT.Vector(this.x+this.width/2+this.thickness, this.y+this.height), this.width/2-2*this.thickness, this.thickness));
  this.traffic_lights.push(new SAT.Box(new SAT.Vector(this.x+this.width, this.y+this.height/2+this.thickness), this.thickness, this.height/2-2*this.thickness));
};

var drawColliders = function(colliders, ctx){
  // Drawing collidiers
  for(var i=0; i<colliders.length ; i++){
    if(colliders[i].options !== undefined && colliders[i].options.type == Globals.START_ROAD_TAG)
      ctx.strokeStyle = Globals.START_COLLIDER_COLOR;
    else
      ctx.strokeStyle = Globals.COLLIDER_COLOR;
    if(colliders[i].orient == Globals.VERTICALE_TAG){
      ctx.strokeRect(colliders[i].collider.pos.x, colliders[i].collider.pos.y, colliders[i].collider.w, colliders[i].collider.h);
    }else if(colliders[i].orient == Globals.HORIZONTAL_TAG){
      ctx.strokeRect(colliders[i].collider.pos.x, colliders[i].collider.pos.y, colliders[i].collider.w, colliders[i].collider.h);
    }else{
      ctx.strokeRect(colliders[i].collider.pos.x, colliders[i].collider.pos.y, colliders[i].collider.w, colliders[i].collider.h);
    }
  }
};


var generateCars = function(roads, n_cars, ctx){
    var cars = new Array();
    var road_index, dir_index, color_index, orient, x, y, w, h, acc, dir;
    var car_w = 10;
    var car_h = 30;
    var distanceFactor = 1.5;
    var colorCodes = ["#DAF7A6", "#FFC300", "#FF5733", "#C70039", "#900C3F", "#581845"];
    var options = [];

    for(var i=0 ; i<n_cars ; i++){
      // get random number between 0 and roads array length indecating the desired road to generate car at
      road_index = Math.floor(Math.random() * roads.length);
      lane_index = Math.floor(Math.random() * 2);
      // lane_index = 0;
      // road_index = 0;
      // dir_index = 1;

      // this construct is called conditional ternary operator
      // we got the index of the road randomly to generate Car at
      // we want to get the direction of the road so we check if the first collider is not undefined and is a start_road if so
      // first collider is the start collider otherwise the second collider is the start collider
      dir_index = (roads[road_index].options[0] !== undefined && roads[road_index].options[0].type == Globals.START_ROAD_TAG) ? roads[road_index].options[0].dir : roads[road_index].options[1].dir;

      // get random number between 0 and colorCodes array length to choose the desired color to use for the car
      color_index = Math.floor(Math.random() * colorCodes.length)
      orient = roads[road_index].orient;
      x = roads[road_index].x;
      y = roads[road_index].y;
      w = roads[road_index].width;
      h = roads[road_index].height;
      acc = 1.5;
      // acc = Math.random()*.5+1;
      dir = "";

      if(orient === Globals.VERTICALE_TAG){
        if(dir_index === 0){
          // start of road
          dir = Globals.DOWN_TAG;
          x += w - 1.25*car_w - lane_index*1.5*car_w; //3shan azbot el car f nos el road.
          y += car_h/4 - (roads[road_index].carCount[dir_index] * distanceFactor * car_h);
        }else if(dir_index === 1){
          // end of road
          dir = Globals.UP_TAG;
          x += .25*car_w + lane_index*1.5*car_w;
          y += h - 1.25*car_h + (roads[road_index].carCount[dir_index] * distanceFactor * car_h);
          acc = -1*acc;
        }

      }else if(orient === Globals.HORIZONTAL_TAG){
        if(dir_index === 0){
          // start of road
          dir = Globals.RIGHT_TAG;
          x += 3*car_w/4  - (roads[road_index].carCount[dir_index] * distanceFactor * car_h);
          y += h - 1.25*car_w;
        }else if(dir_index === 1){
          // end of road
          dir = Globals.LEFT_TAG;
          x += w - 1.25*car_h + (roads[road_index].carCount[dir_index] * distanceFactor * car_h);
          y += h - 1.25*car_w;
          acc = -1*acc;
        }
        y -= lane_index*1.5*car_w;
      }

      roads[road_index].carCount[dir_index]++;
      cars.push(new car(x, y, car_w, car_h, acc, colorCodes[color_index], orient, dir, options, lane_index, ctx));
    }
    return cars;
};
