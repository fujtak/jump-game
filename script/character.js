

/**
 * 座標を管理するためのクラス
 */
class Position {

  /**
   * @constructor
   * @param {number} x - x座標
   * @param {number} y - y座標
   */
  constructor(x, y) {
    this.x = null;
    this.y = null;
    this.set(x, y);
  }

  /**
   * 座標を設定する
   * @param {number} x - x座標
   * @param {number} y - y座標
   */
  set(x, y) {
    if(x != null) {this.x = x};
    if(y != null) {this.y = y};
  }

  /**
   * 自身の座標との距離を返す
   * @param {Position} targetPosition - 自身の座標と比較する座標
   */
  distance(targetPosition) {
    const x = this.x - targetPosition.x;
    const y = this.y - targetPosition.y;
    return Math.sqrt(x * x + y * y);
  }

}


class Ground {
  
  constructor(ctx, y, canvasW) {
    this.ctx = ctx;
    this.y = y;
    this.canvasW = canvasW;
    this.h = 2;
    this.color = "#f5f5f5";
  }

  update() {
    // 色が指定されている場合はスタイルを設定する
    if(this.color != null){
      this.ctx.strokeStyle = this.color;
    }
    // 線幅を設定する
    this.ctx.lineWidth = this.h;
    // パスの設定を開始することを明示する
    this.ctx.beginPath();
    // パスの始点を設定する
    this.ctx.moveTo(0, this.y);
    // 直線のパスを終点座標に向けて設定する
    this.ctx.lineTo(this.canvasW, this.y);
    // パスを閉じることを明示する
    this.ctx.closePath();
    // 設定したパスで線描画を行う
    this.ctx.stroke();
  }
}


class GroundStone {

  constructor(ctx, x, y) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.w = Math.floor(Math.random() * 15) + 5;
    this.h = 2;
    this.speed = 5;
    this.color = "#f5f5f5";
  }

  update() {
    // 画面外に行ったら右からリスタートする
    if(this.x + this.w < 0) {
      this.x = this.ctx.canvas.width;
    }
    // 位置を更新
    this.x -= this.speed;
    // 色が指定されている場合はスタイルを設定する
    if(this.color != null){
      this.ctx.fillStyle = this.color;
    }
    this.ctx.fillRect(this.x, this.y, this.w, this.h);
  }

}


class Runner {
  /**
   * @constructor
   * @param {CanvasRenderingContext2D} ctx - Canvas2dコンテキスト
   * @param {number} x - x座標
   * @param {number} y - y座標
   * @param {number} w - 幅
   * @param {number} h - 高さ
   * @param {number} life - キャラクターのライフ(生存フラグも兼ねる)
   */
  constructor(ctx, x, y, w, h, groundY) {
    /**
     * @type {CanvasRenderingContext2D}
     */
    this.ctx = ctx;
    /**
     * @type {Position}
     */
    this.position = new Position(x, y);
    this.firstY = y;
    /**
     * @type {number}
     */
    this.width = w;
    /**
     * @type {number}
     */
    this.height = h;
    /**
     * @type {number}
     */
    this.life = 1;
    this.groundY = groundY;
    this.isJump = false;
    this.jumpSpeed = -25;
    this.jumpAccel = 1;
    this.color = "#f5f5f5";
    this.targetArray = [];
  }

  setTargetArray(targetArray) {
    this.targetArray = targetArray;
  }

  set() {
    this.life = 1;
  }

  jump() {
    this.isJump = true;
  }

  die() {
    this.life = 0;
  }

  update() {
    // lifeが0以下なら何もしない
    if(this.life <= 0) {return;}
    // ジャンプしているならy座標を更新
    if(this.isJump) {
      // y座標を更新
      this.position.y += this.jumpSpeed;
      // 加速度により速度を更新
      this.jumpSpeed += this.jumpAccel;
      // 地面に着いたら終わり
      if(this.position.y >= this.groundY - this.height) {
        this.position.y = this.firstY;
        this.jumpSpeed = -25;
        this.isJump = false;
      }
    }
    // ターゲット
    for(let i = 0; i < this.targetArray.length; ++i) {
      // ターゲットのlifeが0以下なら何もしない
      if(this.targetArray[i].life > 0) {
        // 超えていたらスコアに加算
        if(this.targetArray[i].position.x + this.targetArray[i].width < this.position.x) {
          window.gameScore += 10; // 超えた後ずっと得点が入ってしまう...
        }
        // 辺の半分を足した値
        const addX = Math.abs(this.width / 2 + this.targetArray[i].width / 2);
        const addY = Math.abs(this.height / 2 + this.targetArray[i].height / 2);
        // 中心どうしの距離
        const distX = Math.abs((this.position.x + this.width / 2) - (this.targetArray[i].position.x + this.targetArray[i].width / 2));
        const distY = Math.abs((this.position.y + this.height / 2) - (this.targetArray[i].position.y + this.targetArray[i].height / 2));
        // 衝突の条件
        if(addX > distX && addY > distY) {
          this.die();
        }
      }
    }
    // 描画
    if(this.color != null){
      this.ctx.fillStyle = this.color;
    }
    this.ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

}


class NormalObject {
  /**
   * @constructor
   * @param {CanvasRenderingContext2D} ctx - Canvas2dコンテキスト
   * @param {number} x - x座標
   * @param {number} y - y座標
   * @param {number} w - 幅
   * @param {number} h - 高さ
   * @param {number} life - キャラクターのライフ(生存フラグも兼ねる)
   */
  constructor(ctx, x, y, w, h, life = 0) {
    /**
     * @type {CanvasRenderingContext2D}
     */
    this.ctx = ctx;
    /**
     * @type {Position}
     */
    this.position = new Position(x, y);
    /**
     * @type {number}
     */
    this.width = w;
    /**
     * @type {number}
     */
    this.height = h;
    /**
     * @type {number}
     */
    this.life = life;
    this.speed = 5;
    this.color = "#f5f5f5";
  }

  set() {
    this.life = 1;
    this.position.x = this.ctx.canvas.width;
  }

  update() {
    // ライフが0以下なら何もしない
    if(this.life <= 0) {return;}
    // 位置を更新
    this.position.x -= this.speed
    // 画面外に出たらlifeを0にする
    if(this.position.x + this.width < 0) {
      this.life = 0;
    }
    // 描画
    if(this.color != null){
      this.ctx.fillStyle = this.color;
    }
    this.ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}