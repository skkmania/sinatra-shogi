/**
 * Board
 */
Board = Class.create({
	/**
	 * initialize(elm, game)
	 */
  initialize: function initialize(game) {
    LOG.getInto('Board#initialize');
    this.bid = 1;
    this.LOG = LOG;
    this.game = game;
    this.name = 'board';
    //this.top = game.controller.top;
    this.initArea();
    this.elm = this.boardPanel || document.body;
    this.shown = false;
    this.turn = true; // trueは先手番、falseは後手番。初期化なので先手スタート
    $('boardTurn').update('board : ' + this.turn.toString());
    this.cells = [];
    for (var r = 0; r < this.game.height; r++) {
      var row = [];
      for (var c = 0; c < this.game.width; c++) {
        row.push(new Cell(this, c, r, this.game.controller.top));
      }
      this.cells.push(row);
    }
    this.initialString = 'lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxxPxSnrpxxxPBNlxpxxxPxL';
    LOG.warn('Board#initialize going to process initialString.');
    $A(this.initialString).each(function(chr, idx){
      this.LOG.getInto('reading initialString');
      this.LOG.warn('idx: ' + idx);
      if(chr == 'x'){ LOG.goOut(); return; }
      var xy = this.idx2xy(idx);
      var x = xy[0];
      var y = xy[1];
      this.LOG.warn('chr: ' + chr + ', x : ' + x +', y : ' + y);
      if(this.cells[y] && this.cells[y][x])
        this.LOG.warn('cell: ' + this.cells[y][x].toDebugString());
      else{
        this.LOG.warn('Board#initialize,  there is no cell at x: ' + x + ', y: ' + y +'.');
        return;
      }
      var p = new Piece(chr, game);
      this.LOG.debug('piece: initialized in Board#initialize : ' + p.toDebugString());
      this.cells[y][x].put(p);
      this.LOG.goOut();
    }.bind(this));
    LOG.debug('leaving Board#initialize');
    LOG.goOut();
  },
	/**
	 * initArea()
	 */
	// boardAreaに、駒台と盤のための要素を追加する
  initArea : function initArea() { // Board
    LOG.getInto('Board#initArea');
    this.area = areas[this.name];
    this.topStand = new Element('div',{ id: 'top-stand' });
    this.area.window_contents.appendChild(this.topStand);
    this.boardPanel = new Element('div',{ id: 'board-panel' });
    this.area.window_contents.appendChild(this.boardPanel);
    this.bottomStand = new Element('div',{ id: 'bottom-stand' });
    this.bottomStand.setStyle({ margin:'150px 0px 0px 400px' });
    this.area.window_contents.appendChild(this.bottomStand);
    this.area.window.open();
    LOG.goOut();
  },
	/**
	 * toDelta()
	 */
        // board情報をstateに載せるときの文字列を生成して返す
	// 入力 : なし
	// 出力 : 文字列 カンマ区切りで、
	//  bid, turn, board, blackStand, whiteStand　を並べたもの
	// 出力例 初期盤面ならば、'1,t,lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxxPxSnrpxxxPBNlxpxxxPxL,,'
  toDelta: function toDelta(){ // Board
    LOG.getInto('Board#toDelta');
    var ret = [this.bid, (this.turn?'t':'f'),this.toString(),
               this.game.blackStand.toString(), this.game.whiteStand.toString()].join(',');
    LOG.debug('returning : ' + ret);
    LOG.goOut();
    return ret;
  },
	/**
	 * fromDelta(str)
	 */
        // state上のboard情報を自身に反映させる
	// 入力 : str  state.get('board')を受け取ることを想定している
	// 入力例 初期盤面ならば、'1,t,lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxxPxSnrpxxxPBNlxpxxxPxL,,'
	// 出力 : なし
  fromDelta: function fromDelta(str){ // Board
    LOG.getInto('Board#fromDelta');
    LOG.debug('str : ' + str);
    var ary = str.split(',');
    if(ary.length != 5) LOG.fatal('Board#fromDelta:read error');
    this.bid = parseInt(ary[0]);
    this.turn = (ary[1] == 't');
    this.read(ary[2]);
    this.game.blackStand.read(ary[3]);
    this.game.whiteStand.read(ary[4]);
    LOG.goOut();
    return;
  },
	/**
	 * pawnExists(x, chr)
	 */
        // 列xにchrを持つ駒が存在したらtrueを返す
  pawnExists: function pawnExists(x, chr){ // Board
    LOG.getInto('Board#pawnExists');
    var ret = false;
    var p;
    for(var i = 1; i < 10; i++){
      p = this.getCell(x, i).piece;
      if (p && p.chr == chr){
        ret = true;
        break;
      }
    }
    LOG.debug('leaving with : ' + ret);
    LOG.goOut();
  },
	/**
	 * pieceExistsBetween(fromCell, toCell))
	 */
        // fromCell, toCellの間に駒が存在したらtrueを返す
  pieceExistsBetween: function pieceExistsBetween(fromCell, toCell){ // Board
    LOG.getInto('Board#pieceExistsBetween');
    var ret = false;
    var maxX = Math.max(fromCell.x, toCell.x);
    var maxY = Math.max(fromCell.y, toCell.y);
    var minX = Math.min(fromCell.x, toCell.x);
    var minY = Math.min(fromCell.y, toCell.y);
    LOG.debug('min: ' + minX + ', ' + minY + ',  max: ' + maxX + ', ' + maxY);
    // fromとtoが隣接している場合はfalseを返す
    if (maxX - minX < 2 && maxY - minY < 2){
      ret = false;
      LOG.debug('隣接: leaving with : ' + ret);
      LOG.goOut();
      return ret;
    }

    // fromとtoが同じ列のとき
    if (fromCell.x == toCell.x){
      if ((maxY - minY) > 1){
        for(var i = minY+1; i < maxY; i++){
          if (this.getCell(fromCell.x, i).piece){
            ret = true;
            break;
          }
        }
      } else {
        // fromとtoが隣接している場合はfalseを返す
        ret = false;
      }
      LOG.debug('同列:leaving with : ' + ret);
      LOG.goOut();
      return ret;
    }

    // fromとtoが同じ行のとき
    if (fromCell.y == toCell.y){
      if ((maxX - minX) > 1){
        for(var i = minX+1; i < maxX; i++){
          if (this.getCell(i, fromCell.y).piece){
            ret = true;
            break;
          }
        }
      } else {
        // fromとtoが隣接している場合はfalseを返す
        ret = false;
      }
      LOG.debug('同行:leaving with : ' + ret);
      LOG.goOut();
      return ret;
    }

    // fromとtoが45度斜めに位置しているとき
    if (Math.abs(fromCell.x - toCell.x) == Math.abs(fromCell.y - toCell.y)){
      if ((maxY - minY) > 1){
        if (((fromCell.x > toCell.x) && (fromCell.y > toCell.y)) ||
            ((fromCell.x < toCell.x) && (fromCell.y < toCell.y))){
          // fromとtoが右上がりに配置しているとき
          LOG.debug('右上がり:');
          for(var i = 1; i < maxY-minY; i++){
            if (this.getCell(minX+i, minY+i).piece){
              LOG.debug('i : ' + i);
              ret = true;
              break;
            }
          }
        } else {
          // fromとtoが右下がりに配置しているとき
          LOG.debug('右下がり: ');
          for(var i = 1; i < maxY-minY; i++){
            if (this.getCell(minX+i, maxY-i).piece){
              LOG.debug('i : ' + i);
              ret = true;
              break;
            }
          }
        }
      } else {
        // fromとtoが隣接している場合はfalseを返す
        ret = false;
      }
      LOG.debug('斜め:leaving with : ' + ret);
      LOG.goOut();
      return ret;
    }

    // 上のどの条件にも当てはまらない時はfalseを返す
    ret = false;
    LOG.debug('不適:leaving with : ' + ret);
    LOG.goOut();
    return ret;
  },
	/**
	 * idx2xy(idx)
	 */
	// boardを表す文字列の文字の位置を将棋盤の座標に変換する
        // 入力: stateの文字列のindex(0スタート）
	// 出力: 座標の配列[x,y]
  idx2xy: function idx2xy(idx) { // Board
    LOG.getInto('Board#idx2xy with : ' + idx, Log.DEBUG2);
    var h = this.game.height - 1;
    var ret = [Math.floor(idx/h) + 1.0, idx%h + 1.0]
    LOG.info('Board#idx2xy returning with : ' + ret.toString());
    LOG.goOut(Log.DEBUG2);
    return ret;
  },
	/**
	 * xy2idx(xy)
	 */
  xy2idx: function xy2idx(xy) {
    // 座標の配列[x,y]をstateの文字列のindex(0スタート）にして返す
    var h = this.game.height - 1;
    return (xy[0] - 1)*h + (xy[1]-1);
  },
	/**
	 * adjust()
	 */
  adjust: function adjust() { // Board
    if(!this.cells[1][1].elm) return;
    if(!this.game) return;
    LOG.getInto('Board#adjust');
    LOG.warn('top is ' + this.game.controller.top);  
    this.cells.flatten().invoke('getPosition');
    this.adjustBorder();
    LOG.goOut();
  },
	/**
	 * adjustBorder()
	 */
  adjustBorder: function adjustBorder() { // Board
    LOG.getInto('Board#adjustBoarder');
    if(!this.cells[1][1].elm) return;
    if(!this.game) return;
    if(this.game.controller.top === 0){
      for (var r = 1; r < this.game.height; r++) {
        this.cells[r][1].elm.addClassName('rightCell');
        this.cells[r][this.game.width - 1].elm.removeClassName('rightCell');
      }
      for (var c = 1; c < this.game.width; c++) {
        this.cells[1][c].elm.addClassName('topCell');
        this.cells[this.game.height - 1][c].elm.removeClassName('topCell');
      }
    } else {
      for (var r = 1; r < this.game.height; r++) {
        this.cells[r][this.game.width - 1].elm.addClassName('rightCell');
        this.cells[r][1].elm.removeClassName('rightCell');
      }
      for (var c = 1; c < this.game.width; c++) {
        this.cells[this.game.height - 1][c].elm.addClassName('topCell');
        this.cells[1][c].elm.removeClassName('topCell');
      }
    }
    LOG.goOut();
  },
	/**
	 * initialShow()
	 */
  initialShow: function initialShow() {  // Board
    LOG.getInto('Board#initialShow');
    this.cells.flatten().invoke('initialShow');
    this.adjustBorder();
    this.shown = true;
    LOG.goOut();
  },
	/**
	 * show()
	 */
  show: function show() {  // Board
    LOG.getInto('Board#show');
    this.cells.flatten().invoke('show');
    this.adjustBorder();
    this.shown = true;
    LOG.goOut();
  },
	/**
	 * getCell(x,y)
	 */
        // 座標を指定し、そのセルオブジェクトを返す
        // セルが存在しない座標を指定したらnullを返す
        // dummy cellは返さない。つまりx == 0 or y == 0ならnullを返す
  getCell: function getCell(x, y) { // Board
    if(x < 1 || y < 1) return null; 
    if(x >= this.game.width || y >= this.game.height) return null;
    if(!this.cells[y]){
      LOG.fatal('Board#getCell: cells[' + y + '] not exist');
      return null;
    }
    if(!this.cells[y][x]){
      LOG.fatal('Board#getCell: cells[' + y + '][' + x + '] not exist');
      return null;
    }
    return this.cells[y][x];
  },
	/**
	 * getCellByIdx(idx)
	 */
  getCellByIdx: function getCellByIdx(idx) {
    var xy = this.idx2xy(idx);
    return this.cells[xy[1]][xy[0]];
  },
	/**
	 * put(chr, idx)
	 */
  put: function put(chr, idx){ // Board
    LOG.getInto();
    LOG.debug('entered Board#put with chr: ' + chr + ', idx : ' + idx);
    var cell = this.getCellByIdx(idx);
    if(cell.piece){
      LOG.debug('Board#put: cell.piece existed : ' + cell.piece.toDebugString());
      if(cell.piece.chr == chr){
        // do nothing
      } else {
        cell.removeOwnPiece();
        var new_piece = create_piece(chr);
        cell.put(new_piece);
      }
    } else {
      LOG.debug('Board#put: cell.piece not existed , so initialize piece and put ');
      var new_piece = create_piece(chr);
      LOG.debug('Board#put: new_piece was created : ' + new_piece.toDebugString());
      LOG.debug('Board#put: putting new piece to : ' + cell.toDebugString());
      cell.put(new_piece);
    }
    LOG.debug('leaving Board#put',{'indent':-1});
    LOG.goOut();
  },
	/**
	 * deleteCellsPieceByIdx(idx)
	 */
  deleteCellsPieceByIdx: function deleteCellsPieceByIdx(idx){ // Board
    LOG.getInto('Board#deleteCellsPieceByIdx');
    LOG.debug('entered with idx : ' + idx, {'indent':1});
    var cell = this.getCellByIdx(idx);
    if(cell && cell.piece){
      cell.deleteOwnPiece();
    } else {
      // do nothing
    }
    LOG.debug('leaving Board#deleteCellsPieceByIdx', {'indent':-1});
    LOG.goOut();
  },
	/**
	 * removeCellsPieceByIdx(idx)
	 */
  removeCellsPieceByIdx: function removeCellsPieceByIdx(idx){ // Board
    LOG.debug('entered Board#remove with idx : ' + idx, {'indent':1});
    var cell = this.getCellByIdx(idx);
    if(cell && cell.piece){
      cell.removeOwnPiece();
    } else {
      // do nothing
    }
    LOG.debug('leaving Board#remove', {'indent':-1});
  },
  	/**
	 * replace(pair, idx)
	 */
  replace: function replace(pair, idx){ // Board
    // pair はpiece.chrを表す文字の組。
    // pair[0](新しい文字)がpair[1](古い文字)を置き換える。
    LOG.getInto();
    LOG.debug('entered Board#replace with pair: ' + pair.toString() + ', idx : ' + idx);
    var cell = this.getCellByIdx(idx);
    var new_piece = new Piece(pair[0]);
    if(cell.piece){
      cell.replaceOwnPieceWith(new_piece);
    } else {
      cell.put(new_piece);
    }
    LOG.debug('leaving Board#replace with : ' + new_piece.toDebugString() );
    LOG.goOut();
  },
  	/**
	 * replaceByRead(pair, idx)
	 */
  replaceByRead: function replaceByRead(pair, idx){ // Board
    // pair はpiece.chrを表す文字の組。
    // pair[0](新しい文字)がpair[1](古い文字)を置き換える。
    // stringFromStateを読んだときの処理に使う
    // 置き換えられる駒は消される
    // 置き換える駒は新しく生成される
    LOG.getInto('Board#replaceByRead');
    LOG.debug('entered with pair: ' + pair.toString() + ', idx : ' + idx);
    var cell = this.getCellByIdx(idx);
    var new_piece = new Piece(pair[0]);
    if(cell.piece) cell.deleteOwnPiece();
    cell.put(new_piece);
    LOG.debug('leaving Board#replaceByRead with : ' + new_piece.toDebugString() );
    LOG.goOut();
  },
	/**
	 * read(str)
	 */
	// 盤を表現する文字列を元に駒を盤上に置く
	// 現在の状態との差分を埋める
	// 入力：文字列 str 盤上のコマを１文字であらわした８１文字の文字列
	// 出力：なし
  read: function read(str){ // Board
    LOG.getInto('Board#read');
    LOG.debug('entered with : ' + str);
    var oldBoard = $A(this.toString());
    var newBoard = $A(str);
    LOG.debug('oldBoard : ' + this.toString());
    newBoard.zip(oldBoard).each(function(tuple, idx){
        if(tuple[0] != tuple[1]){
           if(tuple[1] == 'x') this.put(tuple[0], idx);
           else if(tuple[0] == 'x') this.deleteCellsPieceByIdx(idx);
           else this.replaceByRead(tuple, idx);
        }
      }.bind(this));
    LOG.goOut();
  },
	/**
	/**
	 * toString()
	 */
  toString: function toString(){ // Board
    LOG.getInto('Board#toString');
    LOG.debug('entered Board#toString',{'indent':3});
    // stateに載せる文字列を返す
    var ret = '';
    for (var c = 1; c < this.game.width; c++) {
      for (var r = 1; r < this.game.height; r++) {
        // LOG.debug('start check at r: ' + r + ', c : ' + c);
        if(this.cells && this.cells[r] && this.cells[r][c])
                ret += this.cells[r][c].say();
        else
          LOG.warn('no cell at r: ' + r + ', c : ' + c);
      }
    }
    LOG.warn('leaving Board#toString with : ' + ret, {'indent':-3});
    LOG.goOut();
    return ret;
  },
	/**
	 * toJSON()
	 */
  toJSON: function toJSON() {
    var ret = '[';
    for (var r = 0; r < this.game.height; r++) {
      ret += '[';
      for (var c = 0; c < this.game.width; c++) {
        ret += this.cells[r][c].toJSON();
        if (this.cells[r][c+1]) ret += ',';
      }
      ret += ']';
      if (this.cells[r+1]) ret += ',';
    }
    ret += ']';
    return ret;
  },
	/**
	 * reverse(top)
	 */
  reverse: function reverse(top) { // Board
    var game = this.game;
    LOG.getInto('Board#reverse');
    this.cells.flatten().each(function(c){
      this.LOG.warn('reverse called. cell is ' + c.toDebugString());
      if (c.piece) {
        this.LOG.warn('reverse class name called. piece is ' + c.piece.toDebugString());
        if (c.piece.isBlack()) {
          if (this.game.controller.top === 0){
            c.piece.elm.removeClassName('top');
            c.piece.elm.addClassName('bottom');
          } else {
            c.piece.elm.removeClassName('bottom');
            c.piece.elm.addClassName('top');
          }
        } else {
          if (this.game.controller.top === 0){
            c.piece.elm.removeClassName('bottom');
            c.piece.elm.addClassName('top');
          } else {
            c.piece.elm.removeClassName('top');
            c.piece.elm.addClassName('bottom');
          }
        }
        this.LOG.warn('reverse class name after process. ' + c.piece.toDebugString());
      }
    }.bind(this));
    LOG.goOut();
  },
	/**
	 * toDebugString()
	 */
  toDebugString: function toDebugString(){ // Board
    var ret = '';
    for (var r = 0; r < this.game.height; r++) {
      for (var c = 0; c < this.game.width; c++) {
        ret += ('rc:' + r.toString() + c.toString());
        if(this.cells[r][c].elm){
          ret += (',left:' + this.cells[r][c].elm.style.left);
          ret += (',top:' + this.cells[r][c].elm.style.top);
        }
        ret += '.';
      }
      ret += '<br>';
    }
    return ret;
  }
});

