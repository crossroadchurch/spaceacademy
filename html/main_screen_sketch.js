var stars;
var myFont;
var unitSize;
var mode;
var jarvisSounds;
var warpUp, warpDown;
var curSoundId;
var curSound;
var curActor=-1;
var curPlanet=0;
var fft;
var tick, subtick, slice;
var slices = [];
var planets = [];
var gunge_results = [];
var displayed_results = [];
var max_gunge_result = 0;
var voter = "";
var mask;
var tileH = 300;
var transMax = 200;
var transCur = 200;
var transStep = 1;
var maxWarp = 12;
const MAIN_WARP = 0;
const MAIN_ORBIT = 1;
const MAIN_COMMS = 2;
const MAIN_JARVIS = 3;
const MAIN_RESULTS = 4;
const MAIN_PREVOTE = 5;
const MAIN_VOTE = 6;
const ACTOR_JARVIS = 0;
const ACTOR_MISSION = 1;

function preload() {
  myFont = loadFont('files/assets/FINALOLD.TTF');
  jarvisJSON = loadJSON('files/assets/jarvis.json', loadJarvisSounds);
  planetJSON = loadJSON('files/assets/planets.json', loadPlanets);
  warpUp = loadSound('files/assets/warp-up.mp3');
  warpDown = loadSound('files/assets/warp-down.wav');
  mask = loadImage('files/assets/planet_mask.png');
}

function loadPlanets(data) {
  planets = new Array(data.planets.length);
  for(var i=0; i<data.planets.length; i++){
    planets[i] = new Array();
    for(var j=0; j<20; j++){
      planets[i].push(loadImage(data.planets[i].basefilename + str(j) + data.planets[i].extension));
    }
    planets[i].push(loadImage(data.planets[i].basefilename + "0" + data.planets[i].extension));
  }
}

