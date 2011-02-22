HOST = 'http://sq-gps:4567/';
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

var Chr2KanjiOne= { 'p': '歩', 'l': '香', 'n': '桂', 's': '銀',
                 'g': '金', 'b': '角','r': '飛',   'k': '玉',
                 'q': 'と','m': '杏','o': '圭','t': '全',
                 'h': '馬','d': '龍'}; 

var Chr2Ord =  { 'p':7, 'l':6, 'n':5, 's':4, 'g':3, 'b':2, 'r':1, 'k':0,
                 'q':7, 'm':6, 'o':5, 't':4,        'h':2, 'd':1,
                 'P':7, 'L':6, 'N':5, 'S':4, 'G':3, 'B':2, 'R':1, 'K':0,
                 'Q':7, 'M':6, 'O':5, 'T':4,        'H':2, 'D':1 }; 

function create_piece(chr){
  LOG.getInto();
  LOG.debug('entered create_piece: ' );
  var p = new Piece(chr);
  LOG.debug('leaving create_piece with :' + p.toDebugString() );
  LOG.goOut();
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
    this.isTxt = window.gameController.options.isTxt;
    LOG.getInto('Piece#initialize');
    LOG.warn('Piece#initialize entered with : ' + chr, {'indent':1});
    this.type = Chr2Type[chr.toLowerCase()];
    LOG.warn('Piece#initialize type is : ' + this.type);
    Object.extend(this, PieceTypeObjects[this.type]);
    LOG.warn('Piece#initialize imageUrl is : ' + this.imageUrl);
    this.cell = null;
    this.drag = null;
    this.chr = chr;
    this.createElm();
    LOG.debug(this.toDebugString()); 
    LOG.goOut();
  },
	/**
	 * refreshImageUrl()
	 */
  refreshImageUrl: function refreshImageUrl() {  // Piece
    LOG.getInto('Piece#refreshImageUrl');
    this.imageUrl = PieceTypeObjects[this.type].imageUrl;
    this.imgElm.src = this.imageUrl;
    LOG.goOut();
  },
	/**
	 * isBlack()
	 */
  isBlack: function isBlack() {  // Piece
    LOG.debug2('Piece#isBlack entered : ');
    var ret = (this.chr.toUpperCase() == this.chr);
    LOG.debug2('leaving Piece#isBlack with : ' + ret);
    return ret;
  },
	/**
	 * toggleBW()
	 */
  toggleBW: function toggleBW() {  // Piece
    LOG.getInto('Piece#toggleBW');
    if (this.chr == this.chr.toUpperCase())
      this.chr = this.chr.toLowerCase(); 
    else
      this.chr = this.chr.toUpperCase(); 

    this.elm.toggleClassName('top');
    this.elm.toggleClassName('bottom');

    LOG.goOut();
  },
	/**
	 * addDraggable(startMessage)
	 */
  addDraggable: function addDraggable(startMessage){ // Piece
    LOG.getInto('Piece#addDraggable');
    LOG.debug('piece:' + this.toDebugString());
    LOG.debug('msg:' + startMessage);
  
    this.drag = new Draggable(this.elm, {
          onStart: function onStart() {
            LOG.getInto('Draggable#onStart');
            LOG.debug(this.toDebugString());
            LOG.debug('Drag started. : ' + startMessage);
            LOG.goOut();
          }.bind(this),
          onEnd: function onEnd() {
            LOG.getInto('Draggable#onEnd');
            LOG.debug(this.toDebugString());
            this.elm.style.top = 0;
            this.elm.style.left = 0;
            LOG.goOut();
          }.bind(this)
        });
  
    LOG.debug('drags #: ' + Draggables.drags.length);
    LOG.debug('added obj is : ' + this.drag.toString());
    LOG.goOut();
  },
	/**
	 * toggleDraggable()
	 */
  toggleDraggable: function toggleDraggable(){ // Piece
    LOG.getInto('Piece#toggleDraggable');

    // for log
    LOG.debug('piece : '+this.toDebugString());
    if(this.drag){
      LOG.debug('this.drag : '+ this.drag.toString());
    } else {
      LOG.debug('this piece has no drag');
    }
    LOG.debug('count : '+this.game.controller.count);

    // main
    if ( (this.game.controller.playerSetting == 'public')
      || (this.game.controller.playerSetting == 'review') ) 
      this.simpleToggleDraggable();
    else
      this.viewerRelatedToggleDraggable();
    LOG.goOut();
  },

	/**
	 * simpleToggleDraggable()
	 */
  simpleToggleDraggable: function simpleToggleDraggable(){ // Piece
    LOG.getInto('Piece#simpleToggleDraggable');
    LOG.debug('turn : '+this.game.board.turn);
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
        LOG.debug('drag destroyed because this has one : '+ Draggables.drags.length);
    }
    LOG.goOut();
  },
	/**
	 * viewerRelatedToggleDraggable()
	 */
  viewerRelatedToggleDraggable: function viewerRelatedToggleDraggable(){ // Piece
    LOG.getInto('Piece#viewerRelatedToggleDraggable');
    var thisPieceIsViewers = this.isViewersP();
    LOG.debug('isViewersP : '+ thisPieceIsViewers);
    var thisTurnIsViewers = this.game.controller.isViewersTurn();
    LOG.debug('isViewersTurn : '+thisTurnIsViewers);
    var thisPieceIsInTurn = (this.isBlack() == this.game.controller.getTurn());
    LOG.debug('isInTurn : '+ thisPieceIsInTurn);
    if (!this.drag){
        if(thisPieceIsInTurn && thisPieceIsViewers && thisTurnIsViewers){
          this.addDraggable('toggled');
        }
    } else {
        if(thisPieceIsViewers){
          if(!thisPieceIsInTurn){
            LOG.debug('to destroy drag because this piece is not at turn. : '+ Draggables.drags.length);
            this.drag.destroy();
            LOG.debug('length of drags became : '+ Draggables.drags.length);
            this.drag = null;
          } else {
            if(!thisTurnIsViewers){
              LOG.debug('to destroy drag because this is not Vieweres turn. : '+ Draggables.drags.length);
              this.drag.destroy();
              LOG.debug('length of drags became : '+ Draggables.drags.length);
              this.drag = null;
            }
          }
        } else {
          LOG.debug('to destroy drag because this is not Vieweres piece. : '+ Draggables.drags.length);
          this.drag.destroy();
          LOG.debug('length of drags became : '+ Draggables.drags.length);
          this.drag = null;
        }
    }
    LOG.debug(this.drag ? 'drag remains':'no drag');
    LOG.goOut();
  },
	/**
	 * createElm()
	 */
  createElm: function createElm() {  // Piece
    LOG.getInto('Piece#createElm', Log.DEBUG2);
    this.elm = document.createElement('div');
    this.elm.addClassName('piece');
    if (this.isTxt) {
      this.elm.addClassName('isTxt');
    } else {
      this.elm.addClassName('isImg');
    }
    this.elm.obj = this;
    this.imgElm = document.createElement('img');
    this.imgElm.addClassName('pieceImg');
    this.imgElm.src = this.imageUrl;
    this.txtElm = document.createElement('div');
    this.txtElm.textContent = Chr2KanjiOne[this.chr.toLowerCase()];
    this.txtElm.addClassName('pieceTxt');
/*
    switch(this.txtElm.textContent){
      case '成銀':
           this.txtElm.textContent = '全';
           break;
      case '成桂':
           this.txtElm.textContent = '圭';
           break;
      case '成香':
           this.txtElm.textContent = '杏';
           break;
      default:
           break;
    }
*/
    if (!this.atTop()) {
      this.elm.addClassName('bottom');
    }
    else {
      this.elm.addClassName('top');
    }
    this.elm.appendChild(this.imgElm);
    this.elm.appendChild(this.txtElm);
    LOG.goOut(Log.DEBUG2);
  },
	/**
	 * setClassName(player)
	 */
  setClassName: function setClassName() { // Piece
    LOG.getInto('Piece#setClassName');
    LOG.warn('chr : ' + this.chr + ',  atTop : ' + this.atTop() + ',  this.elm.classname: ' + this.elm.className);
    if (!this.atTop()) {
      this.elm.addClassName('bottom');
      this.elm.removeClassName('top');
    }
    else {
      this.elm.removeClassName('bottom');
      this.elm.addClassName('top');
    }
    LOG.warn(
            'leaving piece setClassName : ' + this.chr +
            ',  atTop : ' + this.atTop() +
            ',  this.elm.classname: ' + this.elm.className);
    LOG.goOut();
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
    LOG.getInto('Piece#canMoveTo');
    var dx = x - this.cell.x;
    var dy = y - this.cell.y;
    this.isBlack() ? dx *= -1 : dy *= -1;
    LOG.debug('dx, dy : ' + dx + ', ' + dy);
    ret = this.movableCheck(dx, dy);
    LOG.debug('leaving with: ' + ret);
    LOG.goOut();
    return ret;
  },
	/**
	 * canMoveFromStand(toCell)
	 */
  canMoveFromStand: function canMoveFromStand(toCell) { // Piece
    var ret = true;
    LOG.getInto('Piece#canMoveFromStand');
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
    LOG.debug('leaving with: ' + ret);
    LOG.goOut();
    return ret;
  },
	/**
	 * canMove(fromObj, toCell)
	 */
  canMove: function canMove(fromObj, toCell) { // Piece
    var ret;
    LOG.getInto('Piece#canMove');
    LOG.debug('from: ' + fromObj.toDebugString() + ', to: ' + toCell.toDebugString());
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
    LOG.debug('leaving with: ' + ret);
    LOG.goOut();
    return ret;
  },
	/**
	 * move(fromCell, toCell, notCapture, dropOrState)
	 */
  move: function move(fromCell, toCell, notCapture, dropOrState) {  // Piece
LOG.getInto();
LOG.warn('Piece#move 1 : ');
    var capturedPiece = null;
    var movingPiece = null;
    if(fromCell) movingPiece = fromCell.removeOwnPiece();
LOG.warn('Piece#move 2 : ');
    capturedPiece = toCell.replaceOwnPieceWith(movingPiece);
LOG.warn('Piece#move 3 : ');
LOG.goOut();
    return capturedPiece;
  },
	/**
	 * sitOnto(cell)
	 */
  sitOnto: function sitOnto(distination_cell) { // Piece
    LOG.getInto('Piece#sitOnto');
    LOG.debug('entered : ' + distination_cell.toDebugString(), {'indent':1});
    if(this.cell) this.cell.elm.removeChild(this.elm);
    distination_cell.piece = this;
    distination_cell.elm.appendChild(this.elm);
    this.cell = distination_cell;
    LOG.debug('leaving Piece#sitOnto as ' + this.toDebugString(), {'indent':-1});
    LOG.goOut();
  },
	/**
	 * gotoOpponentsStand()
	 */
  gotoOpponentsStand: function gotoOpponentsStand() { // Piece
    LOG.getInto('Piece#gotoOpponentsStand');
    LOG.debug('piece: ' + this.toDebugString());
    if(this.unpromote_type){
      this.unpromote();
      LOG.debug('unpromoted : ' + this.toDebugString());
    }
    if(this.isBlack()){
      this.game.whiteStand.put(this);
    } else {
      this.game.blackStand.put(this);
    }
      LOG.debug('leaving Piece#gotoOpponentsStand : ');
      LOG.debug('piece: ' + this.toDebugString());
      LOG.goOut();
  },
	/**
	 * isViewersP()
	 */
  isViewersP: function isViewersP(game) { // Piece
    LOG.getInto('Piece#isViewersP',Log.DEBUG2);
    var ret;
    if (this.isBlack()){
      LOG.debug2('owner name : ' + this.game.controller.player1.name);
      ret = this.game.controller.player1.isViewer;
    } else {
      LOG.debug2('owner name : ' + this.game.controller.player2.name);
      ret = this.game.controller.player2.isViewer;
    }
    LOG.debug2('returning with : ' + ret);
    LOG.goOut(Log.DEBUG2);
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
	// 駒が成る
	// imgElm.srcを成ったほうの画像に替える
	// 
  promote: function promote() {  // Piece
    LOG.getInto('Piece#promote');
    LOG.debug(this.toDebugString());
    if(this.promote_type){
      this.imageUrl = PieceTypeObjects[this.promote_type].imageUrl;
      this.imgElm.src = this.imageUrl;
      this.type = PieceTypeObjects[this.promote_type].type;
      this.unpromote_type = PieceTypeObjects[this.promote_type].unpromote_type;
      if(this.isBlack())
        this.chr = Type2chr[this.type].toUpperCase();
      else
        this.chr = Type2chr[this.type];
      this.txtElm.textContent = Chr2KanjiOne[this.chr.toLowerCase()];
/*
      switch(this.txtElm.textContent){
        case '成銀':
             this.txtElm.textContent = '全';
             break;
        case '成桂':
             this.txtElm.textContent = '圭';
             break;
        case '成香':
             this.txtElm.textContent = '杏';
             break;
        default:
             break;
      }
*/
      this.movableCheck = PieceTypeObjects[this.promote_type].movableCheck;
      this.promote_type = undefined;
      LOG.debug('promoted : ' + this.toDebugString());
    } else {
      LOG.fatal('this piece cannot promote.');
    }
    LOG.goOut();
  },
  	/**
	 * unpromote()
	 */
  unpromote: function unpromote() {  // Piece
    LOG.getInto('Piece#unpromote');
    LOG.debug(this.toDebugString());
    if(this.unpromote_type){
      this.imageUrl = PieceTypeObjects[this.unpromote_type].imageUrl;
      this.imgElm.src = this.imageUrl;
      this.type = PieceTypeObjects[this.unpromote_type].type;
      this.promote_type = PieceTypeObjects[this.unpromote_type].promote_type;
      this.movableCheck = PieceTypeObjects[this.unpromote_type].movableCheck;
      if(this.isBlack())
        this.chr = Type2chr[this.type].toUpperCase();
      else
        this.chr = Type2chr[this.type];
      this.unpromote_type = undefined;
      LOG.debug('unpromoted : ' + this.toDebugString());
    } else {
      LOG.fatal('this piece cannot unpromote.');
    }
    LOG.goOut();
  },
	/**
	 * toDebugString()
	 */
  toDebugString: function toDebugString() {  // Piece
    var ret = '<div style="color: #3F80FF">[';
    ret += '<span style="color: #000000">' + this.chr + '</span>,  ';
    ret += 'cN: ';
    ret += '<span style="color: #000000">' + this.elm.className + '</span>,  ';
    ret += 'p_type: ';
    ret += '<span style="color: #000000">' + (this.promote_type || 'undefined') + '</span>,  ';
    ret += 'unp_type: ';
    ret += '<span style="color: #000000">' + (this.unpromote_type || 'undefined') + '</span>,  ';
    if (this.cell && this.cell.elm){
      ret += 'cell:';
      ret += '<span style="color: #000000">' + this.cell.elm.id + '</span>';
    } else ret += '[no cell]';
    ret += ' ]</div>';
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
 
// default
var PieceImgName = 'img/csa/';
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
  imageUrl: HOST + PieceImgName + 'King.png',
  type: 'King',
  movableCheck: KingMovableCheck
  },
	/**
	 * Bishop
	 */
  Bishop: {
  imageUrl: HOST + PieceImgName + 'Bishop.png',
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
  imageUrl: HOST + PieceImgName + 'Horse.png',
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
  imageUrl: HOST + PieceImgName + 'Rook.png',
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
  imageUrl : HOST + PieceImgName + 'Dragon.png',
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
  imageUrl: HOST + PieceImgName + 'Gold.png',
  type: 'Gold',
  movableCheck: GoldMovableCheck
  },
	/**
	 * Silver
	 */
  Silver: {
  imageUrl: HOST + PieceImgName + 'Silver.png',
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
  imageUrl: HOST + PieceImgName + 'Tsilver.png',
  type: 'Tsilver',
  movableCheck: GoldMovableCheck,
  unpromote_type: 'Silver'
  },
	/**
	 * kNight
	 */
  kNight: {
  imageUrl: HOST + PieceImgName + 'kNight.png',
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
  imageUrl: HOST + PieceImgName + 'Oknight.png',
  type: 'Oknight',
  movableCheck: GoldMovableCheck,
  unpromote_type: 'kNight'
  },
	/**
	 * Lance
	 */
  Lance: {
  imageUrl: HOST + PieceImgName + 'Lance.png',
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
  imageUrl: HOST + PieceImgName + 'Mlance.png',
  type: 'Mlance',
  movableCheck: GoldMovableCheck,
  unpromote_type: 'Lance'
  },
	/**
	 * Pawn
	 */
  Pawn: {
  imageUrl: HOST + PieceImgName + 'Pawn.png',
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
  imageUrl: HOST + PieceImgName + 'Qpawn.png',
  type: 'Qpawn',
  movableCheck: GoldMovableCheck,
  unpromote_type: 'Pawn'
  }
}

