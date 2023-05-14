
// このファイルでは、メインのプログラムを記述する

'use strict';

(() => {

/**
 * キーの押下状態を管理するグローバルオブジェクト
 * @global
 * @type {object}
 */
window.isKeyDown = {};
/**
 * ゲームのスコアを格納するグローバル変数
 * @global
 * @type {number}
 */
window.gameScore = 0;

/**
 * canvasの幅
 * @type {number}
 */
const CANVAS_WIDTH = window.innerWidth;
/**
 * canvasの高さ
 * @type {number}
 */
const CANVAS_HEIGHT = window.innerHeight;
/**
 * 地面のy座標
 * @type {number}
 */
const GROUND_Y = CANVAS_HEIGHT * 0.8;
/** 
 * GroundStoneの最大個数
 * @type {number}
 */
const GROUNDSTONE_MAX_COUNT = 30;
/**
 * NormalObjectの最大個数
 * @type {number}
 */
const NORMALOBJECT_MAX_COUNT = 2;

/**
 * Canvas2d APIをラップしたユーティリティクラスのインスタンス
 * @type {Canvas2DUtility}
 */
let util = null;
/**
 * 描画対象のCanvasElement
 * @type {HTMLCanvasElement}
 */
let canvas = null;
/**
 * Canvas2d APIのコンテキスト
 * @type {CanvasRenderingContext2D}
 */
let ctx = null;
/**
 * シーンのインスタンス
 * @type {SceneManager}
 */
let scene = null;
/**
 * アニメーションの開始タイムスタンプ
 * @type {number}
 */
let startTime = null;

/**
 * 地面
 * @type {Ground}
 */
let ground = null;
/**
 * 地面の石
 * @type {Array}
 */
let groundStoneArray = [];
/**
 * ランナー
 * @type {Runner}
 */
let runner = null;
/**
 * 対象物（標準）
 * @type {NormalObject}
 */
let normalObjectArray = [];
/**
 * リスタートのフラグ
 * @type {Boolean}
 */
let restart = false;


// メインのロジック

// ページが読み込まれてから実行
window.addEventListener('load', () => {
  // ユーティリティクラスを初期化、取得
  util = new Canvas2DUtility(document.getElementById('main_canvas'));
  // canvasを取得
  canvas = util.canvas;
  // コンテキストを取得
  ctx = util.context;
  // canvasの幅や高さの設定、各インスタンスの初期化・設定
  initialize();
});


/**
 * canvasの幅や高さの設定、各インスタンスの初期化・設定をする関数
 */
function initialize() {

  // canvasの幅を設定
  canvas.width = CANVAS_WIDTH;
  // canvasの高さを設定
  canvas.height = CANVAS_HEIGHT;
  // シーンの初期化
  scene = new SceneManager();

  // Groundの初期化
  ground = new Ground(ctx, GROUND_Y, CANVAS_WIDTH);
  // GroundStoneArrayの初期化
  for(let i = 0; i < GROUNDSTONE_MAX_COUNT; ++i) {
    const randomX = Math.random() * CANVAS_WIDTH;
    const randomY = GROUND_Y + Math.random() * 20 + 10;
    groundStoneArray[i] = new GroundStone(ctx, randomX, randomY);
  }
  // runnerの初期化
  runner = new Runner(ctx, CANVAS_WIDTH * 0.1, GROUND_Y - 100, 50, 100, GROUND_Y);
  // normalObjectArrayの初期化
  for(let i = 0; i < NORMALOBJECT_MAX_COUNT; ++i) {
    normalObjectArray[i] = new NormalObject(ctx, canvas.width, GROUND_Y - 50, 50, 50);
  }
  // ターゲットの設定
  runner.setTargetArray(normalObjectArray);

  // イベントを設定
  eventSetting();
  // シーンを設定
  sceneSetting();
  // 描画開始タイムスタンプを取得
  startTime = Date.now();
  // 毎フレーム描画し直す
  render();

}


/**
 * イベントを設定する関数
 */
function eventSetting() {
  window.addEventListener('resize', () => {
    window.location.reload();
  });
  window.addEventListener('keydown', (e) => {
    if(e.code === "Space") {
      runner.jump();
      if(runner.life <= 0) {
        restart = true;
      }
    }
  });
}


/**
 * シーンの登録、アクティブなシーンの初期化
 */
function sceneSetting() {
  scene.add('normal_object', (activeSec) => {
    if(activeSec > 1) {
      for(let i = 0; i < NORMALOBJECT_MAX_COUNT; ++i) {
        if(normalObjectArray[i].life <= 0) {
          normalObjectArray[i].set();
          scene.use('normal_object');
          break;
        }
      }
    }
  });
  scene.add('gameover', (activeSec) => {
    ctx.font = 'bold 72px monospace';
    util.drawText('GAME OVER', canvas.width / 2 - 175, canvas.height / 2 - 50, "#f5f5f5", 350);
    // リスタート
    if(restart) {
      restart = false;
      runner.set();
      window.gameScore = 0;
      scene.use('normal_object');
    }
  });
  scene.use('normal_object');
}


/**
 * 毎フレーム描画し直す関数
 */
function render() {
  // 必ずglobalAlphaは 1 で開始する
  ctx.globalAlpha = 1;
  // 描画前にcanvas全体を明るいグレーで塗りつぶす
  util.drawRect(0, 0, canvas.width, canvas.height, '#333');

  // スコアを表示する
  ctx.font = 'bold 32px monospace';
  util.drawText( String(window.gameScore).padStart(5,'0') , 100, 75, '#f5f5f5');

  // runnerのlifeが0以下ならgameoverシーンへ移行
  if(runner.life <= 0) {
    scene.use('gameover');
  }

  // シーンを更新
  scene.update();

  // groundを更新
  ground.update();
  // groundStoneArrayを更新
  groundStoneArray.forEach((groundStone) => {
    groundStone.update();
  })
  // runnerを更新
  runner.update();
  // normalObjectArrayを更新
  normalObjectArray.forEach((normalObject) => {
    normalObject.update();
  }) 

  // 毎フレーム描画し直す
  requestAnimationFrame(render);
}


})();


// /**
//  * 度数法の角度をラジアンに変換し、返す関数
//  * @param {number} degrees - 度数法の角度
//  */
// function degreesToRadians(degrees) {
//   return degrees * Math.PI / 180;
// }