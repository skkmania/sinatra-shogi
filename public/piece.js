HOST = 'http://skkmania.sakura.ne.jp/shogi/';
var Type2chr = { 'Pawn' : 'p', 'Lance' : 'l', 'kNight' : 'n', 'Silver' : 's',
                 'Gold' : 'g', 'Bishop': 'b', 'Rook'   : 'r', 'King'   : 'k',
                 'Qpawn': 'q', 'Mlance': 'm', 'Oknight': 'o', 'Tsilver': 't',
                 'Horse': 'h', 'Dragon': 'd' };

var Chr2Type = { 'p': 'Pawn', 'l': 'Lance', 'n': 'kNight', 's': 'Silver',
                 'g': 'Gold', 'b': 'Bishop','r': 'Rook',   'k': 'King',
                 'q': 'Qpawn','m': 'Mlance','o': 'Oknight','t': 'Tsilver',
                 'h': 'Horse','d': 'Dragon'}; 

var Chr2Kanji= { 'p': '歩', 'l': '香', 'n': '桂', 's': '銀',
                 'g': '金', 'b': '角','r': '飛',   'k': '玉',
                 'q': 'と','m': '成香','o': '成桂','t': '成銀',
                 'h': '馬','d': '龍'}; 

function create_piece(chr){
window.gameController.game.log.getInto();
  window.gameController.game.log.debug('entered create_piece: ' );
  var p = new Piece(chr);
  window.gameController.game.log.debug('leaving create_piece with :' + p.toDebugString() );
window.gameController.game.log.goOut();
  return p;
}
/**
 * Piece Class
 */
