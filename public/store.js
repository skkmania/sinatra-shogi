//  store.js
//   2010/11/10
//  dataをやりとり、操作するクラス Storeをつくる

/**
 * Slice Class
 */
//  1画面ぶんのデータの集まりを保持するクラス
//  画面を遷移するごとにStoreからsliceを切り出すのは計算量の面で損だとの考えからつくってみた
//  keyとして board nextMoves prevMoves movePointsByUser movePointsAverage moveComments boardPointByUser boardPointAverage boardComments
var Slice = Class.create(Hash, {
	/**
	 * initialize()
	 */
  initialize : function initialize($super){
    LOG.getInto('Slice#initialize');
    $super();
    this.names = $w('board nextMoves prevMoves movePointsByUser movePointsAverage moveComments boardPointByUser boardPointAverage boardComments');
    this.LOG = LOG;
    LOG.goOut();
    return this;
  },
	/**
	 * fromState()
	 */
  fromState : function fromState(state){ // Slice
    LOG.getInto('Slice#fromState');
    this.set('board',     (new BoardData()).fromDelta(state.get('board',window.gameController.game.board.initialString)));
    this.set('nextMoves', (new Moves('nextMoves')).fromDelta(state.get('next', '')));
    this.set('prevMoves', (new Moves('prevMoves')).fromDelta(state.get('prev', '')));
    LOG.goOut();
    return this;
  },
	/**
	 * toDebugHtml()
	 */
  toDebugHtml : function toDebugHtml(){ // Slice
    LOG.getInto('Slice#toDebugHtml',Log.DEBUG2);
    var ret = '<table class="slice">';
    LOG.debug('keys : ' + Object.toJSON(this.keys()));
    LOG.debug('values : ' + this.values().invoke('toDebugString').join('::'));
    this.keys().each(function(key){
      this.LOG.debug('pair.key: ' + Object.toJSON(key));
      this.LOG.debug('pair.value: ' + this.get(key).toDebugString());
      ret += '<tr>';
      ret += '<td>' + key + '</td>';
      if (!this.get(key)){
         ret += '[]';
      } else {
         ret += ('<td>' + this.get(key).toDelta() + '</td>');
      }
      ret += '</tr>';
    }.bind(this));
    LOG.goOut(Log.DEBUG2);
    return ret + '</table>';
  },
	/**
	 * toDebugString()
	 */
  toDebugString : function toDebugString(){ // Slice
    LOG.getInto('Slice#toDebugString',Log.DEBUG2);
    var ret = '';
    LOG.debug2('keys : ' + JSON.stringify(this.keys()));
    //LOG.debug('keys : ' + Object.toJSON(this.keys()));
    // LOG.debug('values : ' + Object.toJSON(this.values()));
    this.keys().each(function(key){
      var obj = this.get(key);
      this.LOG.getInto('key : ' + key, Log.DEBUG2);
      ret += key + '::';
      if (!obj){
         ret += '[]';
      } else {
         ret += obj.toDelta();
      }
      this.LOG.debug('value: ' + ret);
      this.LOG.goOut(Log.DEBUG2);
    }.bind(this));
    LOG.goOut(Log.DEBUG2);
    return ret;
  }
});

/**
 * Slices Class
 */
//  取得したデータをbidごとのsliceの集まりとして保持するクラス
//  画面を遷移するごとにStoreからsliceを切り出すのは計算量の面で損だとの考えからつくってみた
//  keyとしてはbidの数値を使う
var Slices = Class.create(Hash, {
	/**
	 * initialize()
	 */
  initialize : function initialize($super){
    LOG.getInto('Slices#initialize');
    $super();
    this.names = $w('board nextMoves prevMoves movePointsByUser movePointsAverage moveComments boardPointByUser boardPointAverage boardComments');
    this.LOG = LOG;
    LOG.goOut();
  },
	/**
	 * read(bid,sliceData)
	 */
	// サーバからうけたデータを自身に格納する
	// registBoardのレスポンスを登録することを想定している
	// 入力 : bid  新しいボードのbid
	//      : sliceData  javascriptのオブジェクト 新しいボードの１画面ぶんのデータ
	// 出力 : なし
  read : function read(bid, sliceData) { // Slices
    LOG.getInto('Slices#read');
    LOG.debug('typeof bid : ' + typeof bid);
    if (typeof bid == 'string') bid = parseInt(bid);
    this.set(bid, sliceData);
    LOG.debug('this['+bid+'] became ' + Object.toJSON(this.get(bid)));
    LOG.goOut();
  }
});

