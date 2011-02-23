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
    this.pieces   = $A([]);
    this.pockets  = $A([]);
    this.suffixes = $A([]);
    // this.updatePockets();
    this.createElm();
    LOG.goOut();
  },
	/**
	 * createElm()
	 */
  createElm: function createElm() {  // Stand
    LOG.getInto('Stand#createElm');
    var bs = window.gameController.options.boardSize;
      // define this own element
    this.elm = document.createElement('div');
    this.elm.id = this.id;
    this.elm.obj = this;
    this.elm.style.height = (this.game.height - 1)*bs + 'px';
    this.elm.style.width  = 1.5*bs + 'px';
    this.preparePockets();
    LOG.goOut();
  },
	/**
	 * preparePockets()
	 */
	// prepare pockets
  preparePockets: function preparePockets() {  // Stand
    var bs = window.gameController.options.boardSize;
    $R(0,7).each(function(i){
      this.pockets[i] =
        new Element('div',{ id:'pocket'+ i, className:'pocket' });
      this.suffixes[i] = 
        new Element('div',{ id:'suffix'+ i, className:'suffix' });
      this.pockets[i].appendChild(this.suffixes[i]);
    }.bind(this));
    this.pockets.each(function(p){ p.pieceCount = 0; });
    this.pockets[0].textContent = (this.id == 'black-stand' ? '▲' : '△');
    this.pockets[0].style.fontSize = bs + 'px';
    if(this.id == 'black-stand') {
      $R(0,7).each(function(i){
        this.suffixes[i].addClassName('bottom');
        this.elm.appendChild(this.pockets[i]);
      }.bind(this));
      this.pockets[0].addClassName('bottom');
    } else {
      $R(0,7).each(function(i){
        this.suffixes[i].addClassName('top');
        this.elm.appendChild(this.pockets[7-i]);
      }.bind(this));
      this.pockets[0].addClassName('top');
    }
  },
	/**
	 * isBottom()
	 */
  isBottom: function isBottom() {  // Stand
    return (this.id == 'black-stand') === (window.gameController.top == 0);
  },
	/**
	 * reverse()
	 */
  reverse: function reverse() {  // Stand
    LOG.getInto('Stand#reverse', Log.DEBUG2);
    var bs = window.gameController.options.boardSize;
    if (this.isBottom()) {
      for(var i = 0; i <= 7; i++){
        this.elm.removeChild(this.pockets[i]);
      }
      for(var i = 0; i <= 7; i++){
        this.elm.appendChild(this.pockets[i]);
        this.suffixes[i].style.marginLeft = bs + 'px';
        this.suffixes[i].style.marginTop  = bs*0.5 + 'px';
      }
      this.pieces.each(function(p){
        p.elm.style.marginLeft = '0px';
      });
    } else {
      for(var i = 0; i <= 7; i++){
        this.elm.removeChild(this.pockets[i]);
      }
      for(var i = 7; i >= 0; i--){
        this.elm.appendChild(this.pockets[i]);
        this.suffixes[i].style.marginLeft = '0px';
        this.suffixes[i].style.marginTop  = '0px';
      }
      this.pieces.each(function(p){
        p.elm.style.marginLeft = 0.5*bs + 'px';
      });
    }
    LOG.goOut(Log.DEBUG2);
  },
	/**
	 * updatePockets()
	 */
  updatePockets: function updatePockets() {  // Stand
    LOG.getInto('Stand#updatePockets');
    var bs = window.gameController.options.boardSize;
    this.pockets[0] = { pieceCount: 1, piece: this.id,
                        top: 0, left: 0,
                        suffix: { top: '0px', left: bs + 'px' } };
    $R(1,8).each(function(i){
      this.pockets[i] = { pieceCount: 0, piece: null,
                          top: i * bs + 'px', left: '0px',
                          suffix: { top: i * bs + 'px', left: bs + 'px' } };
    }.bind(this));
    LOG.goOut();
  },
	/**
	 * removeByObj(piece)
	 */
  removeByObj: function removeByObj(piece){  // Stand
    // 指定された駒のオブジェクトを駒台から取り除く
    LOG.getInto('Stand#removeByObj');
    this.pockets[Chr2Ord[piece.chr]].removeChild(piece.elm);
    this.removeFromPockets(piece);
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
    this.pockets[Chr2Ord[chr]].removeChild(target.elm);
    this.removeFromPockets(target);
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
      this._put(new Piece(c));
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
	// 駒台に持ち駒を載せる
  put: function put(piece){ // Stand
    LOG.getInto('Stand#put', Log.DEBUG2);
    LOG.debug2('this is : ' + this.id + ', piece : ' + piece.toDebugString());
    piece.toggleBW();
    this._put(piece);
    LOG.goOut(Log.DEBUG2);
  },
	/**
	 * _put(piece)
	 */
	// 駒台に持ち駒を載せる
	// readからの場合、chrはそのまま。toggleはしない
  _put: function _put(piece){ // Stand
    LOG.getInto('Stand#_put', Log.DEBUG2);
    LOG.debug2('entered ' + this.id + ' Stand#_put with : ' + piece.toDebugString());
    piece.cell = null;
    this.pieces.push(piece);
//    this.pieces.sort(function(a,b){ return Chr2Ord[b.chr] - Chr2Ord[a.chr] });
//    this.addToPockets(piece);
    this.pockets[Chr2Ord[piece.chr]].appendChild(piece.elm);
    this.recalcPockets(piece);
    LOG.debug2('leaving ' + this.id + ' Stand#_put : ' + piece.toDebugString());
    LOG.goOut(Log.DEBUG2);
  },
	/**
	 * recalcPockets(piece)
	 */
	// pocketsの各値を更新する
	// 
  recalcPockets: function recalcPockets(piece){ // Stand
    LOG.getInto('Stand#recalcPockets', Log.DEBUG2);
    LOG.debug2('entered ' + this.id + ' Stand#recalcPockets with : ' + piece.toDebugString());
    var bs = window.gameController.options.boardSize; 
    var idx = Chr2Ord[piece.chr];
    var pieceCount = $$('#' + this.id + ' #pocket'+idx+' div.piece').length;
    if (pieceCount > 1) this.suffixes[idx].textContent = pieceCount;
    else                this.suffixes[idx].textContent = null;
	// pocketに複数の駒を置くときは同じ位置に重なるようにstyleを調整する
    if (pieceCount > 1){
      $$('#' + this.id + ' #pocket'+idx+' div.piece').each(
        function(e){
          e.style.position = 'absolute';
          if (this.isBottom()) {
            e.style.marginLeft = '0px';
          } else {
            e.style.marginLeft = 0.5*bs + 'px';
          }
        }.bind(this));
      $$('#' + this.id + ' #pocket'+idx)[0].style.height = bs;
      if (this.isBottom()) {
        this.suffixes[idx].style.marginLeft = bs + 'px';
        this.suffixes[idx].style.marginTop  = bs*0.5 + 'px';
      } else {
        this.suffixes[idx].style.marginLeft = '0px';
        this.suffixes[idx].style.marginTop  = '0px';
      }
    }
    this.pockets[idx].pieceCount = pieceCount;
    LOG.goOut(Log.DEBUG2);
  },
	/**
	 * addToPockets(piece)
	 */
	// pocketsの各値を更新する
	// 
/*
  addToPockets: function addToPockets(piece){ // Stand
    LOG.getInto('Stand#addToPockets', Log.DEBUG2);
    LOG.debug2('entered ' + this.id + ' Stand#addToPockets with : ' + piece.toDebugString());
    var idx = $R(1,8).find(function(e){
      return this.pockets[e].piece == piece.chr;
    }.bind(this));
    if (!idx) {
      this.pockets.max++;
      idx = this.pockets.max;
    }
    this.pockets[idx].piece = piece.chr;
    this.pockets[idx].pieceCount   += 1;
    if (this.pockets[idx].pieceCount > 1) {
      this.suffixes[idx].textContent = this.pockets[idx].pieceCount;
      this.suffixes[idx].style.top  = this.pockets[idx].suffix.top;
      this.suffixes[idx].style.left = this.pockets[idx].suffix.left;
    }
    piece.elm.style.top  = this.pockets[idx].top;
    piece.elm.style.left = this.pockets[idx].left;
    LOG.goOut(Log.DEBUG2);
  },
*/
	/**
	 * removeFromPockets(piece)
	 */
	// pocketsの各値を更新する
	// 
  removeFromPockets: function removeFromPockets(piece){ // Stand
    LOG.getInto('Stand#removeFromPockets', Log.DEBUG2);
    var idx = Chr2Ord[piece.chr];
    this.pockets[idx].pieceCount -= 1;
    if(this.pockets[idx].pieceCount > 1)
      this.suffixes[idx].textContent = this.pockets[idx].pieceCount;
    else
      this.suffixes[idx].textContent = null;
    LOG.goOut(Log.DEBUG2);
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