// Boardのbid, turn, board, black, whiteからなるデータのハッシュ
// Hashの子クラス
// key は、bid, turn, board, black, white
// その型は
//   this.bid   : 数値(Number)
//   this.turn  : Boolean
//   this.board : 文字列
//   this.black : 文字列
//   this.white : 文字列
var BoardData = Class.create(Hash, {

  initialize : function($super){ // BoardData
    LOG.getInto('BoardData#initialize');
    $super();
    LOG.goOut();
    return this;
  },
	/*
	 * toDelta()
	 */
	// 入力：なし。（自分自身が処理対象）
	// 出力：文字列 str 形式はカンマ区切り文字列
  toDelta : function toDelta(){ // BoardData
    LOG.getInto('BoardData#toDelta');
    var ret;
    ret =  this.bid;
    ret += ',' + (this.turn ? 't' : 'f');
    ret += ',' + this.board;
    ret += ',' + this.black;
    ret += ',' + this.white;
    LOG.goOut();
    return ret;
  },
	/*
	 * fromDelta()
	 */
	// BoardData#toDeltaの出力した文字列を自身に読み込む
	// 入力：文字列 str 形式はカンマ区切り文字列
	// 出力：BoardDataオブジェクト　つまり自分自身
  fromDelta : function fromDelta(str){ // BoardData
    LOG.getInto('BoardData#fromDelta');
    LOG.debug('argument str : ' + str);
    var ary = str.split(',');
    this.bid     = parseInt(ary[0]);
    this.turn    = (ary[1] == 't');
    this.board   = ary[2];
    this.black   = ary[3];
    this.white   = ary[4];
    LOG.debug('returning with : ' + this.toDelta());
    LOG.goOut();
    return this;
  },
	/*
	 * fromDB()
	 */
	// DBのresponseに含まれるオブジェクトを自身に読み込む
  fromDB : function fromDB(obj){ // BoardData
    this.bid     = (Object.isNumber(obj.bid) ?  obj.bid : parseInt(obj.bid));
    this.turn    = (obj.turn === true) ? true :
                   ((obj.turn === false) ? false : (obj.turn == 't'));
    this.board   = obj.board;
    this.black   = obj.black;
    this.white   = obj.white;
    return this;
  },
	/*
	 * toDebugString()
	 */
  toDebugString : function toDebugString(){ // BoardData
    LOG.getInto('BoardData#toDebugString');
    var ret;
    ret =  this.bid;
    ret += ',' + (this.turn ? 't' : 'f');
    ret += ',' + this.board;
    ret += ',' + this.black;
    ret += ',' + this.white;
    LOG.debug('returning : ' + ret);
    LOG.goOut();
    return ret;
  }
});