/**
 * Store Class
 */
//  dataをやりとり、操作するクラス
//  Hashの子クラス だが、Hashにする必要はなかったか。
//  dataの構造としては、Storeは、this.slicesオブジェクトを持ち、それが
//  各sliceオブジェクトをもつ。
var Store = Class.create(Hash, {
	/**
	 * initialize()
	 */
  initialize : function initialize($super){
    this.LOG = LOG;
    LOG.getInto('Store#initialize');
    $super();
    this.name  = 'data';
    this.initArea();
    this.names = $w('board nextMoves prevMoves movePointsByUser movePointsAverage moveComments boardPointByUser boardPointAverage boardComments');
    this.slices = new Slices();
    this.currentBid = 1;  // 現在の画面のbidの値を格納。初期値は1となる。
       // stateを読むごとに更新される どこで？
    this.nextBid = null; // 次に表示する画面のbidの値を格納する。
       // 初期値はわからないのでnullとする。
       // ユーザアクションを受けてはじめて決まり、
       // 次の画面情報を作成するときに使われる
    // まず初期盤面のデータを取得しておく
    //  mask値が7なのは暫定。これは
    this.getMsg(1, 1, 3, 7, 'full', false);
    // 初期盤面のデータを取得後に、ready をtrueにする。（on Successのなか）
    // this.ready = true;
    LOG.goOut();
  },
	/**
	 * initArea()
         */
	// dataStoreのdebug dump用のエリア
  initArea: function initArea(){
    LOG.getInto('Store#initArea');
    this.area = areas[this.name];
    LOG.goOut();
  },
	/**
	 * currentSlice()
         */
  currentSlice: function currentSlice(){
    return this.slices.get(this.currentBid);
  },
	/**
	 * getMaskedDataName(mask)
	 */
	// this.names にmaskフィルタをかけて得られる配列を返す
	// 入力 : 数値 mask
	// 出力 : 配列
  getMaskedDataName : function getMaskedDataName(mask) { // Store
    var ret = [];
    for(var index=0; index < 10; index++){
      if ((mask & (1 << index)) > 0) ret.push(this.names[index]);
    }
    return ret;
  },
	/**
	 * readDB(data, mask)
	 */
	// サーバからうけたデータを自身に格納する
        // makeSliceを使い、jsのオブジェクトをそれぞれの型のオブジェクトに
        // 変換しまとめてSliceオブジェクトとしてから、
        // このStoreのslicesプロパティに格納する。
	// 入力 : data  DBからのresponseをunpackしたjavascriptのオブジェクト
	//        mask  dataNameの使用範囲を指定する数字, 省略時は511
	// 出力 : なし
  readDB : function readDB(data, mask) { // Store
    LOG.getInto('Store#readDB');
    // dataに含まれるbidを取り出して配列として保持
    var bids = data['board'].pluck('bid');
    // data[board]は、dataが保持しているjsオブジェクトの配列
    LOG.debug('data[board] : ' + JSON.stringify(data['board']));
    // bidsは、数値の配列
    LOG.debug('bids : ' + JSON.stringify(bids));
    LOG.debug('bids size : ' + JSON.stringify(bids.length));
    var m = mask || 511;
    bids.each(function(bid){
      this.LOG.debug('bid : ' + JSON.stringify(bid) + ', typof bid: '+ typeof bid);
      this.slices.set(bid, this.makeSlice(bid, data, m));
      this.LOG.debug('typeof slices key: ' + JSON.stringify(typeof this.slices.keys()[0]));
      this.LOG.debug('slice made : ' + JSON.stringify(this.slices.get(bid).toDebugString()));
    }.bind(this));
    LOG.debug('slices['+this.currentBid+'] became : ' + this.slices.get(this.currentBid).toDebugString());
    LOG.debug('slices: keys ');
    LOG.debug(JSON.stringify(this.slices.keys()));
    LOG.debug('typeof slices key: ' + JSON.stringify(typeof this.slices.keys()[0]));
    LOG.debug('slices: values ');
    LOG.debug(JSON.stringify(this.slices.values()));
    LOG.debug('currentBid: ');
    LOG.debug(JSON.stringify(this.currentBid));
    LOG.debug('currentSlice: keys');
    LOG.debug(JSON.stringify(this.currentSlice().keys()));
    LOG.debug('currentSlice: get board');
    LOG.debug(JSON.stringify(this.currentSlice().get('board')['board']));
    LOG.goOut();
  },
	/**
	 * readState(data)
	 */
	// stateのデータを自身に格納する
	// 入力 : state  google wave のgadgetの仕様にしたがう
	// 出力 : なし
  readState : function readState(state) { // Store
    LOG.getInto('Store#readState');
    this.currentBid = parseInt(state.get('bid'));
    LOG.debug('currentBid became : ' + this.currentBid);
      // stateから読んだbidは、これから表示しようとする画面のbid
      // なので、currentBidという名をつけてアクセスを容易にする
      // 次のstateが降ってくるまで、このbidが画面表示の基礎データとなる
    var slice = (new Slice()).fromState(state);
/*
    slice.set('board',     (new BoardData(LOG)).fromDelta(state.get('board')));
    slice.set('nextMoves', (new Moves('nextMoves')).fromDelta(state.get('next')));
    slice.set('prevMoves', (new Moves('prevMoves')).fromDelta(state.get('prev')));
*/
    if (typeof this.currentBid != 'number'){
      LOG.fatal('Something wrong : storeData.currentBid became not number!');
    }
    this.slices.set(this.currentBid, slice);
    LOG.debug('slices['+this.currentBid+'] became : ' + this.slices.get(this.currentBid));
    LOG.goOut();
  },
	/**
	 * makeSlice(bid, data, mask)
	 */
	// １画面ぶんのデータをdataから切り出してSliceオブジェクトとして返す
	// 入力 : 数値 bid このbidのSliceを作れ、という意味
	//        オブジェクト data DBからのresponse
	//        数値 mask this.nameのうち何を結果に含めるかを指定する
	//           指定方法：this.nameの添字をbitに見立てた二進から10進変換
	// 出力 : Sliceオブジェクト(Hash)
  makeSlice : function makeSlice(bid, data, mask) { // Store
    LOG.getInto('Store#makeSlice');
    var m = mask || 511;
    LOG.debug('m : ' + JSON.stringify(m));
    var target;
    var ret = new Slice();
    var dataNames = this.getMaskedDataName(m);
    LOG.debug('masked data name : ' + JSON.stringify(dataNames));
    // ほとんどの場合、あるbidの画面にはそのbidを自身のbidとして持つオブジェクトを集める
    dataNames.each(function(name){
      this.LOG.debug('name : ' + JSON.stringify(name));
      switch(name){
        case 'board':
          this.LOG.getInto('processing board',Log.DEBUG2);
          target = data['board'].find(function(e){
             return e.bid == bid;
          });
          this.LOG.debug('target : ' + JSON.stringify(target));
          this.LOG.debug('target.bid : ' + JSON.stringify(target.bid));
          this.LOG.debug('target.board : ' + JSON.stringify(target.board));
          var obj = new BoardData();
          this.LOG.debug('obj after initialize : ' + obj.toDelta());
          obj.fromDB(target);
          this.LOG.debug('obj after fromDB : ' + obj.toDelta());
          ret.set('board', obj);
          this.LOG.debug('ret[board] became : ' + JSON.stringify(ret.get('board')));
          this.LOG.goOut(Log.DEBUG2);
          break;
        case 'nextMoves':
          this.LOG.getInto('processing nextMoves',Log.DEBUG2);
          target = $A(data['nextMoves']).findAll(function(obj){
      	         return obj.bid == bid;
      	       }.bind(this));
          this.LOG.debug('target : ' + JSON.stringify(target));
          var obj = new Moves('nextMoves');
          ret.set('nextMoves', obj.fromDB(target));
          this.LOG.debug('obj after fromDB : ' + obj.toDelta());
          this.LOG.debug('ret (Slice): ' + JSON.stringify(ret));
          this.LOG.goOut(Log.DEBUG2);
          break;
        case 'prevMoves':
          this.LOG.getInto('processing prevMoves',Log.DEBUG2);
          target = $A(data['prevMoves']).findAll(function(obj){
    	       return obj.nxt_bid == bid;
    	  });
          if (target.length > 0){
            this.LOG.debug('target : ' + JSON.stringify(target));
            var obj = new Moves('prevMoves');
            ret.set('prevMoves', obj.fromDB(target));
            this.LOG.debug('obj after fromDB : ' + obj.toDelta());
            this.LOG.debug('ret (Slice): ' + JSON.stringify(ret));
          } else {
            ret.set('prevMoves', (new Moves('prevMoves')));
            this.LOG.debug('ret (Slice): ' + JSON.stringify(ret));
          }
          this.LOG.goOut(Log.DEBUG2);
          break;
        default:
          this.LOG.fatal('Store#makeSlice : wrong data name arrived!');
          break;
      }
      return ret;
    }.bind(this));
    // prevMovesだけは、あるbidの画面にはnxt_bidがbidのオブジェクトを集める
    LOG.debug('returning from makeSlice with : ' + ret.toDebugString());
    LOG.goOut();
    return ret; 
  },
	/**
	 * ask(name, bid)
	 */
	// Storeから個別のname, bidごとのデータオブジェクトを取得する
        // 入力 : name  データの名前 this.namesの要素のいずれか。
	//        bid   取得したいデータのbid
	// 出力 : Storeが保持しているデータオブジェクト
  ask : function ask(name, bid){ // Store
    LOG.getInto('Store#ask');
    var ret = this.slices.get(bid).get(name);
    LOG.debug('asked bid : ' + bid + ',  name : ' + name);
    LOG.debug('returning : ' + ret.toDelta());
    LOG.goOut();
    return ret;
  },
	/**
	 * findNextMove(move)
	 */
	// 入力されたmoveがcurrentSliceのnextMovesに含まれるか調べ
	// あればそのMoveオブジェクトを返し、無ければundefinedを返す
        // 入力 : Moveオブジェクト
	// 出力 : Moveオブジェクト または false
  findNextMove : function findNextMove(move){ // Store
    LOG.getInto('Store#findNextMove'); 
    var ret = this.currentSlice().get('nextMoves').search(move);
    if (ret) {
      LOG.debug('Move found. returning : ' + ret.toDebugString());
      LOG.goOut();
      return ret;
    } else {
      LOG.debug('Move not found. returning : false');
      LOG.goOut();
      return false;
    }
  },
	/**
	 * getMsg(bid, uid, level, mask, range, async)
	 */
  getMsg : function getMsg(bid, uid, level, mask, range, async){ // Store
    LOG.getInto('Store#getMsg'); 
    var request = new Ajax.Request('/getMsg', {
         method: 'get',
         onCreate: function(request, response){
             if(request.transport.overrideMimeType){
                 request.transport.overrideMimeType("text/plain; charset=x-user-defined");
             }
         },
      parameters : { 'bid' : bid , 'uid' :uid, 'level' : level, 'mask' : mask, 'range' : range },
      asynchronous : async,
      onSuccess : function onSuccess_getMsg(response){
        this.LOG.getInto('onSuccess_getMsg');
        this.LOG.debug('responseText : ' + Object.toJSON(response.responseText));
        var data= msgpack.unpack(response.responseText);
        this.LOG.debug('unpacked responseText : ' + Object.toJSON(data));
        this.readDB(data, 7);
 //       this.LOG.debug('store.toDebugHtml : ' + this.toDebugHtml());
        this.ready = true;
        this.LOG.goOut();
        return data;
      }.bind(this),
      onFailure : function onFailure_getMsg(response){
        this.LOG.getInto();
        this.LOG.debug('onFailure : ' + response.status + response.statusText);
        this.LOG.goOut();
        return false;

      }.bind(this)
    });
    LOG.goOut();
    var response = new Ajax.Response(request);
  },

  getQueryStr : function getQueryStr(move){ // Store
    LOG.getInto(); 
    var game = window.gameController.game;
    var res = {
      'turn'    : game.board.turn ? 't' : 'f',
      'board'   : game.board.toString(),
      'black'   : game.blackStand.toString(),
      'white'   : game.whiteStand.toString(),
      'from'    : move.from,
      'to'      : move.to,
      'piece'   : move.piece,
      'promote' : move.promote ? 't' : 'f',
      'oldbid'  : move.bid
    };
    res = $H(res).toQueryString();
    LOG.debug('res : ' + res);
    LOG.goOut();
    return res;
  },

  registBoard : function registBoard(move){ // Store
    LOG.getInto(); 
    var game = window.gameController.game;
    var request = new Ajax.Request('/bid', {
         method: 'post',
         onCreate: function(request, response){
             if(request.transport.overrideMimeType){
                 request.transport.overrideMimeType("text/plain; charset=x-user-defined");
             }
         },
      parameters : this.getQueryStr(move),
      //asynchronous : true,
      asynchronous : false,
      onSuccess : function onSuccess_registBoard(response){
        this.LOG.getInto('Store#onSuccess_registBoard');
        this.LOG.debug('responseText : ' + Object.toJSON(response.responseText));
        var data= msgpack.unpack(response.responseText);
        this.LOG.debug('result of registBoard :<br> unpacked responseText : ' + Object.toJSON(data));
          // この出力例：
          //  {"prevMoves": [{"promote": "f", "m_to": "96", "piece": "P", "bid": "1", "mid": 5, "m_from": "97", "nxt_bid": 73630}],
// "nextMoves": [],
// "board": [{"white": "", "black": "", "bid": "1", "board": "lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxxPxSnrpxxxPBNlxpxxPxxL", "turn": "f"}]}
        window.gameController.game.new_bid = parseInt(data['board'][0]['bid']);
              // DBからの返事である、盤面のbid
        // 新しいbidのデータをdataStoreに追加する
        this.readDB(data, 7);
        // registBoardの場合、それだけでは追加が足りない。新局面に至った新手の情報がまだ追加されていないから、それを追加する。
        // 新手の情報とは、この新局面にとってのprevMoves[0]にほかならない。
        this.addMovesAsNextMoves(data['prevMoves'])
        this.LOG.debug('slice read done : ');
//        this.LOG.debug('this.slices['+game.new_bid+'] : '+Object.toJSON(this.slices.get(game.new_bid)));
        //var delta =  window.gameController.makeReviewDelta(game.new_bid);
        this.LOG.goOut();
        return data;
      }.bind(this),
      onFailure : function onFailure_registBoard(response){
        this.LOG.getInto();
        this.LOG.debug('onFailure : ' + response.status + response.statusText);
        this.LOG.goOut();
        return false;
      }.bind(this)
    });
    var response = new Ajax.Response(request);
    LOG.goOut();
  },
	/**
	 * addMovesAsNextMoves(ary)
	 */
        // 入力 : ary Moveを表すjsオブジェクトの配列
        // 出力 : なし
        // 機能 : 受け取った配列の各要素を、そのMoveのbidのNextMovesに追加する。
  addMovesAsNextMoves: function addMovesAsNextMoves(ary) { // Store
    LOG.getInto('Store#addMovesAsNextMoves'); 
    LOG.debug('ary : ' + Object.toJSON(ary));
    $A(ary).each(function(m){
      this.LOG.debug('m : ' + Object.toJSON(m));
      // var obj = evalJSON(m);
      var bid = parseInt(m['bid']);
      this.LOG.debug('bid : ' + Object.toJSON(bid));
      var slice = this.slices.get(bid);
      this.LOG.debug('slice : ' + slice.toDebugString());
      var nm = slice.get('nextMoves');
      if (!nm) {
        nm =  new Moves('nextMoves');
        slice.set('nextMoves',nm);
      }
      this.LOG.debug('nextMoves before : ' + nm.toDebugString());
      nm.fromDB([m]); // mをMoveオブジェクトにしてからNextMovesに追加してくれる
      this.LOG.debug('nextMoves after : ' + nm.toDebugString());
    }.bind(this));
    LOG.goOut();
  },
	/**
	 * toDebugHtml()
	 */
  toDebugHtml: function toDebugHtml() { // Store
    LOG.getInto('Store#toDebugHtml'); 
    LOG.debug('keys.size : ' + this.keys().length);
    // 自身を表示
    var ret = '<table class="storeTable">';
    this.each(function(pair){
      ret += '<tr>'
      ret += '<td>' + pair.key + '</td>';
      ret += '<td>' + JSON.stringify(pair.value) + '</td>';
      ret += '</tr>';
    });
    ret += '</table>';
    // slicesを表示
    var ret_slice = '<table class="storeTable">';
    this.slices.each(function(pair){
      this.LOG.debug('pair.key : ' + JSON.stringify(pair.key));
      this.LOG.debug('pair.value : ' + pair.value.toDebugString());
      ret_slice += '<tr>'
      ret_slice += '<td>' + pair.key + '</td>';
      ret_slice += '<td>' + pair.value.toDebugHtml() + '</td>';
      ret_slice += '</tr>';
    }.bind(this));
    ret_slice += '</table>';
    LOG.debug('returning with : ');
    //LOG.debug(JSON.stringify(this));
    LOG.goOut();
    return ret + ret_slice;
  }
});

dataStore = new Store();
LOG.debug('dataStore was created.');

