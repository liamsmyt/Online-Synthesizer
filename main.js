// setup audioContext and oscillator within it

var ctx = new (window.AudioContext || window.webkitAudioContext)();

document.addEventListener("DOMContentLoaded", () => {
  //setup keyboard

  const container = document.getElementById("keys-container");

  const whiteKeyLabels = ["C", "D", "E", "F", "G", "A", "B"];

  //white keys
  for (let i = 0; i < 7; i++) {
    const key = document.createElement("div");
    key.className = "key";
    // Create and append text label
    const labelText = document.createTextNode(whiteKeyLabels[i]);
    key.appendChild(labelText);

    key.onclick = () => playSound("White key " + (i + 1));
    container.appendChild(key);
  }

  const blackKeyPositions = ["185", "400", "510", "620"];
  const blackKeyLabels = ["D#", "F#", "G#", "A#", "C#"];

  //black keys
  for (let i = 0; i < 5; i++) {
    const blackKey = document.createElement("div");
    blackKey.className = "black-key";
    container.appendChild(blackKey);
    // ignore very questionable code
    if (i + 1 == 5) {
      blackKey.onclick = () => playSound("Black key " + (i - 3));
    } else {
      blackKey.onclick = () => playSound("Black key " + (i + 2));
    }

    // Create and append text label
    const labelText = document.createTextNode(blackKeyLabels[i]);
    blackKey.appendChild(labelText);

    blackKey.style.left = blackKeyPositions[i] + "px";
  }
});

let baseFrequency = 130.81;

const freqRatios = [
  1, // C
  Math.pow(2, 2 / 12), // D
  Math.pow(2, 4 / 12), // E
  Math.pow(2, 5 / 12), // F
  Math.pow(2, 7 / 12), // G
  Math.pow(2, 9 / 12), // A
  Math.pow(2, 11 / 12), // B
  Math.pow(2, 1 / 12), // C#
  Math.pow(2, 3 / 12), // D#
  Math.pow(2, 6 / 12), // F#
  Math.pow(2, 8 / 12), // G#
  Math.pow(2, 10 / 12), // A#
];

let frequencies = freqRatios.map((ratio) => baseFrequency * ratio);

function setFreq(key) {
  // Split the input string by spaces
  const parts = key.split(" ");

  // Extract the note information
  const color = parts[0]; // White or Black
  const keyNumber = parseInt(parts[2]); // Convert key number to integer

  if (color == "White") {
    console.log(frequencies[keyNumber - 1]);
    return frequencies[keyNumber - 1];
  }
  if (color == "Black") {
    console.log(frequencies[keyNumber + 6]);
    return frequencies[keyNumber + 6];
  }
}

let currentOscillator = null;

function playSound(key) {
  // Your sound playing logic here
  console.log("Playing sound for: " + key);
  let frequency = setFreq(key);

  // Stop the currently playing oscillator if there is one(for mono audio)
  if (currentOscillator) {
    currentOscillator.stop();
    currentOscillator = null;
  }

  var osc = ctx.createOscillator();

  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  osc.type = waveShape;

  //adsr
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-30, ctx.currentTime);
  compressor.knee.setValueAtTime(10, ctx.currentTime);
  compressor.ratio.setValueAtTime(40, ctx.currentTime);
  compressor.attack.setValueAtTime(-20, ctx.currentTime);
  compressor.release.setValueAtTime(20, ctx.currentTime);

  // filter
  const biquadFilter = ctx.createBiquadFilter();
  biquadFilter.type = "lowpass";
  biquadFilter.frequency.setValueAtTime(250, ctx.currentTime);
  biquadFilter.gain.setValueAtTime(25, ctx.currentTime);

  console.log();

  osc.connect(compressor);
  compressor.connect(biquadFilter);
  biquadFilter.connect(ctx.destination);
  osc.start();

  // Update the current oscillator reference
  currentOscillator = osc;

  setTimeout(() => {
    osc.stop();
  }, 400);
}

let pressedKey;

// keydown events
function handleKeyPress(event) {
  //octave control
  if (event.key == "z" || event.key == "x") {
    pressedKey = event.key;
    updateOctave(pressedKey);
  }

  //keyboard functionality
  if (
    event.key == "a" ||
    event.key == "s" ||
    event.key == "d" ||
    event.key == "f" ||
    event.key == "g" ||
    event.key == "h" ||
    event.key == "j" ||
    event.key == "w" ||
    event.key == "e" ||
    event.key == "t" ||
    event.key == "y" ||
    event.key == "u"
  ) {
    pressedKey = event.key;
    playKeyboardNote(pressedKey);
  }
}

function playKeyboardNote(pressedKey) {
  switch (pressedKey) {
    case "a":
      playSound("White key 1");
      break;
    case "s":
      playSound("White key 2");
      break;
    case "d":
      playSound("White key 3");
      break;
    case "f":
      playSound("White key 4");
      break;
    case "g":
      playSound("White key 5");
      break;
    case "h":
      playSound("White key 6");
      break;
    case "j":
      playSound("White key 7");
      break;
    case "w":
      playSound("Black key 1");
      break;
    case "e":
      playSound("Black key 2");
      break;
    case "t":
      playSound("Black key 3");
      break;
    case "y":
      playSound("Black key 4");
      break;
    case "u":
      playSound("Black key 5");
      break;
    default:
      break;
  }
}

// button pressed
const upOctaveButton = document.getElementById("upOctave");
const downOctaveButton = document.getElementById("downOctave");
const sinButton = document.getElementById("sinButton");
const sqrButton = document.getElementById("sqrButton");
const tglButton = document.getElementById("tglButton");
const sawButton = document.getElementById("sawButton");

let waveShape;

sinButton.addEventListener("click", () => {
  waveShape = "sine";
});

sqrButton.addEventListener("click", () => {
  waveShape = "square";
});

tglButton.addEventListener("click", () => {
  waveShape = "triangle";
});

sawButton.addEventListener("click", () => {
  waveShape = "sawtooth";
});

upOctaveButton.addEventListener("click", () => {
  pressedKey = "x";
  updateOctave(pressedKey);
});

downOctaveButton.addEventListener("click", () => {
  pressedKey = "z";
  updateOctave(pressedKey);
});

function updateOctave(pressedKey) {
  if (pressedKey == "z") {
    baseFrequency *= 0.5;
    frequencies = freqRatios.map((ratio) => baseFrequency * ratio);
  }
  if (pressedKey == "x") {
    baseFrequency *= 2;
    frequencies = freqRatios.map((ratio) => baseFrequency * ratio);
  }
}

document.addEventListener("keydown", handleKeyPress);

// show instructions
const toggleButton = document.getElementById("toggleButton");
const instructions = document.getElementById("instructions");

toggleButton.addEventListener("click", function () {
  // Toggle the visibility of the instructions
  if (instructions.style.display === "none") {
    instructions.style.display = "block";
  } else {
    instructions.style.display = "none";
  }
});
