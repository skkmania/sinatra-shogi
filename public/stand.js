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
    this.id = id;	// 'black-stand', 'white-stand'のいずれか
    this.type = 'stand';
    this.initialString = '';
    this.pieces   = $A([]);
    this.pockets  = $A([]);
	// Standを駒の種類ごとの小部屋に分割して使うというイメージ
	// Piece.elmをappendChildまたはremoveChildするのはこの要素である
    this.suffixes = $A([]);
	// pocketにある駒の個数を表現するためのスペースを用意する
	// pockets, suffixesの添字はPieceのChr2Ordで定義され
	// 駒の種類と対応している
    this.createElm();
    LOG.goOut();
  },
	/**
	 * createElm()
	 */
	// define this own element
  createElm: function createElm() {  // Stand
    LOG.getInto('Stand#createElm');
    var bs = globalOptions.boardSize;
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
    var bs = globalOptions.boardSize;
    $R(0,7).each(function(i){
      this.pockets[i] =
        new Element('div',{ id:'pocket'+ i, className:'pocket' });
      this.suffixes[i] = 
        new Element('div',{ id:'suffix'+ i, className:'suffix' });
      this.pockets[i].appendChild(this.suffixes[i]);
    }.bind(this));
     // pocketsの各要素はその駒の個数を意味するpieceCountプロパティを持つ
     // 初期化なので全て0にする
    this.pockets.each(function(p){ p.pieceCount = 0; });
	// pockets[0]は先後を表すサインである
    this.pockets[0].textContent = (this.id == 'black-stand' ? '▲' : '△');
    this.pockets[0].style.fontSize = bs + 'px';
	// pocketsをstandのelmに並べる順序はtop, bottomにより逆になる
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
	// topにあるときとbottomにあるときでは並べかたが大きく変わる
	// それを全て丁寧にここで面倒をみている
  reverse: function reverse() {  // Stand
    LOG.getInto('Stand#reverse', Log.DEBUG2);
    var bs = globalOptions.boardSize;
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
	 * removeByObj(piece)
	 */
	// 指定された駒のオブジェクトを駒台から取り除く
	// 対象がStand.elmではなく、pocketsであることに注意
	// 入力 : pieceオブジェクト
	// 出力 : なし
	// 副作用：piecesから要素がひとつ取り除かれる
  removeByObj: function removeByObj(piece){  // Stand
    LOG.getInto('Stand#removeByObj');
    this.pockets[Chr2Ord[piece.chr]].removeChild(piece.elm);
    this.removeFromPockets(piece);
    this.pieces = this.pieces.reject(function(p){ return p==piece; });
    LOG.goOut();
  },
	/**
	 * removeStandsPieceByChr(chr)
	 */
	// chrで指定された駒を駒台から取り除く
	// 取り除いたpieceを返す
	// 対象がStand.elmではなく、pocketsであることに注意
	// 入力 : chr 文字 駒のchr
	// 出力 : Pieceオブジェクト 取り除いたpiece
	// 副作用：piecesから要素がひとつ取り除かれる
  removeStandsPieceByChr: function removeStandsPieceByChr(chr){  // Stand
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
    var bs = globalOptions.boardSize; 
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
		// topの場合はsuffixのぶんをずらす
            e.style.marginLeft = 0.5*bs + 'px';
          }
        }.bind(this));
	// pocketの内部要素をすべてフロートにしてしまったので
	// pocketの高さがなくなってしまう。そこで手動で設定する
      this.pockets[idx].style.height = bs + 'px';
	// suffixの位置もtopとbottomで異るので設定
      if (this.isBottom()) {
        this.suffixes[idx].style.marginLeft = bs + 'px';
        this.suffixes[idx].style.marginTop  = bs*0.5 + 'px';
      } else {
        this.suffixes[idx].style.marginLeft = '0px';
        this.suffixes[idx].style.marginTop  = '0px';
      }
    }
	// 上記のように複数駒のとき設定したheightは、駒が0になったとき
	// には逆に邪魔になるので0としておく。
	// こうしないと、standに空白が生じてしまう。
    if (pieceCount == 0){
      this.pockets[idx].style.height = '0px';
    }
	// pieceCountをpocketに保持させておく。suffixの値とするため。
    this.pockets[idx].pieceCount = pieceCount;
    LOG.goOut(Log.DEBUG2);
  },
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
