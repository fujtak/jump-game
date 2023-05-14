
// このファイルでは、シーン関連のクラスを定義する

class SceneManager {

  constructor() {
    /**
     * シーン
     * @type {object}
     */
    this.scene = {};
    /**
     * 現在アクティブなシーン
     * @type {function}
     */
    this.activeScene = null;
    /**
     * アクティブにした時刻のタイムスタンプ
     * @type {number}
     */
    this.startTime = null;
    /**
     * アクティブにしてからのフレーム数
     */
    this.activeFrame = null;
  }

  /**
   * シーンを登録する
   * @param {string} name - 登録するシーンの名前 
   * @param {function} func - 登録するシーンの関数
   */
  add(name, func) {
    this.scene[name] = func;
  }

  /**
   * アクティブなシーンを選ぶ
   */
  use(name) {
    // アクティブにした時刻のタイムスタンプを代入
    this.startTime = Date.now();
    // アクティブにしてからのフレーム数をリセットする
    this.activeFrame = -1;
    // アクティブなシーンを選ぶ
    this.activeScene = this.scene[name];
  }

  /**
   * メインロジックで毎フレーム繰り返し実行される、シーンの更新
   */
  update() {
    // アクティブなシーンに渡すため、アクティブになってからの経過時間(秒)を取得
    const activeSec = (Date.now() - this.startTime) / 1000;
    // アクティブになってからの経過時間(秒)を引数に入力し、現在アクティブなシーンを実行する
    this.activeScene(activeSec);
    // アクティブになってからのフレーム数をインクリメントする
    ++this.activeFrame;
  }

}