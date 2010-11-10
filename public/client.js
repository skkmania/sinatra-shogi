//  client.js
//   2010/05/25
//  dataをやりとり、操作するクラス Storeをつくる
// あとメールをやりとりするよりも「ログを全部よこせ」が一番早いので、
// ログを吐くべし。設定とか環境もログに吐いた方が良さそう。
// それからエラーログには解決方法も書くか、
// ログから解決方法を辿れるようにするのが良い。 

//-----------------------------------------------------------------
//  view
//-----------------------------------------------------------------

function initOnClick_Title(){
    LOG.getInto();
    $('hTitle').observe('click',
      function(evt){ 
        hand.areaClicked('next', '1');
      }
    );
    LOG.goOut();
}
/**
 * Slice Class
 */
//  1画面ぶんのデータの集まりを保持するクラス
//  画面を遷移するごとにStoreからsliceを切り出すのは計算量の面で損だとの考えからつくってみた
//  keyとして bids board nextMoves prevMoves movePointsByUser movePointsAverage moveComments boardPointByUser boardPointAverage boardComments
var Slice = Class.create(Hash, {
	/**
	 * initialize()
	 */
  initialize : function initialize($super, LOG){
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
    this.set('board',     (new BoardData(LOG)).fromDelta(state.get('board',window.gameController.game.board.initialString)));
    this.set('nextMoves', (new Moves(LOG)).fromDelta(state.get('next', '')));
    this.set('prevMoves', (new Moves(LOG)).fromDelta(state.get('prev', '')));
    LOG.goOut();
    return this;
  },
	/**
	 * toDebugHtml()
	 */
  toDebugHtml : function toDebugHtml(){ // Slice
    LOG.getInto('Slice#toDebugHtml');
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
    LOG.goOut();
    return ret + '</table>';
  },
	/**
	 * toDebugString()
	 */
  toDebugString : function toDebugString(){ // Slice
    LOG.getInto('Slice#toDebugString');
    var ret = '';
    LOG.debug('keys : ' + JSON.stringify(this.keys()));
    //LOG.debug('keys : ' + Object.toJSON(this.keys()));
    // LOG.debug('values : ' + Object.toJSON(this.values()));
    this.keys().each(function(key){
      var obj = this.get(key);
      this.LOG.getInto('key : ' + key);
      ret += key + '::';
      if (!obj){
         ret += '[]';
      } else {
         ret += obj.toDelta();
      }
      this.LOG.debug('value: ' + ret);
      this.LOG.goOut();
    }.bind(this));
    LOG.goOut();
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
  initialize : function initialize($super, LOG){
    LOG.getInto('Slices#initialize');
    $super();
    this.names = $w('board nextMoves prevMoves movePointsByUser movePointsAverage moveComments boardPointByUser boardPointAverage boardComments');
    LOG = LOG;
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
  initialize : function initialize($super, LOG){
    this.LOG = LOG;
    LOG.getInto('Store#initialize');
    $super();
    this.names = $w('board nextMoves prevMoves movePointsByUser movePointsAverage moveComments boardPointByUser boardPointAverage boardComments');
    this.slices = new Slices(LOG);
    this.currentBid = 1;  // 現在の画面のbidの値を格納。初期値は1となる。
       // stateを読むごとに更新される
    this.nextBid = null; // 次に表示する画面のbidの値を格納する。
       // 初期値はわからないのでnullとする。
       // ユーザアクションを受けてはじめて決まり、
       // 次の画面情報を作成するときに使われる
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
    LOG.debug('data[board] : ' + Object.toJSON(data['board']));
    // bidsは、数値の配列
    LOG.debug('bids : ' + Object.toJSON(bids));
    var m = mask || 511;
    bids.each(function(bid){
      this.LOG.debug('bid : ' + Object.toJSON(bid));
      this.slices.set(bid, this.makeSlice(bid, data, m));
    }.bind(this));
    //LOG.debug('slieces['+this.currentBid+'] became : ' + this.slices.get(this.currentBid));
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
      // stateから読んだbidは、これから表示しようとする画面のbid
      // なので、currentBidという名をつけてアクセスを容易にする
      // 次のstateが降ってくるまで、このbidが画面表示の基礎データとなる
    var slice = (new Slice(LOG)).fromState(state);
/*
    slice.set('board',     (new BoardData(LOG)).fromDelta(state.get('board')));
    slice.set('nextMoves', (new Moves(LOG)).fromDelta(state.get('next')));
    slice.set('prevMoves', (new Moves(LOG)).fromDelta(state.get('prev')));
*/
    this.slices.set(this.currentBid, slice);
    LOG.debug('slieces['+this.currentBid+'] became : ' + this.slices.get(this.currentBid));
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
    LOG.debug('m : ' + Object.toJSON(m));
    var target;
    var ret = new Slice(LOG);
    var dataNames = this.getMaskedDataName(m);
    LOG.debug('masked data name : ' + Object.toJSON(dataNames));
    // ほとんどの場合、あるbidの画面にはそのbidを自身のbidとして持つオブジェクトを集める
    dataNames.each(function(name){
      this.LOG.debug('name : ' + Object.toJSON(name));
      switch(name){
        case 'board':
          target = data['board'].find(function(e){
             return e.bid == bid;
          });
          this.LOG.debug('target : ' + Object.toJSON(target));
          this.LOG.debug('target.bid : ' + Object.toJSON(target.bid));
          this.LOG.debug('target.board : ' + Object.toJSON(target.board));
          var obj = new BoardData(this.LOG);
          this.LOG.debug('obj after initialize : ' + obj.toDelta());
          ret.set('board',    obj.fromDB(target));
          this.LOG.debug('obj after fromDB : ' + obj.toDelta());
          this.LOG.debug('ret : ' + Object.toJSON(ret));
          break;
        case 'nextMoves':
          target = $A(data['nextMoves']).findAll(function(obj){
      	         return obj.bid == bid;
      	       }.bind(this));
          this.LOG.debug('target : ' + Object.toJSON(target));
          var obj = new Moves(this.LOG);
          ret.set('nextMoves', obj.fromDB(target));
          break;
        case 'prevMoves':
          target = $A(data['prevMoves']).findAll(function(obj){
    	       return obj.nxt_bid == bid;
    	     }.bind(this));
          ret.set('prevMoves', (new Moves()).fromDB(target));
          break;
        default:
          this.LOG.fatal('Store#makeSlice : wrong data name arrived!');
          break;
      }
      return ret;
    }.bind(this));
    // prevMovesだけは、あるbidの画面にはnxt_bidがbidのオブジェクトを集める
    LOG.debug('ret : ' + ret.toDebugString());
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
    LOG.debug('returning : ' + Object.toJSON(ret));
    LOG.goOut();
    return ret;
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
        //var delta =  window.gameController.handler.makeReviewDelta(game.new_bid);
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
        nm =  new Moves(this.LOG);
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
    // 自身を表示
    var ret = '<table class="storeTable">';
    this.each(function(pair){
      ret += '<tr>'
      ret += '<td>' + pair.key + '</td>';
      ret += '<td>' + Object.toJSON(pair.value) + '</td>';
      ret += '</tr>';
    });
    ret += '</table>';
    // slicesを表示
    var ret_slice = '<table class="storeTable">';
    this.slices.each(function(pair){
      this.LOG.debug('pair.key : ' + Object.toJSON(pair.key));
      this.LOG.debug('pair.value : ' + pair.value.toDebugString());
      ret_slice += '<tr>'
      ret_slice += '<td>' + pair.key + '</td>';
      ret_slice += '<td>' + pair.value.toDebugHtml() + '</td>';
      ret_slice += '</tr>';
    }.bind(this));
    ret_slice += '</table>';
    LOG.goOut();
    return ret + ret_slice;
  }
});

/**
 * Area Class
 */
// それぞれのデータを表示する領域
// livepipeのwindowを使う
var Area = Class.create({

  initialize : function initialize(hand, container, title, options){
    LOG.getInto('Area#initialize');
    this.handler = hand;
    this.LOG = LOG;
    this.container = container;
    this.title = title;
    this.window_header = new Element('div',{ className: 'window_header' });  
    this.window_title = new Element('div',{  className: 'window_title'  });  
    this.window_title.insert(title);
    this.window_close = new Element('div',{  className: 'window_close'  });  
    this.window_contents = new Element('div',{  className: 'window_contents'  });  
    this.default_options = { 
              resizable:true,
              insertRemoteContentAt: this.window_contents,
              closeOnClick: this.window_close,
              draggable: this.window_header,
              className:'window',
              width:300,
              height:500 };
    // window_headerにwindow_titleとwindow_closeを挿入してから
    this.options = Object.extend(this.default_options, options || {});
    LOG.debug(container + ' window is opening');
    this.openWindow();
    LOG.goOut();
  },

  openWindow: function openWindow(){ // Area
    LOG.getInto('Area#openWindow');
    if (!this.window || !this.window.document) {
      this.anchor = new Element('a',{'id':this.title+'anchor', 'href':'#' + this.title, 'title': this.title });
      $('links_pool').appendChild(this.anchor);
      this.anchor.insert(this.title);
      this.window = new Control.Window(this.anchor, this.default_options); 
      // window_headerにwindow_titleとwindow_closeを挿入してから
      this.window_header.insert(this.window_title);
      this.window_header.insert(this.window_close);
      // windowの先頭にwindow_header要素を挿入しておく。
      this.window.container.insert(this.window_header); 
      // headerの後に、contents要素を挿入する。
      this.window.container.insert(this.window_contents);
      if (!this.window) {
         throw "Error : popup window not generated. : " + this.title;
         return;
      }
    }
    //this.window.open();
    LOG.goOut();
  },
	/*
	 * show()
	 */
	// dataStoreのデータをもとに、自身のwindowに内容を表示する
	// 現状では、(2010.6.24) nextMovesとprevMovesのAreaにのみ対応する
  show : function show(){ // Area
    LOG.getInto('Area#show');
    LOG.debug(this.container + ' area is to be displayed.');
    var ret = '';
    var str = '<ul>';
    var movesObj = this.handler.dataStore.currentSlice().get(this.title);
    LOG.debug('title : ' + Object.toJSON(this.title));
    str += movesObj.inject(ret, function(acc, pair){
      var kanji = pair.value.toKanji();
      ret = acc + '<li id="' + this.container + pair.value.mid + '">' + kanji + '</li>';
      return ret;
    }.bind(this));
    str += '</ul>';
    LOG.debug('str : ' + str);
    LOG.debug('container : ' + this.window.container.id);
    this.window_contents.update(str);
    LOG.goOut();
  },
	/*
	 * layoutContents()
	 */
	// boardArea のためのメソッド
	// boardAreaに、駒台と盤のための要素を追加する
  layoutContents : function layoutContents(){ // Area
    LOG.getInto('Area#layoutContents');
   // this.whiteStand = new Element('div',{ id: 'white-stand' });
    this.topStand = new Element('div',{ id: 'top-stand' });
   // this.topStand.appendChild(this.whiteStand);
    this.window_contents.appendChild(this.topStand);
    this.boardPanel = new Element('div',{ id: 'board-panel' });
    this.window_contents.appendChild(this.boardPanel);
   // this.blackStand = new Element('div',{ id: 'black-stand' });
    this.bottomStand = new Element('div',{ id: 'bottom-stand' });
    this.bottomStand.setStyle({ margin:'150px 0px 0px 400px' });
   // this.bottomStand.appendChild(this.blackStand);
    this.window_contents.appendChild(this.bottomStand);
    LOG.goOut();
  },
	/*
	 * display(target)
	 */
	// Area のwindowの中身にデータを入力し、window.contentsをupdateする
	// 入力 : 数値 target 表示したい画面のbid
	// 出力 : なし
  display : function display_Area(target){ // Area
    LOG.getInto();
    LOG.debug(this.container + ' stand is to be displayed.');
    LOG.debug('target is ' + target);
    LOG.debug('target_store is ' + this.handler.target_store);
    var str = '';
    switch (this.container){
      case 'pres':
   	str = '<ul>';
	this.handler.dataStore.currentSlice().get('prevMoves').each(function(paer){
          });
/*
	 if(this.handler.dataStore.slices.get(target)){
   	      str = '<ul>';
	   $A(this.handler.dataStore.slices.get(target).get('bids')[0]['pres']).each(function(e){
	     str += '<li>' + e + '</li>';
	   });
   	      str += '</ul>';
	 } else {
	   if(!this.handler.dataStore.slices.get(target)){
	     str = '<ul><li>now loading</li></ul>';
	     this.window_contents.update(str);
           }
           str = '<ul>';
           if (this.handler.dataStore.slices.get(this.handler.target_store)) {
	     $A(this.handler.dataStore.slices.get(target_store).get('bids')[0]['pres']).each(function(e){
	       str += '<li>' + e + '</li>';
             });
           }
	 }
*/
           break;
      case 'board':
           this.handler.board.read();
           break;
      case 'self':
           str = '<ul><li>' + target + '</li></ul>';
           break;
      case 'data':
           str = this.handler.dataStore.toDebugHtml();
           break;
      case 'nxts':
        LOG.debug('nxts : str -> ' + str);
        LOG.debug('nxts : target -> ' + target);
       	LOG.debug('dataStore -> ' + Object.toJSON(this.handler.dataStore));
       	LOG.debug('slice -> ' + Object.toJSON(this.handler.dataStore.slices));

       	if(this.handler.dataStore.slices.get(target)){
       	  LOG.debug('slices.get('+target+') -> ' + Object.toJSON(this.handler.dataStore.slices.get(target)));
          str = '<ul>';
	  LOG.debug(Object.toJSON(this.handler.dataStore.slices.get(target).get('bids')[0]['nxts']));
	   $A(this.handler.dataStore.slices.get(target).get('bids')[0]['nxts']).each(function(e){
	     str += '<li>' + e + '</li>';
	   });
	  str += '</ul>';
          LOG.debug('str -> ' + str);
        } else {
	  if(!this.handler.dataStore.slices.get(target)){
	    str = '<ul><li>now loading</li></ul>';
	    this.window_contents.update(str);
          }
          str = '<ul>';
          if (this.handler.dataStore.slices.get(this.handler.target_store)) {
	    $A(this.handler.dataStore.slices.get(this.target_store).get('bids')[0]['nxts']).each(function(e){
	      str += '<li>' + e + '</li>';
            });
           }
        }
           break;
	default:
		break;
    }
    LOG.debug('container : ' + this.window.container.id);
    this.window_contents.update(str);
    this.window.open();
    LOG.goOut();
  },

  initOnClick : function initOnClick_Area(){ // Area
    LOG.getInto('Area#initOnClick');
    LOG.goOut();
    this.window_contents.observe('click',
      function(evt){ 
        this.LOG.getInto('Area#initOnClick#observe');
        this.LOG.debug('id of clicked element : ' + evt.findElement('li').id);
        var mid = parseInt(evt.findElement('li').id.match(/\d+/)[0]);
        this.LOG.debug('mid of clicked element : ' + mid);
        var inner = evt.findElement('li').innerHTML;
        this.handler.areaClicked(this.container, mid, inner);
        this.LOG.goOut();
      }.bind(this)
    );
  },

});

//-----------------------------------------------------------------
//  controller
//-----------------------------------------------------------------
var Handler = Class.create({

  initialize : function initialize(controller) {
    this.controller = controller;
    this.LOG = LOG;
    LOG.getInto('Handler#initialize');
    this.dataStore = new Store(LOG); // データをbidごとに再構成したデータの貯蔵庫
    LOG.debug('dataStore was created.');
    // 以下の３つのプロパティは、保持するキャッシュの肥大化を防ぐ目的で導入
    // 例えば１局の将棋の指し手を次々に読み込んでいけば、そのたびにキャッシュにデータが増える。
    // なので、中盤になったら序盤のデータは捨ててもいいだろう、と判断する
    // しかしこのソフトではある局面が序盤か中盤かはわからない
    // そこで具体的には、データを読み込んだ時系列に頼ることにする。
    // 
    this.max_cache = 200;    // キャッシュするbidの最大個数のしきい値。
    this.age = 0;            // キャッシュの年齢。 updateDataのたびに１増える。
    this.age_hash = $H();    // bid : age のハッシュ。各bidのageを記憶しておく。
    this.data_name = $w('bids board nextMoves prevMoves movePointsByUser movePointsAverage moveComments boardPointByUser boardPointAverage boardComments');

    this.target_store = 0;  // nxts or pres をクリックしたときのtargetを保管する。now loadingになったときに復活するために使う。
    LOG.debug('areas are being initialized');
    // ControlPanel Area
    this.cpArea = new Area(this, 'controlPanel', 'ControlPanel',{position:[10,0], width:500, height:90});
    this.cpArea.initOnClick();
    // 前の手のエリア
    this.prevArea = new Area(this, 'pres', 'prevMoves',{position:[10,100], width:120, height:300});
    this.prevArea.initOnClick();
    // 盤面のエリア
    this.boardArea = new Area(this, 'boardArea', 'Board',{position:[160,100], width:520, height:440});
    this.boardArea.layoutContents();
    // 次の手のエリア
    this.nextArea = new Area(this, 'nxts', 'nextMoves',{position:[690,100], width:120, height:400});
    this.nextArea.initOnClick();
    // nextMovePoint用のエリア
    this.nextMovePointArea = new Area(this, 'nextMovePoint', 'NextMovePoint',{position:[850,100], width:130, height:400});
    this.nextMovePointArea.initOnClick();
    // nextMoveComment用のエリア
    this.nextMoveCommentArea = new Area(this, 'nextMoveComment', 'NextMoveComment',{position:[1010,100], width:180, height:400});
    this.nextMoveCommentArea.initOnClick();
    // boardPoint用のエリア
    this.boardPointArea = new Area(this, 'boardPoint', 'BoardPoint',{position:[10,450], width:120, height:100});
    this.boardPointArea.initOnClick();
    // boardComment用のエリア
    this.boardCommentArea = new Area(this, 'boardComment', 'BoardComment',{position:[10,580], width:700, height:100});
    this.boardCommentArea.initOnClick();
    // 棋譜読み込み用のエリア
    this.readBookArea = new Area(this, 'readBook', 'ReadBook',{position:[850,580], width:200, height:380});
    this.readBookArea.initOnClick();
    this.book = new Book(this);
    this.book.showBookForm();
    this.book.showInputBox();
    // dataStoreのdebug dump用のエリア
    this.dataArea = new Area(this, 'data', 'dataStore',{position:[10,680], width:830, height:270});
    LOG.debug('areas were initialized');
    this.gUid = 1;
    this.gRange = 'only';
  // range は 'only' か 'full'の２値をとる。
  //   'only' : levelで指定した深さに相当するデータのみ取得せよ、という意味になる。
  //   'full' : 0からlevelまですべての深さに相当するデータを取得せよ、という意味。
    this.gLevel = 3;				// Bidをとるときの探索の深さ
    this.gCycle = 0;
  // cycle は garbage collectionの目安
    this.maxgCycle = 5;
//    this.mask = 1023;
    this.mask = 7;
    this.gMask = this.mask;
   //        mask : どのデータを取得するかを示す２進数の10進表現
   // データの選択肢は下の9つ。下位ビットから順に、
   //    bids
   //    board
   //    nextMoves
   //    prevMoves
   //    movePointsByUser  
   //    movePointsAverage 
   //    moveComments      
   //    boardPointByUser  
   //    boardPointAverage 
   //    boardComments     
   //    ただし、bids, boardは必須。つまりmaskは最低3になる。
    this.masked_data_name = $A();

    LOG.goOut();
  },


	/**
	 * makeDeltaFromSlice(bid, slice)
	 */
	// 入力されたsliceからdeltaを生成し返す
	// 入力 : bid 数値 表示したい局面のbid
	//  ただし、これはnullでも可。そのときは画面のテキスト入力画面の値を使う
	//      : slice  オブジェクト
          // 例：
          //  {"prevMoves": [{"promote": "f", "m_to": "96",
	//                    "piece": "P", "bid": "1", "mid": 5,
	//                    "m_from": "97", "nxt_bid": 73630}],
	//     "nextMoves": [],
	//     "board"    : [{"white": "", "black": "", "bid": "1",
	//                    "board": "lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxxPxSnrpxxxPBNlxpxxPxxL", "turn": "f"}]}
        // 出力 : 作成されたdelta オブジェクト
  makeDeltaFromSlice: function makeDeltaFromSlice(bid, slice){ // Handler
    var delta = {};
    LOG.getInto();
      delta['mode']  = 'review';
      delta['bid']   = Object.toJSON(bid);
      delta['turn']  = (bid % 2 == 0) ? 'f':'t';
      delta['board'] = Object.toJSON(slice.board);
      delta['next']  = Object.toJSON(slice.nextMoves);
      delta['prev']  = Object.toJSON(slice.prevMoves);
/*
      delta['bid']   = bid;
      delta['board'] = slice.board;
      delta['next']  = slice.nextMoves;
      delta['prev']  = slice.prevMoves;
*/
      LOG.debug('delta : ' + Object.toJSON(delta));
    LOG.goOut();
    return delta;
  },
	/**
	 * makeReviewDelta(bid)
	 */
	// 入力されたbidのboard情報を取得し、sliceをdeltaに置き換える
	// 入力 : bid 数値 表示したい局面のbid
	//  ただし、これはnullでも可。そのときは画面上のbid入力エリアの値を使う
        // 出力 : 作成されたdelta オブジェクト
  makeReviewDelta: function makeReviewDelta(bid){ // Handler
    var delta = {};
    LOG.getInto('Handler#makeReviewDelta');
    LOG.debug('bid : ' + bid);
    LOG.debug('typeof bid : ' + typeof bid);
    var value = bid || $('inputText').value;
    //var value = bid.toString() || $('inputText').value;
    LOG.debug('value : ' + value);
    var slice = this.dataStore.slices.get(value);
    if(!slice){
      LOG.debug('was not found in slices key, so try getMsg.');
      LOG.debug('slices key is : ' + this.dataStore.slices.keys().join(','));
      this.dataStore.getMsg(value, 1, 3, 7, 'full', false);
      //this.dataStore.arrangeByBid(7);
      slice = this.dataStore.slices.get(value);
    }
    LOG.debug('slice : ' + slice.toDebugString());
    LOG.debug('slice constructor : ' + Object.toJSON(slice.constructor));
    LOG.debug('slice.keys : ' + (slice.keys().join(',')));
    //slice = $H(slice);
    //if(slice && !slice.constructor) slice = $H(slice);
    //LOG.debug('slice constructor 2 : ' + Object.toJSON(slice.constructor));
    if(slice){
      LOG.debug('slices[' + value + '] : ' + slice.toDebugString());
      LOG.debug('slice.keys : ' + (slice.keys().join(',')));
      slice.each(function(pair){
        this.LOG.debug('key : ' + Object.toJSON(pair.key));
        this.LOG.debug('value : ' + pair.value.toDebugString());
      }.bind(this));
      delta['mode']  = 'review';
      delta['bid']   = value.toString();
      delta['turn']  = (slice.get('board').turn ? 't' : 'f');
      delta['board'] = slice.get('board').toDelta();
      delta['next']  = slice.get('nextMoves').toDelta();
      delta['prev']  = slice.get('prevMoves').toDelta();
      LOG.debug('delta : ' + Object.toJSON(delta));
    } else {
      LOG.fatal('cannot get slice');
    }
    LOG.goOut();
    return delta;
  },


	/**
	 * refreshBoard
	 */
	// 入力されたbidのboard情報を取得し、盤面を書き換える。
	// 入力 : bid 数値 表示したい局面のbid
	//  ただし、これはnullでも可。そのときは画面のテキスト入力画面の値を使う
  refreshBoard: function refreshBoard(bid){ // Handler
    LOG.getInto('Handler#refreshBoard');
    LOG.debug('bid : ' + bid);
    var boardObj, nextMoves, prevMoves;

    if(bid) $('inputText').value = bid;
    var value = $('inputText').value;
    LOG.debug('value : ' + value);
    LOG.debug('typeof value : ' + typeof value);
    var slice = this.dataStore.slices.get(value);
    LOG.debug('slice['+value+'] : ' + Object.toJSON(slice));
    if(!slice){
      this.dataStore.getMsg(value, 1, 3, 7, 'full', false);
      //this.dataStore.arrangeByBid(7);
      slice = this.dataStore.slices.get(value);
    }
    if(slice){
      window.gameController.game.boardReadFromDB();
      window.gameController.game.board.show();
      this.prevArea.show();
      this.nextArea.show();
    } else {
      LOG.fatal('cannot get slice');
    }
    LOG.goOut();
  },
	/*
	 * areaClicked(place, target, inner)
	 */
	// クリックされた要素の情報をもとに必要な処理を行う
	// 入力 : place  このエリアのコンテナの名前。どのエリアがクリックされた
	//        target 数値 li要素のプロパティからとった数字
	//        inner  クリックされた要素のinnnerHTML
  areaClicked : function areaClicked(place, target, inner){ // Handler
    LOG.getInto('Handler#areaClicked');
    LOG.debug('place -> ' + Object.toJSON(place) + ',  target -> ' + Object.toJSON(target));
    switch(place) {
      case 'nxts' :
	// この場合、targetによりクリックされた要素のmidが渡されてくる
        var bid = this.dataStore.currentSlice().get('nextMoves').get(target).nxt_bid;
        LOG.debug('bid found : ' + bid);
        window.gameController.sendDelta( this.makeReviewDelta(bid) );
        break;
      case 'pres' :
        // この場合は、クリックされた要素の文字列を、各Moveオブジェクトと比べて、一致するもののbidを返す
        LOG.getInto('clicked innerHTML is : ' + inner);
        var bid = this.dataStore.currentSlice().get('prevMoves').find(
          function(pair){
             this.LOG.debug('value.toKanji : ' + pair.value.toKanji());
             return pair.value.toKanji() == inner;
           }.bind(this)).value.bid;
        if(bid) {
          LOG.debug('bid found : ' + bid);
          window.gameController.sendDelta( this.makeReviewDelta(bid) );
        } else {
          LOG.fatal('clicked move was not found');
        }
        break;
      case 'readBook' :
        LOG.getInto('clicked innerHTML is : ' + inner);
        window.gameController.sendDelta( this.makeReviewDelta(target) );
        break;
      default :
        break;
    }
    LOG.goOut();
  },

  updateData : function updateData(target, uid, range, async){ // Handler
      LOG.getInto(); 
      LOG.debug('target: ' + arguments[0]);
      LOG.debug('uid: ' + arguments[1]);
      LOG.debug('range: ' + arguments[2]);
      LOG.debug('async: ' + arguments[3]);
      LOG.goOut();
      this.dataStore.getMsg(target, uid, this.gLevel, this.mask, range, async);
  },

  set_data_by_bid : function set_data_by_bid(target, responseJSON){
      var bids_ary;
      LOG.getInto();
      LOG.debug('contents of responseJSON follows:');
/*
      masked_data_name.each(function(e){
        LOG.debug('name : ' + e);
        if(responseJSON[e]) LOG.debug('responseJSON['+e+'] : ' + responseJSON[e]);
        else LOG.debug('responseJSON['+e+'] not exist');
      });
*/
      var data_hash = responseJSON;
      //var data_hash = $H();
      this.age += 1;
      LOG.debug('responseJSONをハッシュdata_hashに格納する');
      // DBから文字列としてうけたものを、JSONオブジェクトとして評価する
/*
      masked_data_name.each(function(e){
	data_hash.set(e, responseJSON[e]);
      });
*/
      LOG.debug('data_hash をJSONオブジェクトとして表示してみる');
      LOG.debug(Object.toJSON(data_hash), 3);
      LOG.debug('データをbidごとに再構成する');
      LOG.debug('まずdata_hash[bids]からbidを抽出する');
//      LOG.debug('data_hash[bids]は文字列で、カンマ区切りのオブジェクトの配列という形。');
//      LOG.debug('したがって、まずsplitし、個々の要素をevalすればobjectの配列となる。');
/*
      try {
        bids_ary = eval(data_hash.get('bids'));
        LOG.debug('data_hash[bids] size : ' + bids_ary.size());
      }
      catch (exception){
        alert(exception);
      }
      bids_ary.each(function(e){
        LOG.debug(e);
      });
      LOG.debug('eval bids_ary[0] : ' + Object.toJSON(eval(bids_ary[0])));
      LOG.debug('bids_ary -> ' + Object.toJSON(bids_ary));
*/
      //bids_ary = bids_ary.map(function(e){ return eval(e); }).pluck('bid');
      bids_ary = data_hash['bids'].pluck('bid');
      LOG.debug('bids_ary -> ' + Object.toJSON(bids_ary));
        // そのbidごとに、data_hashから抽出したハッシュを登録する
      bids_ary.each(function(bid){
        LOG.debug('bid : ' + bid);
        data_by_bid.set(bid, extract_from_data_hash_by_bid(bid, data_hash));
        LOG.debug('data_by_bid -> ' + Object.toJSON(data_by_bid));
        // ageも追加
        age_hash.set(bid, this.age);
      });
      // 再構成したデータのtargetぶんを表示してみる。
      LOG.debug('updateData : target -> ' + Object.toJSON(target), 3);
      LOG.debug('updateData : data_by_bid.get[target] -> ' + Object.toJSON(data_by_bid.get(target)), 3);
      // age_hash を表示
      LOG.debug('updateData : age_hash -> ' + Object.toJSON(age_hash), 3);
      // garbage collect
      var ages = age_hash.values().sortBy(function(e){ return parseInt(e); }).uniq();
      LOG.debug('updateData : ages -> ' + Object.toJSON(ages), 3);
      while(ages.size() > gLevel*2 ){
        age_hash.findAll(function(e){ return e[1] == ages[0]; }).each(function(b){
          data_by_bid.unset(b.key);
          age_hash.unset(b.key);
        });
        ages.shift();
      } 
      LOG.debug('updateData : ages after gc -> ' + Object.toJSON(ages), 3);
      LOG.debug('updateData : age_hash after gc -> ' + Object.toJSON(age_hash), 3);
      LOG.goOut();
  },
  
  updateDisplay : function updateDisplay(target){ // Handler
    LOG.getInto();
    this.prevArea.display(target);
    this.selfArea.display(target);
    this.dataArea.display(target);
    this.nextArea.display(target);
    $('size').update(this.dataStore.slices.size());
    LOG.debug('size was updated.');
    var ages = this.age_hash.values().sort().uniq();
    LOG.debug('ages : ' + Object.toJSON(ages));
    var bids_per_age = $H();
    ages.each(function(age){
      bids_per_age.set(age, age_hash.findAll(function(e){ return e[1] == age; }));
    });
    var agestr = bids_per_age.inject('',function(str, e){
       str += (e.key + ':' + e.value.size() + ':'+ e.value.invoke("first").sortBy(function(e){return parseInt(e);}).join(",") + '<br>');
       return str;
    });
    $('age').update(agestr);
    LOG.goOut();
  },

  cs_gc : function cs_garbageCollect(){
    LOG.getInto();
    LOG.debug('values : ' + Object.toJSON(cs.values()),3); 
    var minCycle = cs.values().map(function(e){ return e[2]; }).min();
    LOG.debug('minCycle : ' + minCycle);
    cs.each(function(pair){
      //LOG.debug('pair : ' + Object.toJSON(pair),3);
      if ( pair.value[2] <= minCycle + 2 ) cs.unset(pair.key);
    });
    LOG.goOut();
  }
});
//-----------------------------------------------------------------
//  main
//-----------------------------------------------------------------

function data_by_bid_to_table(target){
  var retstr = '<table style="font-size: 9pt" class="data_by_bid">';
  if (arguments.size == 0){
	  data_by_bid.each(function(parent){
	    retstr += '<tr>';
	    $H(parent.value).each(function(pair){
	      retstr += ('<td>' + Object.toJSON(pair.value) + '</td>');
	    });
	    retstr += '</tr>';
	  });
  } else {
	    retstr += '<tr>';
	    data_by_bid.get(target).each(function(pair){
	      retstr += ('<td>' + Object.toJSON(pair.value) + '</td>');
	    });
	    retstr += '</tr>';
  }
  retstr += '</table>';
  return retstr;
}

function extract_from_data_hash_by_bid(target,data_hash){
  LOG.getInto();
  var ret_hash = $H();
  $H(data_hash).each(function(pair){
    LOG.debug('key : ' + Object.toJSON(pair.key));
    LOG.debug('value : ' + Object.toJSON(pair.value));
    var v =  pair.value.findAll(function(obj){
	       return obj.bid == target;
	     });
    LOG.debug('v : ' + Object.toJSON(v));
    ret_hash.set(pair.key,v);
  });
  LOG.debug('ret_hash : ' + Object.toJSON(ret_hash));
  LOG.goOut();
  return ret_hash;
}

/*
function init(){
  LOG = makeLogObj('Log', {width:800, height:550, resizable:false});
  $('logger0').insert(new Element('img', {id:'handle0', src:"img/lib/window_close.gif"}));
  new Resizable('logger0',{handle:'handle0'});

  LOG.debug('creating masked_data_name.');
  for(var index=0; index < 10; index++){
    if ((mask & (1 << index)) > 0) masked_data_name.push(data_name[index]);
  }
  LOG.debug('masked_data_name -> ' + Object.toJSON(masked_data_name));
  hand = new Handler(LOG);
  hand.updateData(1, 1, 'full', false);
  var flag = false;
  prevArea.initOnClick();
  nextArea.initOnClick();
  while(!flag){
	  if (data_by_bid.get("1") ){ prevArea.display('1'); flag = true; }
	  if (data_by_bid.get("1") ) nextArea.display('1');
          else flag = false;
  }
  prevArea.display('1');
  LOG.debug('prevArea was displayed');
  nextArea.display('1');
  LOG.debug('nextArea was displayed');
  selfArea.display('1');
  LOG.debug('selfArea was displayed');
  dataArea.display('1');
  LOG.debug('dataArea was displayed');
}
*/
