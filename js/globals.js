var Globals = function(){
  this.VERTICALE_TAG = "verticale";
  this.HORIZONTAL_TAG = "horizontal";
  this.RIGHT_TAG = "right"; // means i am heading right
  this.LEFT_TAG = "left"; // means i am heading left
  this.UP_TAG = "up"; // means i am heading up
  this.DOWN_TAG = "down"; // means i am heading down
  this.ROAD_TAG = "road"; // tag for road collider
  this.START_ROAD_TAG = "start_road"; // tag for start of the road collider
  this.CURVE_TAG = "curve";
  this.U_TURN_TAG = "u_turn";
  this.CAR_TAG = "car";
  this.TRAFFIC_LIGHT_TAG = "traffic_light";
  this.FORWARD_TAG = "forward";
  this.STOP_TAG = "stop";
  this.END_TAG = "end";
  this._TAG = "";
  this.FRAME_DELAY = 1000/60;
  this.COLLIDER_COLOR = "#00AAAA";
  this.START_COLLIDER_COLOR = "#AAF000";
  this.TRAFFIC_LIGHT_COLOR = "#FF0000";
  this.ROAD_COLOR = "#000";
};

var Globals = new Globals();
