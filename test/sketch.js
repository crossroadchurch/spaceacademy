// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/2O3nm0Nvbi4

var song;
var fft;
var button;

function toggleSong() {
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.play();
  }
}

function preload() {
  //song = loadSound('assets/this-dot-kp.mp3');
}

function setup() {
  createCanvas(960,540);
  colorMode(HSB);
  angleMode(DEGREES);
  //song.play();
  //fft = new p5.FFT(0.9, 256);
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT(0.7, 512);
  fft.setInput(mic);
}

function draw() {
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