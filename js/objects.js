var car = function(x, y, width, height, accelration, color, orientation, direction, ctx){

  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.acc = accelration;
  this.previousAcc = this.acc;
  this.orient = orientation;
  this.dir = direction;
  this.color = color;
  this.ctx = ctx;
  this.type = "car";
  this.id = 0;
  this.collider = new SAT.Box(new SAT.Vector(this.x, this.y), this.width, this.height);

  this.draw =  function(){

    if(this.orient === "V"){
      this.ctx.fillStyle = this.color;
      this.ctx.fillRect(this.x + this.width/2, this.y, this.width, this.height);

      this.ctx.fillStyle = "rgba(0,0,0, .5)";
      this.ctx.fillRect(this.x + this.width/2, this.y+this.height/3, this.width, this.height/2.5);
    }else if(this.orient === "H"){
      this.ctx.fillStyle = this.color;
      this.ctx.fillRect(this.x, this.y + this.width/2, this.height, this.width);

      this.ctx.fillStyle = "rgba(0,0,0, .5)";
      this.ctx.fillRect(this.x+this.height/4, this.y + this.width/2, this.height/2.5, this.width);
    }

  };


  this.change_lane = function(dir){
    var dx = 40;
    var dy = 50;
    if(this.orient == "V"){
      this.orient = "H";
      if(this.dir == "d"){
        if(dir == "r"){
          this.y += dy+50;
          this.x -= dx+dx/2;
          this.acc = -this.acc;
          this.dir = "r";
        }else if(dir == "l"){
          this.y += dy-10;
          this.x += 2*dx+dx/4;
          this.acc = this.acc;
          this.dir = "l";
        }
      }else if(this.dir == "u"){
        if(dir == "r"){
          this.y -= dy+30;
          this.x += dx;
          this.acc = -this.acc;
          this.dir = "r";
        }else if(dir == "l"){
          this.y -= dy-dy/3;
          this.x -= 2*dx;
          this.acc = this.acc;
          this.dir = "l";
        }
      }
    }else if(this.orient == "H"){
      this.orient = "V";
      if(this.dir == "r"){
        if(dir == "r"){
          this.y += 2*dy;
          this.x += dx/4;
          this.acc = this.acc;
          this.dir = "d";
        }else if(dir == "l"){
          this.y -= dy+dy/4 ;
          this.x += 2*dx-dx/6;
          this.acc = -this.acc;
          this.dir = "u";
        }
      }else if(this.dir == "l"){
        if(dir == "r"){
          this.y -= 2*dy+dy/4;
          this.x -= dx;
          this.acc = this.acc;
          this.dir = "u";
        }else if(dir == "l"){
          this.y += dy ;
          this.x -= 2*dx+dx/5;
          this.acc = -this.acc;
          this.dir = "d";
        }
      }

    }
  };

  this.move = function(){
    if(this.orient == "V"){
      this.y += this.acc;
      this.collider.pos.y = this.y;
    }else if(this.orient == "H"){
      this.x += this.acc;
      this.collider.pos.x = this.x;
    }
  };

};


var road = function(x, y, width, height, color, orientation, ctx){

  this.x = x;
  this.y = y;
  this.orient = orientation;
  this.color = color;
  this.ctx = ctx;
  this.colliderW = 10;
  if(this.orient == "H"){
    this.width = ctx.canvas.width;
    this.height = height;
    this.startCollider = new SAT.Box(new SAT.Vector(this.x, this.y), this.colliderW, this.height);
    this.endCollider = new SAT.Box(new SAT.Vector(this.width-this.colliderW, this.y), this.colliderW, this.height);
  }else if(this.orient == "V"){
    this.width = width;
    this.height = ctx.canvas.height;
    this.startCollider = new SAT.Box(new SAT.Vector(this.x, this.y), this.width, this.colliderW);
    this.endCollider = new SAT.Box(new SAT.Vector(this.x, this.height-this.colliderW), this.width, this.colliderW);
  }

  this.draw = function(){

      if(this.orient === "H"){
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);

        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.fillRect(this.x, this.y+this.height/2-this.height/40, this.width, this.height/20);
      }else if(this.orient === "V"){
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);

        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.fillRect(this.x+this.width/2-this.width/40, this.y, this.width/20, this.height);
      }

  };

};

var drawColliders = function(colliders, ctx){
  // Drawing collidiers
  for(var i=0; i<colliders.length ; i++){
    ctx.strokeStyle = "#FF0000";
    if(colliders[i].orient == "V"){
      ctx.strokeRect(colliders[i].collider.pos.x+colliders[i].collider.w/2, colliders[i].collider.pos.y, colliders[i].collider.w, colliders[i].collider.h);
    }else if(colliders[i].orient == "H"){
      ctx.strokeRect(colliders[i].collider.pos.x, colliders[i].collider.pos.y+colliders[i].collider.h/5, colliders[i].collider.h, colliders[i].collider.w);
    }else{
      ctx.strokeRect(colliders[i].collider.pos.x, colliders[i].collider.pos.y, colliders[i].collider.w, colliders[i].collider.h);
    }
  }
};
