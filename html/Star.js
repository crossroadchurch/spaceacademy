class Star {

  constructor() {
    this.x = random(-width/2, width/2);
    this.y = random(-height/2, height/2);
    this.z = random(width/2);
    this.pz = this.z;
    this.orbit = true;
  }
  
  update(orbit, speed){
    if (orbit == true){
      if (this.orbit == false){
        
        this.x = 2 * this.canvas_x * this.z / width;
        this.y = 2 * this.canvas_y * this.z / height;
        this.orbit = true;
      }  
      this.z = this.z-speed;
      if (this.z<1){
        this.z = width/2;
        this.x = random(-width/2, width/2);
        this.y = random(-height/2, height/2);
        this.pz = this.z;
      }
      this.canvas_x = map(this.x / this.z, -1, 1, -width/2, width/2);
      this.canvas_y = map(this.y / this.z, -1, 1, -height/2, height/2);
      this.canvas_px = map(this.x / this.pz, -1, 1, -width/2, width/2);
      this.canvas_py = map(this.y / this.pz, -1, 1, -height/2, height/2);
      this.pz = this.z;
      this.canvas_r = map(this.z, 0, width/2, 6, 0);
    } else {
      this.orbit = orbit;
      /* screen distance d = 1000, star sphere distance r = 10000 */
      var d = 1000;
      var r = 1500;
      angleMode(RADIANS);
      var c = createVector(this.canvas_x, this.canvas_y, d);
      var u_c = c.normalize(); /* unit vector from origin to canvas (x,y) */
      var b = u_c.mult(r);
      var theta = radians(speed);
      var b_rot = createVector(b.x, (b.y*cos(theta))-(b.z*sin(theta)), (b.y*sin(theta))+(b.z*cos(theta)));
      this.canvas_x = (d * b_rot.x / b_rot.z);
      this.canvas_y = (d * b_rot.y / b_rot.z);
      if (this.canvas_y < (-height / 2)){
        this.canvas_y = -this.canvas_y;
      }
    }
  }


  show() {
    fill(255);
    noStroke();
    ellipse(this.canvas_x, this.canvas_y, this.canvas_r, this.canvas_r);
    /*if (this.orbit == true){
      stroke(255);
      line(this.canvas_x, this.canvas_y, this.canvas_px, this.canvas_py);
    }*/
  }
}