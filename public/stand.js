/**
 * Stand
 */
Stand = Class.create({
	/**
	 * initialize(id, game)
	 */
  initialize: function initialize(id, game) {
    LOG.getInto('Stand#initialize');
    this.game = game;
    this.top = game.controller.top;
    this.width = 1; 
    this.height = game.height - 1;
    this.id = id;
    this.type = 'stand';
    this.initialString = '';
    this.pieces = $A([]);
    this.createElm();
    LOG.goOut();
  },
	/**
	 * createElm()
	 */
  createElm: function createElm() {  // Stand
    LOG.getInto('Stand#createElm');
    this.elm = document.createElement('div');
    this.elm.id = this.id;
    this.elm.obj = this;
    this.elm.style.height = (this.game.height - 1)*30 + 'px';
    LOG.goOut();
  },
	/**
	 * removeByObj(piece)
	 */
  removeByObj: function removeByObj(piece){  // Stand
    // 指定された駒のオブジェクトを駒台から取り除く
    LOG.getInto('Stand#removeByObj');
    this.elm.removeChild(piece.elm);
    this.pieces = this.pieces.reject(function(p){ return p==piece; });
    LOG.goOut();
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
	// stateから読んだ文字列を元に駒を駒台に置く
	// 入力 : str 文字列 駒のchrを並べたもの
	// 出力 : なし
  read: function read(strFromState){ // Stand
    LOG.getInto('Stand#read');
    LOG.debug('entered Stand#read with : ' + strFromState );
    // 現在のstandの状態との差分を埋める
    var str_now = this.toString();
    LOG.debug('Stand#read str_now : ' + str_now, {'indent':1} );
    // 現在にあり、strFromStateにないものは現在から消す
    var deleteCandidate = str_now.subtract(strFromState);
    LOG.debug('Stand#read deleteCandidate : ' + deleteCandidate );
    $A(deleteCandidate).each(function(c){
      this.removeStandsPieceByChr(c);
    }.bind(this));  
    // 現在になく、strにあるものは現在へ足す
    var addCandidate = strFromState.subtract(str_now);
    LOG.debug('Stand#read addCandidate : ' + addCandidate, {'indent':-1} );
    $A(addCandidate).each(function(c){
      this.put_from_read(new Piece(c));
    }.bind(this));
    LOG.debug('leaving  Stand#read' );
LOG.goOut();
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
    LOG.getInto('Stand#put');
    LOG.debug('this is : ' + this.id + ', piece : ' + piece.toDebugString());
    piece.toggleBW();
    piece.cell = null;
    this.pieces.push(piece);
    this.elm.appendChild(piece.elm);
    LOG.debug('leaving ' + this.id + ', Stand#put : ' + piece.toDebugString());
    LOG.debug(this.id + ' : ' + this.toString());
    LOG.goOut();
  },
	/**
	 * put_from_read(piece)
	 */
  put_from_read: function put_from_read(piece){ // Stand
    // 駒台に持ち駒を載せるが、readからの場合、chrはそのまま。toggleはしない
LOG.getInto();
    LOG.debug('entered ' + this.id + ' Stand#put_from_read with : ' + piece.toDebugString());
    piece.cell = null;
    this.pieces.push(piece);
    this.elm.appendChild(piece.elm);
    LOG.debug('leaving ' + this.id + ' Stand#put : ' + piece.toDebugString());
LOG.goOut();
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
LOG.getInto('Stand#toString');
    LOG.debug('entered Stand#toString : id : ' + this.id + ', size : ' + this.pieces.length);
    // stateに載せる文字列を返す
    var ret = '';
    if(this.pieces.length > 0)
      ret += this.pieces.pluck('chr').join('');
    LOG.debug('leaving Stand#toString with : ' + ret);
LOG.goOut();
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
