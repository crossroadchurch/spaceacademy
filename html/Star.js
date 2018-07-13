class Star {

  constructor() {
    this.x = random(-width/2, width/2);
    this.y = random(-height/2, height/2);
    this.z = random(width/2);
    this.pz = this.z;
  }
  
  update(){
    this.z = this.z-2;
    if (this.z<1){
      this.z = width/2;
      this.x = random(-width/2, width/2);
      this.y = random(-height/2, height/2);
      this.pz = this.z;
    }
  }
  
  show() {
    fill(255);
    noStroke();
    this.sx = map(this.x / this.z, 0, 1, 0, width/2);
    this.sy = map(this.y / this.z, 0, 1, 0, height/2);;
    this.r = map(this.z, 0, width/2, 6, 0);
    ellipse(this.sx, this.sy, this.r, this.r);
  
  }
}