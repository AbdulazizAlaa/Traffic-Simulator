var car = function(x, y, width, height, accelration, color, orientation, direction, options, ctx){

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
  this.crossedStartLine = false;
  this.startedCrossing = false;
  this.neglectCarCollision = false;
  this.n_carCollisions = 0;

  if(this.orient === Globals.VERTICALE_TAG){
    this.width = width;
    this.height = height;
    this.x_offset = 0;
    this.y_offset = this.height/3;
    this.batch_w = this.width;
    this.batch_h = this.height/2.5;
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


  this.change_lane = function(dir){
    var dx = 40;
    var dy = 50;
    if(this.orient == Globals.VERTICALE_TAG){
      this.set_orient(Globals.HORIZONTAL_TAG);
      if(this.dir == Globals.DOWN_TAG){
        if(dir == Globals.RIGHT_TAG){
          this.y += 2*dy+dy/4;
          this.x -= dx+dx/2;

          this.acc = -this.acc;
          this.dir = Globals.RIGHT_TAG;
        }else if(dir == Globals.LEFT_TAG){
          this.y += dy+dy/2;
          this.x += 2*dx;

          this.acc = this.acc;
          this.dir = Globals.LEFT_TAG;
        }
      }else if(this.dir == Globals.UP_TAG){
        if(dir == Globals.RIGHT_TAG){
          this.y -= dy+dy/2;
          this.x += dx;

          this.acc = -this.acc;
          this.dir = Globals.RIGHT_TAG;
        }else if(dir == Globals.LEFT_TAG){
          this.y -= dy-dy/3;
          this.x -= 2*dx;

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
          this.y -= dy+dy/4 ;
          this.x += 3*dx-dx/6;

          this.acc = -this.acc;
          this.dir = Globals.UP_TAG;
        }
      }else if(this.dir == Globals.LEFT_TAG){
        if(dir == Globals.RIGHT_TAG){
          this.y -= 2*dy+dy/4;
          this.x -= dx;

          this.acc = this.acc;
          this.dir = Globals.UP_TAG;
        }else if(dir == Globals.LEFT_TAG){
          this.y += dy ;
          this.x -= 2*dx;

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


var road = function(x, y, width, height, color, orientation, start_options, end_options, ctx){

  this.x = x;
  this.y = y;
  this.orient = orientation;
  this.color = color;
  this.ctx = ctx;
  this.colliderW = 10;
  this.colliders = new Array();
  this.carCount = [1, 1];
  this.options = [start_options, end_options];

  if(this.orient == Globals.HORIZONTAL_TAG){
    this.width = (width==0)? (ctx.canvas.width - this.x) : width;
    this.height = height;
    if(this.options[0] !== undefined)
      this.colliders.push(new SAT.Box(new SAT.Vector(this.x, this.y), this.colliderW, this.height));
    if(this.options[1] !== undefined)
      this.colliders.push(new SAT.Box(new SAT.Vector(this.x+this.width-this.colliderW, this.y), this.colliderW, this.height));
  }else if(this.orient == Globals.VERTICALE_TAG){
    this.width = width;
    this.height = (height==0)? (ctx.canvas.height - this.y) : height;
    if(this.options[0] !== undefined)
      this.colliders.push(new SAT.Box(new SAT.Vector(this.x, this.y), this.width, this.colliderW));
    if(this.options[1] !== undefined)
      this.colliders.push(new SAT.Box(new SAT.Vector(this.x, this.y+this.height-this.colliderW), this.width, this.colliderW));
  }

  this.draw = function(){
      if(this.orient == Globals.HORIZONTAL_TAG){
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);

        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.fillRect(this.x, this.y+this.height/2-this.height/40, this.width, this.height/20);
      }else if(this.orient == Globals.VERTICALE_TAG){
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);

        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.fillRect(this.x+this.width/2-this.width/40, this.y, this.width/20, this.height);
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
    var car_w = 20;
    var car_h = 50;
    var distanceFactor = 1.1;
    var colorCodes = ["#DAF7A6", "#FFC300", "#FF5733", "#C70039", "#900C3F", "#581845"];
    var options = [];

    for(var i=0 ; i<n_cars ; i++){
      // road_index = Math.floor(Math.random() * roads.length);
      // dir_index = Math.floor(Math.random() * 2);
      road_index = 0;
      dir_index = 0;
      color_index = Math.floor(Math.random() * colorCodes.length)
      orient = roads[road_index].orient;
      x = roads[road_index].x;
      y = roads[road_index].y;
      w = roads[road_index].width;
      h = roads[road_index].height;
      acc = 1;
      dir = "";

      if(orient === Globals.VERTICALE_TAG){
        if(dir_index === 0){
          // start of road
          dir = Globals.DOWN_TAG;
          x += car_w/2;
          y += car_h/4 - (roads[road_index].carCount[dir_index] * distanceFactor * car_h);
        }else if(dir_index === 1){
          // end of road
          dir = Globals.UP_TAG;
          x += w - 1.5*car_w;
          y += h - 1.25*car_h + (roads[road_index].carCount[dir_index] * distanceFactor * car_h);
          acc = -1*acc;
        }
      }else if(orient === Globals.HORIZONTAL_TAG){
        if(dir_index === 0){
          // start of road
          dir = Globals.RIGHT_TAG;
          x += 3*car_w/4  - (roads[road_index].carCount[dir_index] * distanceFactor * car_h);
          y += car_h/5;
        }else if(dir_index === 1){
          // end of road
          dir = Globals.LEFT_TAG;
          x += w - 1.25*car_h + (roads[road_index].carCount[dir_index] * distanceFactor * car_h);
          y += h - 1.5*car_w;
          acc = -1*acc;
        }
      }

      roads[road_index].carCount[dir_index]++;
      cars.push(new car(x, y, car_w, car_h, acc, colorCodes[color_index], orient, dir, options, ctx));
    }
    return cars;
};
