var stars;
var myFont;
var unitSize;
var mode;
var jarvisSounds;
var warpUp, warpDown;
var curSoundId;
var curSound;
var fft;
var tick, subtick, slice;
var slices = [];
var mask;
var tileH = 300;
var transMax = 200;
var transCur = 200;
var transStep = 1;
var maxWarp = 12;
const MAIN_WARP = 0
const MAIN_ORBIT = 1
const MAIN_COMMS = 2
const MAIN_JARVIS = 3

function preload() {
  myFont = loadFont('files/assets/FINALOLD.TTF');
  jarvisJSON = loadJSON('files/assets/jarvis.json', loadJarvisSounds);
  warpUp = loadSound('files/assets/warp-up.mp3');
  warpDown = loadSound('files/assets/warp-down.wav');
  mask = loadImage('files/assets/planet_mask.png');
  slices.push(loadImage('files/assets/earthslice0.jpg'));  
  slices.push(loadImage('files/assets/earthslice1.jpg'));
  slices.push(loadImage('files/assets/earthslice2.jpg'));
  slices.push(loadImage('files/assets/earthslice3.jpg'));
  slices.push(loadImage('files/assets/earthslice4.jpg'));
  slices.push(loadImage('files/assets/earthslice5.jpg'));
  slices.push(loadImage('files/assets/earthslice6.jpg'));
  slices.push(loadImage('files/assets/earthslice7.jpg'));
  slices.push(loadImage('files/assets/earthslice8.jpg'));
  slices.push(loadImage('files/assets/earthslice9.jpg'));
  slices.push(loadImage('files/assets/earthslice10.jpg'));  
  slices.push(loadImage('files/assets/earthslice11.jpg'));
  slices.push(loadImage('files/assets/earthslice12.jpg'));
  slices.push(loadImage('files/assets/earthslice13.jpg'));
  slices.push(loadImage('files/assets/earthslice14.jpg'));
  slices.push(loadImage('files/assets/earthslice15.jpg'));
  slices.push(loadImage('files/assets/earthslice16.jpg'));
  slices.push(loadImage('files/assets/earthslice17.jpg'));
  slices.push(loadImage('files/assets/earthslice18.jpg'));
  slices.push(loadImage('files/assets/earthslice19.jpg'));
  slices.push(loadImage('files/assets/earthslice0.jpg'));  
}

