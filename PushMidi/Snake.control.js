loadAPI(1);
load('Helpers.js');

host.defineController('WobbleSoft', 'Snake', '1.0', 'ebef3e20-6967-11e4-9803-0800200c9a66');
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair (['Ableton Push User Port'], ['Ableton Push User Port']);

// sysex_live_mode = '\xF0\x47\x7F\x15\x62\x00\x01\x00\xF7'
// sysex_user_mode = '\xF0\x47\x7F\x15\x62\x00\x01\x01\xF7'

const SysexSetUserMode = "F0 47 7F 15 62 00 01 01 F7";
const UP = 1;
const DOWN = 2;
const RIGHT = 3;
const LEFT = 4;
const GAME_INTERVAL = 100;

const debugMIDI = false;

var snakeX = [];
var snakeY = [];
var pDirection = RIGHT;
var gamePaused = false;
var colorOffset = 0;

var eggX = 5; var eggY = 3;

function snakeContainsEgg()
{
  for (var i = 0; i < snakeX.length; i++)
  {
    if (snakeX[i] == eggX && snakeY[i] == eggY)
      return true;
  }
  return false;
}

function resetEgg()
{
  eggX = Math.round(Math.random() * 6) + 1;
  eggY = Math.round(Math.random() * 6) + 1;
  while (snakeContainsEgg())
  {
    eggX = Math.round(Math.random() * 6) + 1;
    eggY = Math.round(Math.random() * 6) + 1;
  }
}

function initGame()
{
  snakeX = [];
  snakeY = [];
  snakeX.push(0);
  snakeY.push(0);
  pDirection = RIGHT;
  resetEgg();
  gamePaused = false;
  colorOffset = 0;
}

function init()
{
  midiInput = host.getMidiInPort(0);
  midiOutput = host.getMidiOutPort(0);
  midiInput.setMidiCallback(onMidi);
  noteInput = midiInput.createNoteInput(
    'Ableton Push', 
        '000000',   // Note off
    '000000',   // Note on
    '000000', // Poly Aftertouch
    '000000'  // Sustain pedal
  );
  noteInput.setShouldConsumeEvents(false);
  midiOutput.sendSysex(SysexSetUserMode);

  clearPads();
  initGame();
  gameLoop();
}

function clearPads()
{
  for (i = 36; i < 100; i++)
  {
    midiOutput.sendMidi(0x90, i, 0);
  }
}

function gameLoop(args)
{
  if (!gamePaused) { update(); }
  draw();
  host.scheduleTask(gameLoop, [], GAME_INTERVAL);
}

function draw()
{
  clearPads();
  // Draw player
  for (var i = 0; i < snakeX.length; i++) {
    midiOutput.sendMidi(0x90, coordinateToPadNumber(snakeX[i], snakeY[i]), padColors[(i + colorOffset) % padColors.length]);
  }
  // Draw egg
  midiOutput.sendMidi(0x90, coordinateToPadNumber(eggX, eggY), 3 /* white */ );
}

function update()
{
  // colorOffset += 1; 
  var oldTailX = snakeX[snakeX.length - 1];
  var oldTailY = snakeY[snakeY.length - 1];

  var copyX = snakeX[0];
  var copyY = snakeY[0];
  for (var i = 1; i < snakeX.length; i++) {
    var tempX = snakeX[i];
    var tempY = snakeY[i];
    snakeX[i] = copyX;
    snakeY[i] = copyY;
    copyX = tempX;
    copyY = tempY;
  }

  switch (pDirection)
  {
    case UP:
      snakeY[0] += 1;
      break;
    case DOWN:
      snakeY[0] -= 1;
      break;
    case RIGHT:
      snakeX[0] += 1;
      break;
    case LEFT:
      snakeX[0] -= 1;
  }

  // Check if the player went out of bounds
  if (snakeX[0] < 0) {
    println('Game Over');
    initGame();
  } else if (snakeX[0] > 7) {
    println('Game Over');
    initGame();
  } else if (snakeY[0] < 0) {
    println('Game Over');
    initGame();
  } else if (snakeY[0] > 7) {
    println('Game Over');
    initGame();
  }

  // Check if the player collided with their tail
  for (var i = 1; i < snakeX.length; i++) {
    if (snakeX[0] == snakeX[i] && snakeY[0] == snakeY[i]) {
      println('Game over, collided with tail');
      initGame();
    }
  }

  if (snakeX[0] == eggX && snakeY[0] == eggY) {
    println('Egg Captured!');
    resetEgg();
    snakeX.push(oldTailX);
    snakeY.push(oldTailY);
  }
}

function onMidi(status, data1, data2)
{
  if (debugMIDI) {
    println('==== Received MIDI Data ====');
    println(status.toString(16));
    println(data1.toString(16));
    println(data2.toString(16));
  }

  if (status == 0xB0 && data2 == 0x7F)
  {
    // Keep player from cheating by not allowing 
    // changes of direction during a pause
    if (!gamePaused) {
      if (data1 == 0x2C) {
        pDirection = LEFT;
      } else if (data1 == 0x2D) {
        pDirection = RIGHT;
      } else if (data1 == 0x2E) {
        pDirection = UP;
      } else if (data1 == 0x2F) {
        pDirection = DOWN;
      }
    }

    // Pause when shift is pressed
    if (data1 == 0x31) {
      gamePaused = !gamePaused;
    }
  }
}

function exit()
{

}