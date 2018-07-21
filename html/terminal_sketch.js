var unitSize;
var mode;
var myFont;
var beeps;
var areas;
var gungee_data;
var jarvis_data;
var vote_string;
var max_votes = 0;
var votes_left = 0;
const TERM_BEEPS = 0;
const TERM_ADMIN = 1;
const TERM_SOUND = 2;
const TERM_PREVOTE = 3;
const TERM_VOTE = 4;
const TERM_SCREEN = 5;


function preload() {
  myFont = loadFont('files/assets/FINALOLD.TTF');
  beeps = [];
  beeps.push(loadSound('files/assets/beep1.wav'));
  beeps.push(loadSound('files/assets/beep2.wav'));
  beeps.push(loadSound('files/assets/beep3.wav'));
  beeps.push(loadSound('files/assets/beep4.wav'));
  jarvis_data = loadJSON('files/assets/jarvis.json');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  mode = -1;
  gridX = width / 10;
  gridY = height / 15;
  areas = [];
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  gridX = width / 10;
  gridY = height / 15;
}

function mouseClicked(){
  for (var i=0; i<areas.length; i++){
    areas[i].detectClick(mouseX, mouseY);
  }
}

function beep(){
  var n = Math.floor(Math.random() * beeps.length);
  beeps[n].play();
}

function sounds(){
  $.getJSON('/soundboard/');
}

function play(id){
  $.getJSON('/play_sound/' + id + "/0");
}

function prevote(){
  url = '/vote_config/' + max_votes + '/1';
  $.getJSON(url,
    function(data, success){
      beep();
  });
}

function voteup(){
  if (max_votes < 9){
    max_votes++;
  }
}

function votedown(){
  if (max_votes > 1){
    max_votes--;
  }
}

function vote(choice){
  if (votes_left > 0){
    vote_string = vote_string + gungee_data[choice][0] + "-";
    console.log(vote_string);
    votes_left--;
    if (votes_left == 0){
      console.log(vote_string.slice(0, vote_string.length-1));
      $.getJSON('/vote/' + vote_string.slice(0, vote_string.length-1),
        function(data, success){
          beep();
        });
    }
  }
}

function logout(){
  $.getJSON('/logout/',
    function(data, status){
      beep();
    });
}

function display(){
  $.getJSON('/termmode/5',
  function(data, status){
    beep();
  });
}

function warp(){
  $.getJSON('/mainscreen/0',
  function(data, status){
    beep();
  });
}

function orbit(){
  $.getJSON('/mainscreen/1',
  function(data, status){
    beep();
  });
}

function space_command(){
  $.getJSON('/mainscreen/2',
  function(data, status){
    beep();
  });
}

function admin(){
  $.getJSON('/termmode/1',
  function(data, status){
    beep();
  });
}



function draw() {
  background(0);
  fill(255);
  noStroke();
  
  switch(mode) {
    case TERM_BEEPS:
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
      for(var i=0; i<areas.length; i++){
        areas[i].show();
      }
      break;
    case TERM_ADMIN:
      // Footer
      fill(252,168,92);
      ellipse(gridX, height-gridY, gridX, gridY);
      rect(gridX, height-1.5*gridY, 0.5*gridX, gridY);
      ellipse(width-gridX, height-gridY, gridX, gridY);
      rect(4.9*gridX, height-1.5*gridY, 4.1*gridX, gridY);
      fill(186,218,255);
      textFont(myFont);
      textSize(gridY*0.70);
      text('SHIP CONTROL', 1.75*gridX, height-0.75*gridY);
      for(var i=0; i<areas.length; i++){
        areas[i].show();
      }
      // Overlay text
      fill(0);
      textSize(gridY*0.5);
      text('BEGIN VOTE', 6*gridX, 5.5*gridY);
      text('SOUNDS', 1.5*gridX, 5.5*gridY);
      text('DISPLAY', 1.5*gridX, 11.5*gridY);
      text('LOGOUT', 6*gridX, 11.5*gridY);
      // Max gunge votes
      fill(186,218,255);
      textSize(1.5*gridY);
      text(max_votes, 7*gridX, 2.5*gridY);

      break;
    case TERM_SOUND:
      for(var i=0; i<areas.length; i++){
        areas[i].show();
      }    
      break;
    case TERM_PREVOTE:
      // Footer
      fill(252,168,92);
      ellipse(gridX, height-gridY, gridX, gridY);
      rect(gridX, height-1.5*gridY, 0.5*gridX, gridY);
      ellipse(width-gridX, height-gridY, gridX, gridY);
      rect(4.9*gridX, height-1.5*gridY, 4.1*gridX, gridY);
      fill(186,218,255);
      textFont(myFont);
      textSize(gridY*0.70);
      text('GUNGE VOTE', 1.75*gridX, height-0.75*gridY);
      for(var i=0; i<areas.length; i++){
        areas[i].show();
      }
      textAlign(CENTER);
      textSize(gridY*2);
      text('VOTING READY', width/2, 4*gridY);
      textSize(gridY);
      text('WAITING FOR NEXT CADET...', width/2, 6*gridY);
      textAlign(LEFT);
      break;
    case TERM_VOTE:
      fill(252,168,92);
      ellipse(gridX, height-gridY, gridX, gridY);
      rect(gridX, height-1.5*gridY, 0.5*gridX, gridY);
      ellipse(width-gridX, height-gridY, gridX, gridY);
      rect(4.9*gridX, height-1.5*gridY, 4.1*gridX, gridY);
      fill(186,218,255);
      textFont(myFont);
      textSize(gridY*0.70);
      text('GUNGE VOTE', 1.75*gridX, height-0.75*gridY);
      for(var i=0; i<areas.length; i++){
        areas[i].show();
      }
      fill(0);
      textSize(gridY);
      text(gungee_data[0][1].toUpperCase(), 1.5*gridX, 5.5*gridY);
      text(gungee_data[1][1].toUpperCase(), 6*gridX, 5.5*gridY);
      text(gungee_data[2][1].toUpperCase(), 1.5*gridX, 12.5*gridY);
      text(gungee_data[3][1].toUpperCase(), 6*gridX, 12.5*gridY);
      textAlign(CENTER);
      textSize(gridY*1.5);
      fill(186,218,255);
      text('VOTES LEFT: ' + votes_left, width/2, 7.5*gridY);
      textAlign(LEFT);
      break;
    case TERM_SCREEN:
      // Footer
      fill(252,168,92);
      ellipse(gridX, height-gridY, gridX, gridY);
      rect(gridX, height-1.5*gridY, 0.5*gridX, gridY);
      ellipse(width-gridX, height-gridY, gridX, gridY);
      rect(4.9*gridX, height-1.5*gridY, 4.1*gridX, gridY);
      fill(186,218,255);
      textFont(myFont);
      textSize(gridY*0.70);
      text('MAIN SCREEN', 1.75*gridX, height-0.75*gridY);
      for(var i=0; i<areas.length; i++){
        areas[i].show();
      }
      // Overlay text
      fill(0);
      textSize(gridY*0.5);
      text('WARP', 1.5*gridX, 5.5*gridY);
      text('ORBIT', 6*gridX, 5.5*gridY);
      text('COMMAND', 1.5*gridX, 11.5*gridY);
      text('BACK TO ADMIN', 6*gridX, 11.5*gridY);
      break;
  }
}