Piece = Class.create({
	/**
	 * initialize(chr)
	 */
  initialize: function initialize(chr, game) { // Piece
    this.game = game || window.gameController.game;
    this.game.log.getInto('Piece#initialize');
    this.game.log.warn('Piece#initialize entered with : ' + chr, {'indent':1});
    this.type = Chr2Type[chr.toLowerCase()];
    this.game.log.warn('Piece#initialize type is : ' + this.type);
    Object.extend(this, PieceTypeObjects[this.type]);
    this.game.log.warn('Piece#initialize imageUrl is : ' + this.imageUrl);
    this.cell = null;
    this.drag = null;
    this.chr = chr;
    this.createElm();
    this.game.log.debug(this.toDebugString()); 
    this.game.log.goOut();
  },
	/**
	 * isBlack()
	 */
  isBlack: function isBlack() {  // Piece
//this.game.log.debug('Piece#isBlack entered : ');
    var ret = (this.chr.toUpperCase() == this.chr);
//this.game.log.debug('leaving Piece#isBlack with : ' + ret);
    return ret;
  },
	/**
	 * toggleBW()
	 */
  toggleBW: function toggleBW() {  // Piece
    this.game.log.getInto('Piece#toggleBW');
    if (this.chr == this.chr.toUpperCase())
      this.chr = this.chr.toLowerCase(); 
    else
      this.chr = this.chr.toUpperCase(); 

    this.elm.toggleClassName('top');
    this.elm.toggleClassName('bottom');

    this.game.log.goOut();
  },
	/**
	 * addDraggable(startMessage)
	 */
  addDraggable: function addDraggable(startMessage){ // Piece
    this.game.log.getInto('Piece#addDraggable');
    this.game.log.debug('piece:' + this.toDebugString());
    this.game.log.debug('msg:' + startMessage);
  
    this.drag = new Draggable(this.elm, {
          onStart: function onStart() {
            this.game.log.getInto('Draggable#onStart of ' + this.toDebugString());
            this.game.log.warn('Drag started. : ' + startMessage, {3:{'color':'#33AA88'}});
            this.game.log.goOut();
          }.bind(this),
          onEnd: function onEnd() {
            this.game.log.getInto('Draggable#onEnd of ' + this.toDebugString());
            this.elm.style.top = 0;
            this.elm.style.left = 0;
            this.game.log.goOut();
          }.bind(this)
        });
  
    this.game.log.debug('drags #: ' + Draggables.drags.length);
    this.game.log.debug('added obj is : ' + this.drag.toString());
    this.game.log.goOut();
  },
	/**
	 * toggleDraggable()
	 */
  toggleDraggable: function toggleDraggable(){ // Piece
    this.game.log.getInto('Piece#toggleDraggable');

    // for log
    this.game.log.debug('piece : '+this.toDebugString());
    if(this.drag){
      this.game.log.debug('this.drag : '+ this.drag.toString());
    } else {
      this.game.log.debug('this piece has no drag');
    }
    this.game.log.debug('count : '+this.game.controller.count);

    // main
    if ( (this.game.controller.playerSetting == 'public')
      || (this.game.controller.playerSetting == 'review') ) 
      this.simpleToggleDraggable();
    else
      this.viewerRelatedToggleDraggable();
    this.game.log.goOut();
  },

	/**
	 * simpleToggleDraggable()
	 */
  simpleToggleDraggable: function simpleToggleDraggable(){ // Piece
    this.game.log.getInto('Piece#simpleToggleDraggable');
    if (!this.drag){
      if (this.game.board.turn) {
        if (this.isBlack())
          this.addDraggable('toggled');
      } else {
        if (!this.isBlack())
          this.addDraggable('toggled');
      }
    } else {
        this.drag.destroy();
        this.drag = null;
        this.game.log.debug('drag destroyed because this has one : '+ Draggables.drags.length);
    }
    this.game.log.goOut();
  },
	/**
	 * viewerRelatedToggleDraggable()
	 */
  viewerRelatedToggleDraggable: function viewerRelatedToggleDraggable(){ // Piece
    this.game.log.getInto('Piece#viewerRelatedToggleDraggable');
    var thisPieceIsViewers = this.isViewersP();
    this.game.log.debug('isViewersP : '+ thisPieceIsViewers);
    var thisTurnIsViewers = this.game.controller.isViewersTurn();
    this.game.log.debug('isViewersTurn : '+thisTurnIsViewers);
    if (!this.drag){
        if(thisPieceIsViewers && thisTurnIsViewers){
          this.addDraggable('toggled');
        }
    } else {
        if(thisPieceIsViewers){
          if(!thisTurnIsViewers){
            this.game.log.debug('to destroy drag because this is not Vieweres turn. : '+ Draggables.drags.length);
            this.drag.destroy();
            this.game.log.debug('length of drags became : '+ Draggables.drags.length);
            this.drag = null;
          }
        } else {
          this.game.log.debug('to destroy drag because this is not Vieweres piece. : '+ Draggables.drags.length);
          this.drag.destroy();
          this.game.log.debug('length of drags became : '+ Draggables.drags.length);
          this.drag = null;
        }
    }
    this.game.log.debug(this.drag ? 'drag remains':'no drag');
    this.game.log.goOut();
  },
	/**
	 * createElm()
	 */
  createElm: function createElm() {  // Piece
this.game.log.getInto('Piece#createElm');
    this.elm = document.createElement('img');
    this.elm.obj = this;
    this.elm.src = this.imageUrl;
    this.elm.addClassName('piece');
    if (!this.atTop()) {
      this.elm.addClassName('bottom');
    }
    else {
      this.elm.addClassName('top');
    }
this.game.log.goOut();
  },
	/**
	 * setClassName(player)
	 */
  setClassName: function setClassName() { // Piece
this.game.log.getInto('Piece#setClassName');
this.game.log.warn('chr : ' + this.chr + ',  atTop : ' + this.atTop() + ',  this.elm.classname: ' + this.elm.className);
    if (!this.atTop()) {
      this.elm.addClassName('bottom');
      this.elm.removeClassName('top');
    }
    else {
      this.elm.removeClassName('bottom');
      this.elm.addClassName('top');
    }
if (window.gameController.game){ window.gameController.game.log.warn('leaving piece setClassName : ' + this.chr + ',  atTop : ' + this.atTop() + ',  this.elm.classname: ' + this.elm.className);
this.game.log.goOut();
}
  },
	/**
	 * atTop()
	 */
  atTop: function atTop(){ // Piece
    return (this.game.controller.top == 1) == this.isBlack();
  },
	/**
	 * isTurn()
	 */
        // このコマが現在手番かどうかを返す
  isTurn: function isTurn(){ // Piece
    if (this.game.controller.getTurn()) return this.isBlack();
    else return !this.isBlack();
  },
	/**
	 * canMoveTo(x, y)
	 */
        // このコマが座標x,yに動けるかどうか返す
        // このコマがセル上にいるとき限定の関数
  canMoveTo: function canMoveTo(x, y) { // Piece
    var ret;
    this.game.log.getInto('Piece#canMoveTo');
    var dx = x - this.cell.x;
    var dy = y - this.cell.y;
    this.isBlack() ? dx *= -1 : dy *= -1;
    this.game.log.debug('dx, dy : ' + dx + ', ' + dy);
    ret = this.movableCheck(dx, dy);
    this.game.log.debug('leaving with: ' + ret);
    this.game.log.goOut();
    return ret;
  },
	/**
	 * canMoveFromStand(toCell)
	 */
  canMoveFromStand: function canMoveFromStand(toCell) { // Piece
    var ret = true;
    this.game.log.getInto('Piece#canMoveFromStand');
    // 二歩のチェック
    switch (this.type){
      case 'Pawn':
        if (this.game.board.pawnExists(toCell.y, this.chr)){
          ret = false;
        } else {
          ret = !toCell.isOpponentArea(null, 1);
        }
        break;
      case 'Lance':
        ret = !toCell.isOpponentArea(null, 1);
        break;
      case 'kNight':
        ret = !toCell.isOpponentArea(null, 2);
        break;
    }
    this.game.log.debug('leaving with: ' + ret);
    this.game.log.goOut();
    return ret;
  },
	/**
	 * canMove(fromObj, toCell)
	 */
  canMove: function canMove(fromObj, toCell) { // Piece
    var ret;
    this.game.log.getInto('Piece#canMove');
    this.game.log.debug('from: ' + fromObj.toDebugString() + ', to: ' + toCell.toDebugString());
    if (fromObj.type == 'stand'){
      ret = this.canMoveFromStand(toCell);
    } else {
      // 香、飛、角、龍、馬のときは駒を飛び越えないかチェックが必要
      if('LRBDH'.include(this.chr.toUpperCase()) &&
          this.game.board.pieceExistsBetween(fromObj, toCell)){
        ret = false;
      } else {
        ret = this.canMoveTo(toCell.x, toCell.y);
      }
    }
    this.game.log.debug('leaving with: ' + ret);
    this.game.log.goOut();
    return ret;
  },
	/**
	 * move(fromCell, toCell, notCapture, dropOrState)
	 */
  move: function move(fromCell, toCell, notCapture, dropOrState) {  // Piece
this.game.log.getInto();
window.gameController.game.log.warn('Piece#move 1 : ');
    var capturedPiece = null;
    var movingPiece = null;
    if(fromCell) movingPiece = fromCell.removeOwnPiece();
window.gameController.game.log.warn('Piece#move 2 : ');
    capturedPiece = toCell.replaceOwnPieceWith(movingPiece);
window.gameController.game.log.warn('Piece#move 3 : ');
this.game.log.goOut();
    return capturedPiece;
  },
	/**
	 * sitOnto(cell)
	 */
  sitOnto: function sitOnto(distination_cell) { // Piece
    this.game.log.getInto('Piece#sitOnto');
    this.game.log.debug('entered : ' + distination_cell.toDebugString(), {'indent':1});
    if(this.cell) this.cell.elm.removeChild(this.elm);
    distination_cell.piece = this;
    distination_cell.elm.appendChild(this.elm);
    this.cell = distination_cell;
    this.game.log.debug('leaving Piece#sitOnto as ' + this.toDebugString(), {'indent':-1});
    this.game.log.goOut();
  },
	/**
	 * gotoOpponentsStand()
	 */
  gotoOpponentsStand: function gotoOpponentsStand() { // Piece
    this.game.log.getInto('Piece#gotoOpponentsStand');
    this.game.log.debug('piece: ' + this.toDebugString());
    if(this.unpromote_type){
      this.unpromote();
      this.game.log.debug('unpromoted : ' + this.toDebugString());
    }
    if(this.isBlack()){
      this.game.whiteStand.put(this);
    } else {
      this.game.blackStand.put(this);
    }
      this.game.log.debug('leaving Piece#gotoOpponentsStand : ');
      this.game.log.debug('piece: ' + this.toDebugString());
      this.game.log.goOut();
  },
	/**
	 * isViewersP()
	 */
  isViewersP: function isViewersP(game) { // Piece
    this.game.log.getInto('Piece#isViewersP');
    var ret;
    if (this.isBlack()){
      this.game.log.debug('owner name : ' + this.game.controller.player1.name);
      ret = this.game.controller.player1.isViewer;
    } else {
      this.game.log.debug('owner name : ' + this.game.controller.player2.name);
      ret = this.game.controller.player2.isViewer;
    }
    this.game.log.debug('returning with : ' + ret);
    this.game.log.goOut();
    return ret;
  },
	/**
	 * isGoal(cell)
	 */
  isGoal: function isGoal(cell) { // Piece
    return ( this.isBlack() ? (cell.y === 1) : (cell.y === 9) );
  },
	/**
	 * promote()
	 */
  promote: function promote() {  // Piece
    this.game.log.getInto('Piece#promote');
    this.game.log.debug(this.toDebugString());
    if(this.promote_type){
      this.imageUrl = PieceTypeObjects[this.promote_type].imageUrl;
      this.elm.src = this.imageUrl;
      this.type = PieceTypeObjects[this.promote_type].type;
      this.unpromote_type = PieceTypeObjects[this.promote_type].unpromote_type;
      if(this.isBlack())
        this.chr = Type2chr[this.type].toUpperCase();
      else
        this.chr = Type2chr[this.type];
      this.movableCheck = PieceTypeObjects[this.promote_type].movableCheck;
      this.promote_type = undefined;
      this.game.log.debug('promoted : ' + this.toDebugString());
    } else {
      this.game.log.fatal('this piece cannot promote.');
    }
    this.game.log.goOut();
  },
  	/**
	 * unpromote()
	 */
  unpromote: function unpromote() {  // Piece
    this.game.log.getInto('Piece#unpromote');
    this.game.log.debug(this.toDebugString());
    if(this.unpromote_type){
      this.imageUrl = PieceTypeObjects[this.unpromote_type].imageUrl;
      this.elm.src = this.imageUrl;
      this.type = PieceTypeObjects[this.unpromote_type].type;
      this.promote_type = PieceTypeObjects[this.unpromote_type].promote_type;
      this.movableCheck = PieceTypeObjects[this.unpromote_type].movableCheck;
      if(this.isBlack())
        this.chr = Type2chr[this.type].toUpperCase();
      else
        this.chr = Type2chr[this.type];
      this.unpromote_type = undefined;
      this.game.log.debug('unpromoted : ' + this.toDebugString());
    } else {
      this.game.log.fatal('this piece cannot unpromote.');
    }
    this.game.log.goOut();
  },
	/**
	 * toDebugString()
	 */
  toDebugString: function toDebugString() {  // Piece
    var ret = 'chr: <span style="color: #3F8080">' + this.chr + '</span>, ';
    ret += (', className: ' + this.elm.className);
    ret += (', promote_type: ' + this.promote_type || 'undefined');
    ret += (', unpromote_type: ' + this.unpromote_type || 'undefined');
    if (this.cell && this.cell.elm) ret += (', cell_name:' + this.cell.elm.id);
    else ret += ', [no cell]';
    return ret;
  }
});

