/**
 * Board
 */
Board = Class.create({
	/**
	 * initialize(elm, game)
	 */
  initialize: function initialize(elm, game) {
    game.log.getInto('Board#initialize');
    this.bid = 1;
    this.game = game;
    //this.top = game.controller.top;
    this.elm = elm || document.body;
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
    game.log.warn('Board#initialize going to process initialString.');
    $A(this.initialString).each(function(chr, idx){
      game.log.getInto('reading initialString');
      game.log.warn('idx: ' + idx);
      if(chr == 'x'){ game.log.goOut(); return; }
      var xy = this.idx2xy(idx);
      var x = xy[0];
      var y = xy[1];
      game.log.warn('chr: ' + chr + ', x : ' + x +', y : ' + y);
      if(this.cells[y] && this.cells[y][x])
        game.log.warn('cell: ' + this.cells[y][x].toDebugString());
      else{
        game.log.warn('Board#initialize,  there is no cell at x: ' + x + ', y: ' + y +'.');
        return;
      }
      var p = new Piece(chr, game);
      game.log.debug('piece: initialized in Board#initialize : ' + p.toDebugString());
      this.cells[y][x].put(p);
      game.log.goOut();
    }.bind(this));
    game.log.debug('leaving Board#initialize');
    game.log.goOut();
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
    this.game.log.getInto('Board#toDelta');
    var ret = [this.bid, (this.turn?'t':'f'),this.toString(),
               this.game.blackStand.toString(), this.game.whiteStand.toString()].join(',');
    this.game.log.debug('returning : ' + ret);
    this.game.log.goOut();
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
    this.game.log.getInto('Board#fromDelta');
    var ary = str.split(',');
    if(ary.length != 5) this.game.log.fatal('Board#fromDelta:read error');
    this.bid = parseInt(ary[0]);
    this.turn = (ary[1] == 't');
    this.read(ary[2]);
    this.game.blackStand.read(ary[3]);
    this.game.whiteStand.read(ary[4]);
    this.game.log.goOut();
    return;
  },
	/**
	 * pawnExists(x, chr)
	 */
        // 列xにchrを持つ駒が存在したらtrueを返す
  pawnExists: function pawnExists(x, chr){ // Board
    this.game.log.getInto('Board#pawnExists');
    var ret = false;
    var p;
    for(var i = 1; i < 10; i++){
      p = this.getCell(x, i).piece;
      if (p && p.chr == chr){
        ret = true;
        break;
      }
    }
    this.game.log.debug('leaving with : ' + ret);
    this.game.log.goOut();
  },
	/**
	 * pieceExistsBetween(fromCell, toCell))
	 */
        // fromCell, toCellの間に駒が存在したらtrueを返す
  pieceExistsBetween: function pieceExistsBetween(fromCell, toCell){ // Board
    this.game.log.getInto('Board#pieceExistsBetween');
    var ret = false;
    var maxX = Math.max(fromCell.x, toCell.x);
    var maxY = Math.max(fromCell.y, toCell.y);
    var minX = Math.min(fromCell.x, toCell.x);
    var minY = Math.min(fromCell.y, toCell.y);
    this.game.log.debug('min: ' + minX + ', ' + minY + ',  max: ' + maxX + ', ' + maxY);
    // fromとtoが隣接している場合はfalseを返す
    if (maxX - minX < 2 && maxY - minY < 2){
      ret = false;
      this.game.log.debug('隣接: leaving with : ' + ret);
      this.game.log.goOut();
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
      this.game.log.debug('同列:leaving with : ' + ret);
      this.game.log.goOut();
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
      this.game.log.debug('同行:leaving with : ' + ret);
      this.game.log.goOut();
      return ret;
    }

    // fromとtoが45度斜めに位置しているとき
    if (Math.abs(fromCell.x - toCell.x) == Math.abs(fromCell.y - toCell.y)){
      if ((maxY - minY) > 1){
        if (((fromCell.x > toCell.x) && (fromCell.y > toCell.y)) ||
            ((fromCell.x < toCell.x) && (fromCell.y < toCell.y))){
          // fromとtoが右上がりに配置しているとき
          this.game.log.debug('右上がり:');
          for(var i = 1; i < maxY-minY; i++){
            if (this.getCell(minX+i, minY+i).piece){
              this.game.log.debug('i : ' + i);
              ret = true;
              break;
            }
          }
        } else {
          // fromとtoが右下がりに配置しているとき
          this.game.log.debug('右下がり: ');
          for(var i = 1; i < maxY-minY; i++){
            if (this.getCell(minX+i, maxY-i).piece){
              this.game.log.debug('i : ' + i);
              ret = true;
              break;
            }
          }
        }
      } else {
        // fromとtoが隣接している場合はfalseを返す
        ret = false;
      }
      this.game.log.debug('斜め:leaving with : ' + ret);
      this.game.log.goOut();
      return ret;
    }

    // 上のどの条件にも当てはまらない時はfalseを返す
    ret = false;
    this.game.log.debug('不適:leaving with : ' + ret);
    this.game.log.goOut();
    return ret;
  },
	/**
	 * idx2xy(idx)
	 */
  idx2xy: function idx2xy(idx) { // Board
    this.game.log.getInto('Board#idx2xy with : ' + idx);
    // stateの文字列のindex(0スタート）を座標の配列[x,y]にして返す
    var h = this.game.height - 1;
    var ret = [Math.floor(idx/h) + 1.0, idx%h + 1.0]
    this.game.log.info('Board#idx2xy returning with : ' + ret.toString());
    this.game.log.goOut();
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
    this.game.log.getInto('Board#adjust');
    this.game.log.warn('top is ' + this.game.controller.top);  
    this.cells.flatten().invoke('getPosition');
    this.adjustBorder();
    this.game.log.goOut();
  },
	/**
	 * adjustBorder()
	 */
  adjustBorder: function adjustBorder() { // Board
    this.game.log.getInto('Board#adjustBoarder');
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
    this.game.log.goOut();
  },
	/**
	 * show()
	 */
  show: function show() {  // Board
    this.game.log.getInto('Board#show');
    this.cells.flatten().invoke('show');
    this.adjustBorder();
    this.shown = true;
    this.game.log.goOut();
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
      this.game.log.fatal('Board#getCell: cells[' + y + '] not exist');
      return null;
    }
    if(!this.cells[y][x]){
      this.game.log.fatal('Board#getCell: cells[' + y + '][' + x + '] not exist');
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
    this.game.log.getInto();
    this.game.log.debug('entered Board#put with chr: ' + chr + ', idx : ' + idx);
    var cell = this.getCellByIdx(idx);
    if(cell.piece){
      this.game.log.debug('Board#put: cell.piece existed : ' + cell.piece.toDebugString());
      if(cell.piece.chr == chr){
        // do nothing
      } else {
        cell.removeOwnPiece();
        var new_piece = create_piece(chr);
        cell.put(new_piece);
      }
    } else {
      this.game.log.debug('Board#put: cell.piece not existed , so initialize piece and put ');
      var new_piece = create_piece(chr);
      this.game.log.debug('Board#put: new_piece was created : ' + new_piece.toDebugString());
      this.game.log.debug('Board#put: putting new piece to : ' + cell.toDebugString());
      cell.put(new_piece);
    }
    this.game.log.debug('leaving Board#put',{'indent':-1});
    this.game.log.goOut();
  },
	/**
	 * deleteCellsPieceByIdx(idx)
	 */
  deleteCellsPieceByIdx: function deleteCellsPieceByIdx(idx){ // Board
    this.game.log.getInto();
    this.game.log.debug('entered Board#deleteCellsPieceByIdx with idx : ' + idx, {'indent':1});
    var cell = this.getCellByIdx(idx);
    if(cell.piece){
      cell.deleteOwnPiece();
    } else {
      // do nothing
    }
    this.game.log.debug('leaving Board#deleteCellsPieceByIdx', {'indent':-1});
    this.game.log.goOut();
  },
	/**
	 * removeCellsPieceByIdx(idx)
	 */
  removeCellsPieceByIdx: function removeCellsPieceByIdx(idx){ // Board
    this.game.log.debug('entered Board#remove with idx : ' + idx, {'indent':1});
    var cell = this.getCellByIdx(idx);
    if(cell.piece){
      cell.removeOwnPiece();
    } else {
      // do nothing
    }
    this.game.log.debug('leaving Board#remove', {'indent':-1});
  },
  	/**
	 * replace(pair, idx)
	 */
  replace: function replace(pair, idx){ // Board
    // pair はpiece.chrを表す文字の組。
    // pair[0](新しい文字)がpair[1](古い文字)を置き換える。
    this.game.log.getInto();
    this.game.log.debug('entered Board#replace with pair: ' + pair.toString() + ', idx : ' + idx);
    var cell = this.getCellByIdx(idx);
    var new_piece = new Piece(pair[0]);
    if(cell.piece){
      cell.replaceOwnPieceWith(new_piece);
    } else {
      cell.put(new_piece);
    }
    this.game.log.debug('leaving Board#replace with : ' + new_piece.toDebugString() );
    this.game.log.goOut();
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
    this.game.log.getInto();
    this.game.log.debug('entered Board#replaceByRead with pair: ' + pair.toString() + ', idx : ' + idx);
    var cell = this.getCellByIdx(idx);
    var new_piece = new Piece(pair[0]);
    if(cell.piece) cell.deleteOwnPiece();
    cell.put(new_piece);
    this.game.log.debug('leaving Board#replaceByRead with : ' + new_piece.toDebugString() );
    this.game.log.goOut();
  },
	/**
	 * read(strFromState)
	 */
  read: function read(strFromState){ // Board
    this.game.log.getInto('Board#read');
    this.game.log.debug('entered with : ' + strFromState);
    // stateから読んだ文字列を元に駒を盤上に置く
    // 現在の状態との差分を埋める
    var oldBoard = $A(this.toString());
    var newBoard = $A(strFromState);
    newBoard.zip(oldBoard).each(function(tuple, idx){
        if(tuple[0] != tuple[1]){
           if(tuple[1] == 'x') this.put(tuple[0], idx);
           else if(tuple[0] == 'x') this.deleteCellsPieceByIdx(idx);
           else this.replaceByRead(tuple, idx);
        }
      }.bind(this));
    this.game.log.goOut();
  },
	/**
	/**
	 * toString()
	 */
  toString: function toString(){ // Board
    this.game.log.getInto('Board#toString');
    this.game.log.debug('entered Board#toString',{'indent':3});
    // stateに載せる文字列を返す
    var ret = '';
    for (var c = 1; c < this.game.width; c++) {
      for (var r = 1; r < this.game.height; r++) {
        // this.game.log.debug('start check at r: ' + r + ', c : ' + c);
        if(this.cells && this.cells[r] && this.cells[r][c])
                ret += this.cells[r][c].say();
        else
          game.log.warn('no cell at r: ' + r + ', c : ' + c);
      }
    }
    this.game.log.warn('leaving Board#toString with : ' + ret, {'indent':-3});
    this.game.log.goOut();
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
    var log = this.game.log;
    var game = this.game;
    log.getInto('Board#reverse');
    this.cells.flatten().each(function(c){
      log.warn('reverse called. cell is ' + c.toDebugString());
      if (c.piece) {
        log.warn('reverse class name called. piece is ' + c.piece.toDebugString());
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
        log.warn('reverse class name after process. ' + c.piece.toDebugString());
      }
    }.bind(this));
    log.goOut();
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
var BoardData = Class.create(Hash, {

  initialize : function($super, log){ // BoardData
    this.log = log;
    this.log.getInto('BoardData#initialize');
    $super();
    this.log.goOut();
    return this;
  },
	/*
	 * toDelta()
	 */
  toDelta : function toDelta(){ // BoardData
    this.log.getInto('BoardData#toDelta');
    var ret;
    ret =  this.bid;
    ret += ',' + (this.turn ? 't' : 'f');
    ret += ',' + this.board;
    ret += ',' + this.black;
    ret += ',' + this.white;
    this.log.goOut();
    return ret;
  },
	/*
	 * fromDelta()
	 */
	// BoardData#toDeltaの出力した文字列を自身に読み込む
  fromDelta : function fromDelta(str){ // Move
    var ary = str.split(',');
    this.bid     = parseInt(ary[0]);
    this.turn    = (ary[1] == 't');
    this.board   = ary[2];
    this.black   = ary[3];
    this.white   = ary[4];
    return this;
  },
	/*
	 * fromDB()
	 */
	// DBのresponseに含まれるオブジェクトを自身に読み込む
  fromDB : function fromDB(obj){ // Move
    this.bid     = obj.bid;
    this.turn    = obj.turn;
    this.board   = obj.board;
    this.black   = obj.black;
    this.white   = obj.white;
    return this;
  },
      
});