function pollTerminal(){
  $.getJSON(
    "/pollTerminal",
    function (data, status){
      if(data.mode != mode){
        mode = data.mode;
        switch(mode) {
          case TERM_BEEPS:
            areas = [];
            areas.push(new Area(4*gridX, 2.5*gridY, width-5.5*gridX, 1.25*gridY, color(252,168,92), "beep"));
            areas.push(new Area(4*gridX, 4*gridY, width-5.5*gridX, 1.25*gridY, color(240,218,255), "beep"));
            areas.push(new Area(4*gridX, 5.5*gridY, width-5.5*gridX, 1.25*gridY, color(188,252,184), "beep"));
            areas.push(new Area(4*gridX, 7.5*gridY, 1.25*gridX, 3*gridY, color(252,252,124), "beep"));
            areas.push(new Area(5.5*gridX, 7.5*gridY, 1.25*gridX, 3*gridY, color(186,218,255), "beep"));
            areas.push(new Area(7*gridX, 7.5*gridY, 1.25*gridX, 3*gridY, color(240,218,255), "beep"));
            break;
          case TERM_ADMIN:
            areas = [];
            max_votes = 1;
            areas.push(new Area(gridX, gridY, 3.5*gridX, 5*gridY, color(240,218,255), "sounds"));
            areas.push(new Area(5.5*gridX, gridY, gridX, 2*gridY, color(252,168,92), "votedown"));
            areas.push(new Area(8*gridX, gridY, gridX, 2*gridY, color(252,168,92), "voteup"));
            areas.push(new Area(5.5*gridX, 3.5*gridY, 3.5*gridX, 2.5*gridY, color(252,252,124), "prevote"));
            areas.push(new Area(gridX, 7*gridY, 3.5*gridX, 5*gridY, color(188,252,184), "display"));
            areas.push(new Area(5.5*gridX, 7*gridY, 3.5*gridX, 5*gridY, color(186,218,255), "logout"));
            break;
          case TERM_SOUND:
            areas = [];
            for (var i=0; i<jarvis_data.sounds.length; i++){
              areas.push(new Area(gridX, gridY*(i+1), width-2*gridX, 0.8*gridY, color(252,168,92), "play("+i+")"));
            }
            break;
          case TERM_PREVOTE:
            areas = [];
            break;
          case TERM_VOTE:
            gungee_data = data.gungees;
            max_votes = data.max_votes;
            votes_left = max_votes;
            vote_string = "";
            areas = [];
            areas.push(new Area(gridX, gridY, 3.5*gridX, 5*gridY, color(252,252,124), "vote(0)"));
            areas.push(new Area(5.5*gridX, gridY, 3.5*gridX, 5*gridY, color(186,218,255), "vote(1)"));
            areas.push(new Area(gridX, 8*gridY, 3.5*gridX, 5*gridY, color(188,252,184), "vote(2)"));
            areas.push(new Area(5.5*gridX, 8*gridY, 3.5*gridX, 5*gridY, color(240,218,255), "vote(3)"));
            break;
          case TERM_SCREEN:
            areas = [];
            areas.push(new Area(gridX, gridY, 3.5*gridX, 5*gridY, color(252,252,124), "warp"));
            areas.push(new Area(5.5*gridX, gridY, 3.5*gridX, 5*gridY, color(186,218,255), "orbit"));
            areas.push(new Area(gridX, 7*gridY, 3.5*gridX, 5*gridY, color(188,252,184), "command"));
            areas.push(new Area(5.5*gridX, 7*gridY, 3.5*gridX, 5*gridY, color(240,218,255), "admin"));
            break;
        }
      }
      
    }
  );
}

$.ajaxSetup({ cache: false });
setInterval("pollTerminal();", 500);
