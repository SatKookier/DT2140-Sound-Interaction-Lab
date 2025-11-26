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
  // パラメータリスト取得
  const jsonString = dspNode.getJSON();
  jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
  dspNodeParams = jsonParams;
});

//==========================================================================================
// INTERACTIONS
//==========================================================================================

// 音を連打しすぎないためのタイマー変数
let lastPlayTime = 0;
const PLAY_INTERVAL = 1000; // 1000ミリ秒 = 1秒ごとに鳴らす

function rotationChange(rotx, roty, rotz) {
  // Yaw軸を使用
  let currentYaw = rotz;
  let targetYaw = 0; // 北 (0度)
  let threshold = 30; // 判定を甘くする（±30度）

  // 差分計算
  let diff = Math.abs(currentYaw - targetYaw);
  if (diff > 180) diff = 360 - diff;

  // 判定
  if (diff < threshold) {
    // 範囲内、かつ前回の再生から1秒以上経っていたら鳴らす
    let currentTime = millis(); // p5.jsの関数
    if (currentTime - lastPlayTime > PLAY_INTERVAL) {
      console.log("Target Locked! Playing Sound..."); // PCのコンソールで確認用
      playAudio();
      lastPlayTime = currentTime;
    }
  }
}

function mousePressed() {
  // 画面タップでも強制的に鳴らす（テスト用）
  console.log("Screen Tapped -> Force Play");
  playAudio();
}

function accelerationChange(accx, accy, accz) {}
function deviceMoved() {}
function deviceTurned() {}
function deviceShaken() {}

function getMinMaxParam(address) {
  return [0, 1];
} // 簡易化

//==========================================================================================
// AUDIO INTERACTION
//==========================================================================================

function playAudio() {
  if (!dspNode || audioContext.state === "suspended") return;

  // 1. ボリューム設定
  dspNode.setParamValue("/torpedo/volume", 1.0);

  // 2. トリガーを引く (ON)
  dspNode.setParamValue("/torpedo/trigger", 1.0);

  // 3. 少し待ってからトリガーを戻す (OFF)
  // これがないと次が鳴りません！
  setTimeout(() => {
    if (dspNode) {
      dspNode.setParamValue("/torpedo/trigger", 0.0);
    }
  }, 100); // 0.1秒後にOFFにする
}
//==========================================================================================
// END
//==========================================================================================
