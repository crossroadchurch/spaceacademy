var stars;
var myFont;
var unitSize;

function preload() {
  myFont = loadFont('files/assets/FINALOLD.TTF');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  stars = new Array(400);
  for(var i=0; i<stars.length; i++){
    stars[i] = new Star();
  }  
  unitSize = height / 15;
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  unitSize = height / 15;
}

function draw() {
  background(0);
  fill(255);
  noStroke();
  push();
  translate(width/2, height/2);
  for(var i=0; i<stars.length; i++){
    stars[i].update();
    stars[i].show();
  }
  pop();

  fill(252,168,92);
  ellipse(unitSize, height-unitSize, unitSize, unitSize);
  rect(unitSize,height-(1.5*unitSize), unitSize, unitSize);
  ellipse(width-unitSize, height-unitSize, unitSize, unitSize);
  rect(7*unitSize, height-(1.5*unitSize), width-8*unitSize, unitSize);
  
  fill(186,218,255);
  textFont(myFont);
  textSize(unitSize);
  text('USS INTREPID', 2.5*unitSize, height-0.65*unitSize);
}