/**
 * KingMovableCheck(dx,dy) 
 */
function KingMovableCheck(dx,dy){
  if(Math.abs(dx) > 1 || Math.abs(dy) > 1) return false;
  return  [
            [true,  true,  true],
            [true,  false, true],
            [true,  true,  true]
          ][dy + 1][dx + 1];
}
 
/**
 * GoldMovableCheck(dx,dy) 
 */
function GoldMovableCheck(dx,dy){
  if(Math.abs(dx) > 1 || Math.abs(dy) > 1) return false;
  return  [
            [true,  true,  true],
            [true,  false, true],
            [false, true,  false]
          ][dy + 1][dx + 1];
}
 
/**
 * PieceTypeObjects 
 */
// 以下の各駒のmovableCheckは、先手の立場でdx, dyを受け取ったときの条件判断をしている。
// したがって、これを呼び出す側(canMove)はそうなるようにdx,dyを補正している。
var PieceTypeObjects = {
	/**
	 * King
	 */
  King: {
  imageUrl: HOST + 'img/King.png',
  type: 'King',
  movableCheck: KingMovableCheck
  },
	/**
	 * Bishop
	 */
  Bishop: {
  imageUrl: HOST + 'img/Bishop.png',
  type: 'Bishop',
  movableCheck: function movableCheck(dx,dy){
    return (dx == dy || dx == (-1)*dy);
  },
  promote_type: 'Horse'
  },
	/**
	 * Horse
	 */
  Horse: {
  imageUrl: HOST + 'img/Horse.png',
  type: 'Horse',
  movableCheck: function movableCheck(dx,dy){
    if (dx == dy || dx == (-1)*dy) return true;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) return false;
    return true;
  },
  unpromote_type: 'Bishop'
  },
	/**
	 * Rook
	 */
  'Rook': {
  imageUrl: HOST + 'img/Rook.png',
  type: 'Rook',
  movableCheck: function movableCheck(dx,dy){
    return (dx == 0 || dy == 0);
  },
  promote_type: 'Dragon'
  },
	/**
	 * Dragon
	 */
  Dragon: {
  imageUrl : HOST + 'img/Dragon.png',
  type : 'Dragon',
  movableCheck: function movableCheck(dx,dy){
    if (dx == 0 || dy == 0) return true;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) return false;
    return true;
  },
  unpromote_type: 'Rook'
  },
	/**
	 * Gold
	 */
  Gold: {
  imageUrl: HOST + 'img/Gold.png',
  type: 'Gold',
  movableCheck: GoldMovableCheck
  },
	/**
	 * Silver
	 */
  Silver: {
  imageUrl: HOST + 'img/Silver.png',
  type: 'Silver',
  movableCheck: function movableCheck(dx,dy){
    if(Math.abs(dx) > 1 || Math.abs(dy) > 1) return false;
    return  [
              [true,  true,  true],
              [false, false, false],
              [true,  false, true]
            ][dy + 1][dx + 1];
    },
  promote_type: 'Tsilver'
  },
	/**
	 * Tsilver
	 */
  Tsilver: {
  imageUrl: HOST + 'img/Tsilver.png',
  type: 'Tsilver',
  movableCheck: GoldMovableCheck,
  unpromote_type: 'Silver'
  },
	/**
	 * kNight
	 */
  kNight: {
  imageUrl: HOST + 'img/kNight.png',
  type: 'kNight',
  movableCheck: function movableCheck(dx,dy){
    return (dx ==  1 && dy == -2) ||
           (dx == -1 && dy == -2);
  },
  promote_type: 'Oknight'
  },
	/**
	 * Oknight
	 */
  Oknight: {
  imageUrl: HOST + 'img/Oknight.png',
  type: 'Oknight',
  movableCheck: GoldMovableCheck,
  unpromote_type: 'kNight'
  },
	/**
	 * Lance
	 */
  Lance: {
  imageUrl: HOST + 'img/Lance.png',
  type: 'Lance',
  movableCheck: function movableCheck(dx,dy){
    return (dx == 0 && dy < 0);
  },
  promote_type: 'Mlance'
  },
	/**
	 * Mlance
	 */
  Mlance: {
  imageUrl: HOST + 'img/Mlance.png',
  type: 'Mlance',
  movableCheck: GoldMovableCheck,
  unpromote_type: 'Lance'
  },
	/**
	 * Pawn
	 */
  Pawn: {
  imageUrl: HOST + 'img/Pawn.png',
  type: 'Pawn',
  movableCheck: function movableCheck(dx,dy){
      return (dx === 0 && dy === -1);
    },
  promote_type: 'Qpawn'
  },
	/**
	 * Qpawn
	 */
  Qpawn: {
  imageUrl: HOST + 'img/Qpawn.png',
  type: 'Qpawn',
  movableCheck: GoldMovableCheck,
  unpromote_type: 'Pawn'
  }
}