function loadJarvisSounds(data) {
  jarvisSounds = new Array(data.sounds.length);
  for(var i=0; i<data.sounds.length; i++){
    jarvisSounds[i] = loadSound(data.sounds[i].filename);
    jarvisSounds[i].onended(function(){
      $.getJSON('play_sound/-1/' + data.sounds[i].actor);
    });
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
        // image(slices[slice+1], width/2 - 5*tileH, transCur+subtick+height-2*tileH, 10*tileH, tileH);
        // image(slices[slice], width/2 - 5*tileH, transCur+subtick+height-tileH, 10*tileH, tileH);
        image(planets[curPlanet][slice+1], width/2 - 5*tileH, transCur+subtick+height-2*tileH, 10*tileH, tileH);
        image(planets[curPlanet][slice], width/2 - 5*tileH, transCur+subtick+height-tileH, 10*tileH, tileH);
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
        // image(slices[slice+1], width/2 - 5*tileH, transCur+subtick+height-2*tileH, 10*tileH, tileH);
        // image(slices[slice], width/2 - 5*tileH, transCur+subtick+height-tileH, 10*tileH, tileH);
        image(planets[curPlanet][slice+1], width/2 - 5*tileH, transCur+subtick+height-2*tileH, 10*tileH, tileH);
        image(planets[curPlanet][slice], width/2 - 5*tileH, transCur+subtick+height-tileH, 10*tileH, tileH);
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
        // image(slices[slice+1], width/2 - 5*tileH, subtick+height-2*tileH, 10*tileH, tileH);
        // image(slices[slice], width/2 - 5*tileH, subtick+height-tileH, 10*tileH, tileH);
        image(planets[curPlanet][slice+1], width/2 - 5*tileH, subtick+height-2*tileH, 10*tileH, tileH);
        image(planets[curPlanet][slice], width/2 - 5*tileH, subtick+height-tileH, 10*tileH, tileH);
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
      if (curActor == ACTOR_JARVIS){
        angleMode(DEGREES);
        colorMode(HSB);
        background(0);
        var spectrum = fft.analyze();
        var prop = 0.4;
        noStroke();
        push();
        translate(width / 2, height / 2);
        maxSpec = Math.floor(prop*spectrum.length);
        for (var i=0; i< maxSpec; i++){ // Only look at human voice area of spectrum
          var angle = map(i, 0, maxSpec, 0, 1080);
          var col1 = map(i, 0, maxSpec, 0, 127);
          var amp = spectrum[i];
          var a = map(amp, 0, 256, 0, 0.3*width);
          var b = map(amp, 0, 256, 0, 0.4*height);
          var x = a * cos(angle);
          var y = b * sin(angle);
          stroke(col1 , 255, 255);
          line(0, 0, x, y);
        }
        for (var i=maxSpec-1; i>=0; i--){ // Only look at human voice area of spectrum
          var angle = map(i, 0, maxSpec, 1080, 0);
          var col2 = map(i, 0, maxSpec, 128, 255);
          var amp = spectrum[i];
          var a = map(amp, 0, 256, 0, 0.3*width);
          var b = map(amp, 0, 256, 0, 0.4*height);
          var x = a * cos(angle);
          var y = b * sin(angle);
          stroke(col2, 255, 255);
          line(0, 0, x, y);
        }
        pop();
        colorMode(RGB);
        fill(252,168,92);
        ellipse(5*unitSize, unitSize, unitSize, unitSize);
        rect(5*unitSize,0.5*unitSize, unitSize, unitSize);
        ellipse(width-5*unitSize, unitSize, unitSize, unitSize);
        rect(12*unitSize, (0.5*unitSize), width-17*unitSize, unitSize);
        fill(186,218,255);
        textFont(myFont);
        textSize(unitSize);
        text('MAIN COMPUTER', 6.5*unitSize, 1.35*unitSize);
        
      } else if (curActor == ACTOR_MISSION){
        background(0);
        noStroke();
        textFont(myFont)
        textSize(1.8*unitSize);
        fill(186,218,255);
        textAlign(CENTER, CENTER);
        text("MESSAGE FROM MISSION CONTROL", width/2, height/2);
        textSize(unitSize);
        today = new Date();
        stardate = (floor(today.getTime()/1000)/10000).toFixed(4);
        text('STARDATE ' + stardate, width/2, 2*unitSize + (height/2));
        textAlign(LEFT, BASELINE);
        fill(252,168,92);
        ellipse(5*unitSize, unitSize, unitSize, unitSize);
        rect(5*unitSize,0.5*unitSize, unitSize, unitSize);
        ellipse(width-5*unitSize, unitSize, unitSize, unitSize);
        rect(13*unitSize, (0.5*unitSize), width-18*unitSize, unitSize);
        fill(186,218,255);
        textFont(myFont);
        textSize(unitSize);
        text('INCOMING MESSAGE', 6.5*unitSize, 1.35*unitSize);
      }
      break;

    case MAIN_RESULTS:
      background(0);
      textAlign(LEFT, CENTER);
      textFont(myFont);
      textSize(unitSize);
      noStroke();
      for (var i=0; i<gunge_results.length; i++){
        fill(186,218,255);
        text(gunge_results[i][0], width*0.15, height * (i+1.25)/(gunge_results.length+1));
        textAlign(RIGHT, CENTER);
        if (gunge_results[i][1] == 0){
          text("0", width*0.85, height * (i+1.25)/(gunge_results.length+1));
        } else {
          if (displayed_results[i][1] < gunge_results[i][1]){
            displayed_results[i][1] = displayed_results[i][1] + (0.004*max_gunge_result);
          }
          text(str(floor(displayed_results[i][1])), width*0.85, height * (i+1.25)/(gunge_results.length+1));
          fill(252,168,92);
          rect(width*0.3, height * (i+1)/(gunge_results.length+1), width*0.5*displayed_results[i][1]/max_gunge_result, height*0.1);
        }
        textAlign(LEFT, CENTER);
      }
      textAlign(LEFT, BASELINE);
      fill(252,168,92);
      ellipse(5*unitSize, unitSize, unitSize, unitSize);
      rect(5*unitSize,0.5*unitSize, unitSize, unitSize);
      ellipse(width-5*unitSize, unitSize, unitSize, unitSize);
      rect(11.75*unitSize, (0.5*unitSize), width-16.75*unitSize, unitSize);
      fill(186,218,255);
      textFont(myFont);
      textSize(unitSize);
      text('GUNGE RESULTS', 6.5*unitSize, 1.35*unitSize);
      break;

    case MAIN_PREVOTE:
      background(0);
      noStroke();
      textFont(myFont)
      textSize(3*unitSize);
      fill(186,218,255);
      textAlign(CENTER, CENTER);
      text('READY FOR VOTING...', width/2, height/2);
      textAlign(LEFT, BASELINE);
      fill(252,168,92);
      ellipse(5*unitSize, unitSize, unitSize, unitSize);
      rect(5*unitSize,0.5*unitSize, unitSize, unitSize);
      ellipse(width-5*unitSize, unitSize, unitSize, unitSize);
      rect(11.25*unitSize, (0.5*unitSize), width-16.25*unitSize, unitSize);
      fill(186,218,255);
      textFont(myFont);
      textSize(unitSize);
      text('GUNGE VOTES', 6.5*unitSize, 1.35*unitSize);
      break;  
    
    case MAIN_VOTE:
      background(0);
      noStroke();
      textFont(myFont);
      textSize(3*unitSize);
      fill(186,218,255);
      textAlign(CENTER, CENTER);
      text(voter.toUpperCase() + " IS VOTING...", width/2, height/2);
      textSize(2*unitSize);
      text('WHO WILL THEY CHOOSE?', width/2, 2*unitSize + (height/2));
      textAlign(LEFT, BASELINE);
      fill(252,168,92);
      ellipse(5*unitSize, unitSize, unitSize, unitSize);
      rect(5*unitSize,0.5*unitSize, unitSize, unitSize);
      ellipse(width-5*unitSize, unitSize, unitSize, unitSize);
      rect(11.25*unitSize, (0.5*unitSize), width-16.25*unitSize, unitSize);
      fill(186,218,255);
      textFont(myFont);
      textSize(unitSize);
      text('GUNGE VOTES', 6.5*unitSize, 1.35*unitSize);
      break;  
  }

  // Foreground layer
  switch(mode){
    case MAIN_WARP:
      fill(252,168,92);
      ellipse(5*unitSize, unitSize, unitSize, unitSize);
      rect(5*unitSize,0.5*unitSize, unitSize, unitSize);
      ellipse(width-5*unitSize, unitSize, unitSize, unitSize);
      rect(11*unitSize, (0.5*unitSize), width-16*unitSize, unitSize);
      fill(186,218,255);
      textFont(myFont);
      textSize(unitSize);
      text('USS INTREPID', 6.5*unitSize, 1.35*unitSize);
      break;
    
    case MAIN_ORBIT:
      fill(252,168,92);
      ellipse(5*unitSize, unitSize, unitSize, unitSize);
      rect(5*unitSize,0.5*unitSize, unitSize, unitSize);
      ellipse(width-5*unitSize, unitSize, unitSize, unitSize);
      rect(11*unitSize, (0.5*unitSize), width-16*unitSize, unitSize);
      fill(186,218,255);
      textFont(myFont);
      textSize(unitSize);
      text('USS INTREPID', 6.5*unitSize, 1.35*unitSize);
      break;
  }

  // 4:3 ASPECT RATIO BOX
  //  noFill();
  //  stroke(255,0,0);
  //  rect(width/16*2,0,width/16*12, height);

}

