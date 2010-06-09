/**
 * Stand
 */
Stand = Class.create({
	/**
	 * initialize(id, game)
	 */
  initialize: function initialize(id, game) {
    game.log.getInto('Stand#initialize');
    this.game = game;
    this.top = game.controller.top;
    this.width = 1; 
    this.height = game.height - 1;
    this.id = id;
    this.type = 'stand';
    this.initialString = '';
    this.pieces = $A([]);
    this.createElm();
    game.log.goOut();
  },
	/**
	 * createElm()
	 */
  createElm: function createElm() {  // Stand
    this.game.log.getInto('Stand#createElm');
    this.elm = document.createElement('div');
    this.elm.id = this.id;
    this.elm.obj = this;
    this.elm.style.height = (this.game.height - 1)*30 + 'px';
    this.game.log.goOut();
  },
	/**
	 * removeByObj(piece)
	 */
  removeByObj: function removeByObj(piece){  // Stand
    // 指定された駒のオブジェクトを駒台から取り除く
    this.game.log.getInto('Stand#removeByObj');
    this.elm.removeChild(piece.elm);
    this.pieces = this.pieces.reject(function(p){ return p==piece; });
    this.game.log.goOut();
  },
	/**
	 * removeStandsPieceByChr(chr)
	 */
  removeStandsPieceByChr: function removeStandsPieceByChr(chr){  // Stand
    // chrで指定された駒を駒台から取り除く
    // 取り除いたpieceを返す
    var target = this.pieces.find(function(p){ return p.chr == chr; });
    this.elm.removeChild(target.elm);
    //this.pieces.subtract([target]);
    this.pieces = this.pieces.reject(function(p){ return p==target; });
    return target;
  },
	/**
	 * read(str)
	 */
  read: function read(strFromState){ // Stand
    this.game.log.getInto('Stand#read');
    this.game.log.debug('entered Stand#read with : ' + strFromState );
    // stateから読んだ文字列を元に駒を駒台に置く
    // strFromStateが空文字列ならclearして終わり
/*
    if (strFromState.length == 0){
      this.pieces.clear();
      this.game.log.debug('leaving  Stand#read because nothing to do.' );
      this.game.log.goOut();
      return;
    }
*/
    // 現在のstandの状態との差分を埋める
    var str_now = this.toString();
    this.game.log.debug('Stand#read str_now : ' + str_now, {'indent':1} );
    // 現在にあり、strFromStateにないものは現在から消す
    var deleteCandidate = str_now.subtract(strFromState);
    this.game.log.debug('Stand#read deleteCandidate : ' + deleteCandidate );
    $A(deleteCandidate).each(function(c){
      this.removeStandsPieceByChr(c);
    }.bind(this));  
    // 現在になく、strにあるものは現在へ足す
    var addCandidate = strFromState.subtract(str_now);
    this.game.log.debug('Stand#read addCandidate : ' + addCandidate, {'indent':-1} );
    $A(addCandidate).each(function(c){
      this.put_from_read(new Piece(c));
    }.bind(this));
    this.game.log.debug('leaving  Stand#read' );
this.game.log.goOut();
  },
	/**
	 * clear()
	 */
  clear: function clear(){ // Stand
    // Standの内容はboardReadFromStateにより毎回更新されるので、その都度クリアする
    // この処理は本来いらないことであるべきでは？
    this.pieces.clear();
  },
	/**
	 * put(piece)
	 */
  put: function put(piece){ // Stand
    // 駒台に持ち駒を載せる
    this.game.log.getInto('Stand#put');
    this.game.log.debug('this is : ' + this.id + ', piece : ' + piece.toDebugString());
    piece.toggleBW();
    piece.cell = null;
    this.pieces.push(piece);
    this.elm.appendChild(piece.elm);
    this.game.log.debug('leaving ' + this.id + ', Stand#put : ' + piece.toDebugString());
    this.game.log.debug(this.id + ' : ' + this.toString());
    this.game.log.goOut();
  },
	/**
	 * put_from_read(piece)
	 */
  put_from_read: function put_from_read(piece){ // Stand
    // 駒台に持ち駒を載せるが、readからの場合、chrはそのまま。toggleはしない
this.game.log.getInto();
    this.game.log.debug('entered ' + this.id + ' Stand#put_from_read with : ' + piece.toDebugString());
    piece.cell = null;
    this.pieces.push(piece);
    this.elm.appendChild(piece.elm);
    this.game.log.debug('leaving ' + this.id + ' Stand#put : ' + piece.toDebugString());
this.game.log.goOut();
  },
	/**
	 * pull(piece)
	 */
  pull: function pull(piece){ // Stand
    // 駒台から持ち駒を離す
    this.pieces.pop(piece);
  },
	/**
	 * show()
	 */
  show: function show(){ // Stand
  },
	/**
	 * toString()
	 */
  toString: function toString(){ // Stand
this.game.log.getInto('Stand#toString');
    this.game.log.debug('entered Stand#toString : id : ' + this.id + ', size : ' + this.pieces.length);
    // stateに載せる文字列を返す
    var ret = '';
    if(this.pieces.length > 0)
      ret += this.pieces.pluck('chr').join('');
    this.game.log.debug('leaving Stand#toString with : ' + ret);
this.game.log.goOut();
    return ret;
  },
	/**
	 * toDebugString()
	 */
  toDebugString: function toDebugString(){ // Stand
    var ret = '';
    ret += 'id: ' + this.id;
    ret += ', type: ' + this.type;
    ret += ', pieces.size: ' + this.pieces.size();
    return ret;
  }
});
