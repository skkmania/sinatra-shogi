/**
 * Cell
 */
Cell = Class.create();
Cell.all = $A();
Cell.prototype = {
	/**
	 * initialize(board, x, y, top)
	 */
  initialize: function initialize(board, x, y, top) {
    Cell.all.push(this);
    this.board = board;
    this.type = 'cell';
    this.game = this.board.game;
    this.log = this.game.log;
    this.x = x;
    this.y = y;
    //this.top = top;
    this.marginTop = 0;
    this.marginLeft = 0;
    this.width = 40;
    this.hight = 42;
  },
	/**
	 * say()
	 */
  say: function say(){ // Cell
    //this.log.getInto('Cell#say');
    // このセルにいるpieceの状態を文字にして返す
    if (!this.piece){
      //this.log.goOut();
      return 'x';
    }
    var retChar = Type2chr[this.piece.type];
    //this.log.debug('retChar : ' + retChar);
    if(this.piece.isBlack()){
      //this.log.goOut();
      return retChar.toUpperCase();
    } else {
      //this.log.goOut();
      return retChar; 
    }
  },
	/**
	 * put(piece)
	 */
  put: function put(piece) { // Cell
    this.log.getInto('Cell#put');
    this.piece = piece;
    this.piece.cell = this;
    if(this.elm) this.elm.appendChild(piece.elm);
    this.log.debug('leaving with piece : ' + this.piece.toDebugString());
    this.log.goOut();
  },
	/**
	 * move(toY, toX)
	 */
  move: function move(toY,toX){ // Cell
    this.elm.style.left = (this.marginLeft + this.width * toX) + 'px';
    this.elm.style.top = (this.marginTop + this.width * toY) + 'px';
  },
	/**
	 * getPosition()
	 */
  getPosition: function getPosition(){ // Cell
    // top値により、各セルの画面上の座標が決まる
if(this.x === 1 && this.y === 1) window.gameController.game.log.warn('-------Cell#getPosition -----------');
    if (this.game.controller.top == 1){
      var bh = this.game.height;
      this.elm.style.left = (this.marginLeft + this.width * this.x) + 'px';
      this.elm.style.top = (this.marginTop + this.hight * (bh - 1 - this.y)) + 'px';
    } else {
      var bw = this.game.width;
      this.elm.style.left = (this.marginLeft + this.width * (bw - 1 - this.x)) + 'px';
      this.elm.style.top = (this.marginTop + this.hight * this.y) + 'px';
    }
  },
	/**
	 * createDummyElm()
	 */
  createDummyElm: function createDummyElm() {  // Cell
    this.elm = document.createElement('div');
    this.elm.id = 'dummyCell-' + this.x + '-' + this.y;
    this.elm.obj = this;
    this.elm.addClassName('dummyCell');
    this.getPosition();
    this.dummyPiece = document.createElement('div');
    if(this.x === 0 && this.y === 0){
      this.dummyPiece.id = 'cornerDummy';
      this.dummyPiece.innerHTML = '';
    } else {
      if(this.x === 0){
        this.dummyPiece.addClassName('rowNum');
        this.dummyPiece.innerHTML = this.y.toKanji();
      }
      if(this.y === 0){
        this.dummyPiece.addClassName('colNum');
        this.dummyPiece.innerHTML = this.x;
      }
    }
    this.elm.appendChild(this.dummyPiece);
    this.board.elm.appendChild(this.elm);
  },
	/**
	 * createElm()
	 */
  createElm: function createElm() {  // Cell
    this.elm = document.createElement('div');
    this.elm.id = 'cell-' + this.x + '-' + this.y;
    this.elm.obj = this;
    this.elm.addClassName('cell');
    this.getPosition();
    this.board.elm.appendChild(this.elm);
    this.log.warn('Droppables to add ' + this.elm.id);
    Droppables.add(this.elm, {
      toDebugString: function toDebugString(){
        return 'Droppable : ' + this.toDebugString();
      }.bind(this),
      accept: 'piece',
	/**
	 * onDrop(draggable)
	 */
      onDrop: function onDrop(draggable) {
        this.log.getInto('Droppable#onDrop',{ "background":"#aaccff" });

        // make action contents
        var fromObj = draggable.parentNode.obj;
        var toCell = this;
        var piece = draggable.obj;
        var actionContents = [piece, fromObj, toCell];
        this.log.debug('actionContents:');
        this.log.debug('piece :' + piece.toDebugString());
        this.log.debug('fromObj :' + fromObj.toDebugString());
        this.log.debug('toCell :' + toCell.toDebugString());

        // send action to GameController
        this.game.controller.receiveAction(actionContents);
        this.log.goOut();

      }.bind(this)
    });
  },
	/**
	 * show()
	 */
  show: function show() { // Cell
    this.log.getInto('Cell#show');
    this.log.debug(this.toDebugString());
    if (!this.elm) {
      (this.x === 0 || this.y === 0) ? this.createDummyElm() : this.createElm();
    }
    if (this.piece) {
      this.log.debug('in show of Cell, processing -> ' + this.piece.toDebugString());
      this.elm.appendChild(this.piece.elm);
      if(this.piece.isBlack() == (this.game.controller.top === 0)){
        this.piece.elm.addClassName('bottom');
        this.piece.elm.removeClassName('top');
      } else {
        this.piece.elm.addClassName('top');
        this.piece.elm.removeClassName('bottom');
      }
      this.log.debug('in show of Cell, after process -> ' + this.piece.toDebugString());
    }
    this.log.debug('leaving show of Cell: ' + this.toDebugString());
    this.log.goOut();
  },
	/**
	 * isOpponentArea(playerArg, lineArg)
	 */
        // playerArg : playerオブジェクト。defaultは現在手番のplayer
        // line : 数値。nはn段め以内にあるかどうか、を返すよう指定する
        //    3なら敵陣全体だし、1なら下段にあるかどうかの意味
        //    default は3
  isOpponentArea: function isOpponentArea(playerArg, lineArg) { // Cell
    var ret;
    this.log.getInto('Cell#isOpponentArea');
    var player = playerArg || window.gameController.playerInTurn();
    var line = lineArg || 3;
    this.log.debug('this cell : ' + this.toDebugString());
    this.log.debug('player : ' + player.id);
    this.log.debug('line : ' + line);
    if (player.id == 'player1') {
      ret = (this.y > 0) && (this.y < line+1);
    }
    else if (player.id == 'player2') {
      ret = (this.y > (9-line)) && (this.y < 10);
    }
    else {
      this.log.fatal('no player?: ' + player.id);
    }
    this.log.debug('leaving with : ' + ret);
    this.log.goOut();
    return ret;
  },
	/**
	 * isOpponentFirstLine(player)
	 */
  isOpponentFirstLine: function isOpponentFirstLine(playerArg) { // Cell
    var player = playerArg || window.gameController.playerInTurn();
    if (window.gameController.player1.id == player.id) {
      return this.y === 1;
    }
    else if (window.gameController.player2.id == player.id) {
      return this.y === 9;
    }
    else {
      throw 'not reach: ' + player.id;
    }
  },
	/*
	 * deleteOwnPiece()
	 */
  deleteOwnPiece: function deleteOwnPiece(){  // Cell
    this.log.getInto('Cell#deleteOwnPiece');
    if(this.piece){
      this.log.warn('this cell.piece to be deleted: ' + this.piece.toDebugString());
    }
    if(this.piece){
      this.piece.cell = null;
// これができないときは？
      this.elm.removeChild(this.piece.elm);
// このpieceにDraggableがついていたらdestroyしないといけないはず？
      if(this.piece.drag){
        this.piece.drag.destroy();
        this.piece.drag = null;
        this.log.debug('piece.drag was destroid  : ' + this.piece.drag);
      }
      delete this.piece;
      this.piece = null;
    }
    this.log.goOut();
    return;
  }, 
	/**
	 * removeOwnPiece()
	 */
  removeOwnPiece: function removeOwnPiece(){  // Cell
    this.log.getInto('Cell#removeOwnPiece');
    if(this.piece) {
      this.log.debug('this cell.piece to be removed: ' + this.piece.toDebugString());
    }
    var ret = null;
    if(this.piece){
      ret = this.piece;
      this.piece.cell = null;
      this.elm.removeChild(this.piece.elm);
      this.piece = null;
    }
    this.log.debug('leaving as :' + this.toDebugString());
    this.log.goOut();
    return ret;
  },
	/**
	 * replaceOwnPieceWith(newPiece)
	 */
  replaceOwnPieceWith: function replaceOwnPieceWith(newPiece){  // Cell
    // 敵駒のあるセルに自駒を動かすとき、敵駒の敵stand(つまり自分のスタンド）
    // に駒を動かしてから自駒をこのセルに置く
    // この処理は駒を動かすとき、つまりmoveから呼ばれなければならない
    this.log.getInto('Cell#replaceOwnPieceWith');
    this.log.debug('newPiece : ' + newPiece.toDebugString());
    var tmp = null;
    if(this.piece){
      tmp = this.piece;
      this.piece.gotoOpponentsStand();
      this.piece = null;
    }
    this.piece = newPiece;
    this.put(newPiece);
    if (tmp){
      this.log.debug('leaving Cell#replaceOwnPieceWith with : ' + tmp.toDebugString());
      this.log.goOut();
        return tmp;
    } else {
      this.log.debug('leaving Cell#replaceOwnPieceWith nothing');
      this.log.goOut();
        return;
    }
  },
	/**
	 * toArray()
	 */
  toArray: function toArray() {
    return [this.x, this.y];
  },
	/**
	 * toJSON()
	 */
  toJSON: function toJSON() {
    if (this.piece) {
      return this.piece.chr;
    }
    else {
      return '';
    }
  },
	/**
	 * toDebugString()
	 */
  toDebugString: function toDebugString(){  // Cell
    var ret = '';
    ret += '[' + this.x + ',' + this.y + ']';
    if(this.elm) ret += ', elm: ' + this.elm.id;
    if(this.piece) ret += ', piece: ' + this.piece.toDebugString();
    return ret;
  }
}
