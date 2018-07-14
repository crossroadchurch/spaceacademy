var stars;
var myFont;
var unitSize;
var mode;

function preload() {
  myFont = loadFont('files/assets/FINALOLD.TTF');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  stars = new Array(400);
  mode = 0;
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

  if (mode == 0){
    fill(252,168,92);
    ellipse(unitSize, height-unitSize, unitSize, unitSize);
    rect(unitSize,height-(1.5*unitSize), unitSize, unitSize);
    ellipse(width-unitSize, height-unitSize, unitSize, unitSize);
    rect(7*unitSize, height-(1.5*unitSize), width-8*unitSize, unitSize);
  }
  if (mode ==1){
    fill(186,218,255);
    textFont(myFont);
    textSize(unitSize);
    text('USS INTREPID', 2.5*unitSize, height-0.65*unitSize);
  }
}

function pollDisplay(){
  $.getJSON(
    "/pollDisplay",
    function (data, status){
      mode = data.mode;
    }
  );
}

$.ajaxSetup({ cache: false });
setInterval("pollDisplay();", 500);
