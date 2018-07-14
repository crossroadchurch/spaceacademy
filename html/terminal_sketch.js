var unitSize;
var mode;
var myFont;
var beeps;
var activeAreas;

function preload() {
  myFont = loadFont('files/assets/FINALOLD.TTF');
  beeps = [];
  beeps.push(loadSound('files/assets/beep1.wav'));
  beeps.push(loadSound('files/assets/beep2.wav'));
  beeps.push(loadSound('files/assets/beep3.wav'));
  beeps.push(loadSound('files/assets/beep4.wav'));
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  mode = -1;
  gridX = width / 10;
  gridY = height / 15;
  activeAreas = [];
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  gridX = width / 10;
  gridY = height / 15;
}

function mousePressed(){
  for (var i=0; i<activeAreas.length; i++){
    activeAreas[i].detectClick(mouseX, mouseY);
  }
}

function beep(){
  var n = Math.floor(Math.random() * beeps.length);
  beeps[n].play();
}

function draw() {
  background(0);
  fill(255);
  noStroke();
  
  switch(mode) {
    case 0:
      // Default screen, buttons make beeps, no actions though
      // Footer
      fill(252,168,92);
      ellipse(gridX, height-gridY, gridX, gridY);
      rect(gridX, height-1.5*gridY, 0.5*gridX, gridY);
      ellipse(width-gridX, height-gridY, gridX, gridY);
      rect(4.9*gridX, height-1.5*gridY, 4.1*gridX, gridY);
      fill(186,218,255);
      textFont(myFont);
      textSize(gridY*0.70);
      text('INTREPID OPS', 1.75*gridX, height-0.75*gridY);

      // Enclosure
      fill(186,218,255); // Blue
      stroke(186,218,255); // Blue
      ellipse(gridX, gridY, gridX, gridY); // TL rounded
      ellipse(gridX, height-2.5*gridY, gridX, gridY); // BL rounded
      rect(gridX, gridY/2, width-2*gridX, 1.5*gridY); // Top bar
      rect(gridX, height-3.5*gridY, width-2*gridX, 1.5*gridY) // Bottom bar
      rect(gridX/2, gridY, gridX*2, height-3.5*gridY); // Left bar
      rect(2.5*gridX, 2*gridY, gridX/2, gridY/2); // TL insert
      rect(2.5*gridX, height-4*gridY, gridX/2, gridY/2); // BL insert
      fill(0);
      noStroke();
      ellipse(3*gridX+1, 2.5*gridY+1, gridX, gridY); // TL cutout
      ellipse(3*gridX+1, height-4*gridY, gridX, gridY); // BL cutout

      // Button tags
      fill(252,168,92);
      rect(3.25*gridX, 2.5*gridY, 0.5*gridX, 1.25*gridY); // Tag
      fill(240,218,255);
      rect(3.25*gridX, 4*gridY, 0.5*gridX, 1.25*gridY); // Tag
      fill(188,252,184);
      rect(3.25*gridX, 5.5*gridY, 0.5*gridX, 1.25*gridY); // Tag
      break;
    case 1:
      break;
  }

  for(var i=0; i<activeAreas.length; i++){
    activeAreas[i].show();
  }
}

function pollTerminal(){
  $.getJSON(
    "/pollTerminal",
    function (data, status){
      if(data.mode != mode){
        mode = data.mode;
        switch(mode) {
          case 0:
            activeAreas = [];
            activeAreas.push(new ActiveArea(4*gridX, 2.5*gridY, width-5.5*gridX, 1.25*gridY, color(252,168,92), "beep"));
            activeAreas.push(new ActiveArea(4*gridX, 4*gridY, width-5.5*gridX, 1.25*gridY, color(240,218,255), "beep"));
            activeAreas.push(new ActiveArea(4*gridX, 5.5*gridY, width-5.5*gridX, 1.25*gridY, color(188,252,184), "beep"));
            activeAreas.push(new ActiveArea(4*gridX, 7.5*gridY, 1.25*gridX, 3*gridY, color(252,252,124), "beep"));
            activeAreas.push(new ActiveArea(5.5*gridX, 7.5*gridY, 1.25*gridX, 3*gridY, color(186,218,255), "beep"));
            activeAreas.push(new ActiveArea(7*gridX, 7.5*gridY, 1.25*gridX, 3*gridY, color(240,218,255), "beep"));
        }
      }
      
    }
  );
}

$.ajaxSetup({ cache: false });
setInterval("pollTerminal();", 500);