function pollDisplay(){
  $.getJSON(
    "/pollDisplay",
    function (data, status){
      if (mode != data.mode){
        switch(data.mode){
          case MAIN_JARVIS:
            curSound = -1;
            break;
          case MAIN_WARP:
            if (mode == MAIN_ORBIT){
              warpUp.play();
            }
            break;
          case MAIN_ORBIT:
            if (mode == MAIN_WARP){
              warpDown.play();
            }
            curPlanet = data.planet;
            break;
          case MAIN_RESULTS:
            gunge_results = data.results;
            max_gunge_result = data.max_result;
            displayed_results = data.results;
            max_gunge_result = 0;
            for (var i=0; i<displayed_results.length; i++){
              displayed_results[i][1] = 0;
            }
            break;
          case MAIN_VOTE:
            voter = data.voter;
        }
        mode = data.mode;
      }
      if (mode == MAIN_JARVIS){
        if (data.sound_id != curSoundId){
          curSoundId = data.sound_id;
          curActor = data.actor;
          if (curSoundId != -1){
            jarvisSounds[curSoundId].play();
          }
        }
      }
      if (mode == MAIN_RESULTS){
        gunge_results = data.results;
        max_gunge_result = data.max_result;
      }
    }
  );
}

$.ajaxSetup({ cache: false });
setInterval("pollDisplay();", 500);