function loadJarvisSounds(data) {
  jarvisSounds = new Array(data.sounds.length);
  for(var i=0; i<data.sounds.length; i++){
    console.log(data.sounds[i].filename);
    jarvisSounds[i] = loadSound(data.sounds[i].filename);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  stars = new Array(400);
  mode = 0;
  curSoundId = -1;
  for(var i=0; i<stars.length; i++){
    stars[i] = new Star();
  }  
  unitSize = height / 15;
  fft = new p5.FFT(0.7, 512);
  tick = 0;
  subtick = 0;
  slice = 0;
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  unitSize = height / 15;
}

function draw() {
  // Background layer - stars etc
  switch(mode){
    case MAIN_WARP:
      background(0);
      fill(255);
      noStroke();
      if (transCur < transMax){
        // MOVING FROM ORBIT TO WARP
        image(slices[slice+1], width/2 - 5*tileH, transCur+subtick+height-2*tileH, 10*tileH, tileH);
        image(slices[slice], width/2 - 5*tileH, transCur+subtick+height-tileH, 10*tileH, tileH);
        image(mask, 0, transCur, width, height);
        push();
        translate(width/2, height/2);
        // STARS AT WARP, WARP SPEED INCREASING TO MAXWARP
        for(var i=0; i<stars.length; i++){
          stars[i].update(true, maxWarp*transCur/transMax);
          if(dist(stars[i].canvas_x, stars[i].canvas_y, 0, (height/2)+(width*sqrt(2)))>(1.5*width)-transCur){
            stars[i].show();
          }
        }
        pop();
        transCur = transCur + transStep;
      } else {
        // AT WARP, NOT IN TRANSITION PERIOD
        push();
        translate(width/2, height/2);
        for(var i=0; i<stars.length; i++){
          stars[i].update(true, maxWarp);
          stars[i].show();
        }
        pop();
      }
      break;

    case MAIN_ORBIT:
      background(0);
      fill(255);
      noStroke();
      if (transCur > 0){
        // MOVING FROM WARP TO ORBIT
        image(slices[slice+1], width/2 - 5*tileH, transCur+subtick+height-2*tileH, 10*tileH, tileH);
        image(slices[slice], width/2 - 5*tileH, transCur+subtick+height-tileH, 10*tileH, tileH);
        image(mask, 0, transCur, width, height);
        
        push();
        translate(width/2, height/2);
        if (transCur > 20){
          // STARS AT WARP, WARP SPEED DECREASING TO 0, finishes 20 frames before end of transition period
          for(var i=0; i<stars.length; i++){
            stars[i].update(true, maxWarp*(transCur-20)/(transMax-20));
            if(dist(stars[i].canvas_x, stars[i].canvas_y, 0, (height/2)+(width*sqrt(2)))>(1.5*width)-transCur){
              stars[i].show();
            }
          }
        } else {
          // STARS IN ORBIT, ORBITAL SPEED INCREASING TO 0.1 for final 20 frames of transition period
          for(var i=0; i<stars.length; i++){
            stars[i].update(false, 0.1*(20-transCur)/20);
            if(dist(stars[i].canvas_x, stars[i].canvas_y, 0, (height/2)+(width*sqrt(2)))>(1.5*width)-transCur){
              stars[i].show();
            }
          }
        }
        pop();
        transCur = transCur-transStep;

      } else {
        // IN ORBIT, NOT IN WARP TRANSITION
        image(slices[slice+1], width/2 - 5*tileH, subtick+height-2*tileH, 10*tileH, tileH);
        image(slices[slice], width/2 - 5*tileH, subtick+height-tileH, 10*tileH, tileH);
        image(mask, 0, 0, width, height);
        
        push();
        translate(width/2, height/2);
        for(var i=0; i<stars.length; i++){
          stars[i].update(false, 0.1);
          if(dist(stars[i].canvas_x, stars[i].canvas_y, 0, (height/2)+(width*sqrt(2)))>(1.5*width)){
            stars[i].show();
          }
        }
        pop();
      }
      tick = (tick+1)%(20*tileH);
      subtick = tick % tileH;
      slice = floor(tick / tileH);
      break;

    case MAIN_JARVIS:
      angleMode(DEGREES);
      background(0);
      var spectrum = fft.analyze();
      var prop = 0.4;
      noStroke();
      translate(width / 2, height / 2);
      maxSpec = Math.floor(prop*spectrum.length);
      for (var i=0; i< maxSpec; i++){ // Only look at human voice area of spectrum
        var angle = map(i, 0, maxSpec, 0, 1080);
        var col1 = map(i, 0, maxSpec, 0, 127);
        var amp = spectrum[i];
        var a = map(amp, 0, 256, 0, 0.45*width);
        var b = map(amp, 0, 256, 0, 0.45*height);
        var x = a * cos(angle);
        var y = b * sin(angle);
        stroke(col1 , 255, 255);
        line(0, 0, x, y);
      }
      for (var i=maxSpec-1; i>=0; i--){ // Only look at human voice area of spectrum
        var angle = map(i, 0, maxSpec, 1080, 0);
        var col2 = map(i, 0, maxSpec, 128, 255);
        var amp = spectrum[i];
        var a = map(amp, 0, 256, 0, 0.45*width);
        var b = map(amp, 0, 256, 0, 0.45*height);
        var x = a * cos(angle);
        var y = b * sin(angle);
        stroke(col2, 255, 255);
        line(0, 0, x, y);
      }
  }

  // Foreground layer
  switch(mode){
    case MAIN_WARP:
      fill(252,168,92);
      ellipse(unitSize, unitSize, unitSize, unitSize);
      rect(unitSize,0.5*unitSize, unitSize, unitSize);
      ellipse(width-unitSize, unitSize, unitSize, unitSize);
      rect(7*unitSize, (0.5*unitSize), width-8*unitSize, unitSize);
      fill(186,218,255);
      textFont(myFont);
      textSize(unitSize);
      text('USS INTREPID', 2.5*unitSize, 1.35*unitSize);
      break;
    
    case MAIN_ORBIT:
      fill(252,168,92);
      ellipse(unitSize, unitSize, unitSize, unitSize);
      rect(unitSize,0.5*unitSize, unitSize, unitSize);
      ellipse(width-unitSize, unitSize, unitSize, unitSize);
      rect(7*unitSize, (0.5*unitSize), width-8*unitSize, unitSize);
      fill(186,218,255);
      textFont(myFont);
      textSize(unitSize);
      text('USS INTREPID', 2.5*unitSize, 1.35*unitSize);
      break;
  }

}

function pollDisplay(){
  $.getJSON(
    "/pollDisplay",
    function (data, status){
      if (mode != data.mode){
        mode = data.mode;
        switch(mode){
          case MAIN_JARVIS:
            curSound = -1;
            break;
          case MAIN_WARP:
            warpUp.play();
            break;
          case MAIN_ORBIT:
            warpDown.play();
            break;
        }
      }
      if (mode == MAIN_JARVIS){
        if (data.sound_id != curSoundId){
          curSoundId = data.sound_id;
          console.log(curSoundId);
          jarvisSounds[curSoundId].play()
        }
      }
    }
  );
}

$.ajaxSetup({ cache: false });
setInterval("pollDisplay();", 500);
