//==========================================================================================
// AUDIO SETUP
//==========================================================================================
let dspNode = null;
let dspNodeParams = null;
let jsonParams = null;

const dspName = "torpedo";
const instance = new FaustWasm2ScriptProcessor(dspName);

if (typeof module === "undefined") {
  window[dspName] = instance;
} else {
  const exp = {};
  exp[dspName] = instance;
  module.exports = exp;
}

torpedo.createDSP(audioContext, 1024).then((node) => {
  dspNode = node;
  dspNode.connect(audioContext.destination);
  console.log("DSP Loaded. Params:", dspNode.getParams());
  const jsonString = dspNode.getJSON();
  jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
  dspNodeParams = jsonParams;
});

//==========================================================================================
// INTERACTIONS
//==========================================================================================

let lastPlayTime = 0;
const PLAY_INTERVAL = 1000;

function rotationChange(rotx, roty, rotz) {
  // Yaw軸を使用
  let currentYaw = rotz;
  let targetYaw = 0;
  let threshold = 30;

  let diff = Math.abs(currentYaw - targetYaw);
  if (diff > 180) diff = 360 - diff;

  if (diff < threshold) {
    let currentTime = millis();
    if (currentTime - lastPlayTime > PLAY_INTERVAL) {
      console.log("Target Locked! Playing Sound...");
      playAudio();
      lastPlayTime = currentTime;
    }
  }
}

function mousePressed() {
  console.log("Screen Tapped -> Force Play");
  playAudio();
}

function accelerationChange(accx, accy, accz) {}
function deviceMoved() {}
function deviceTurned() {}
function deviceShaken() {}

function getMinMaxParam(address) {
  return [0, 1];
}

//==========================================================================================
// AUDIO INTERACTION
//==========================================================================================

function playAudio() {
  if (!dspNode || audioContext.state === "suspended") return;

  dspNode.setParamValue("/torpedo/volume", 1.0);

  dspNode.setParamValue("/torpedo/trigger", 1.0);

  setTimeout(() => {
    if (dspNode) {
      dspNode.setParamValue("/torpedo/trigger", 0.0);
    }
  }, 100);
}
//==========================================================================================
// END
//==========================================================================================
