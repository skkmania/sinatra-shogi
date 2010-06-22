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
    logObj.getInto();
    $('hTitle').observe('click',
      function(evt){ 
        hand.areaClicked('next', '1');
      }
    );
    logObj.goOut();
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
  initialize : function initialize($super, logObj){
    logObj.getInto('Slice#initialize');
    $super();
    this.names = $w('board nextMoves prevMoves movePointsByUser movePointsAverage moveComments boardPointByUser boardPointAverage boardComments');
    this.logObj = logObj;
    logObj.goOut();
  },

	/**
	 * toDebugHtml()
	 */
  toDebugHtml : function toDebugHtml(){ // Slice
    this.logObj.getInto('Slice#toDebugHtml');
    var ret = '<table class="slice">';
    this.logObj.debug('values : ' + Object.toJSON(this.values()));
    this.each(function(pair){
      this.logObj.debug('pair.key: ' + Object.toJSON(pair.key));
      this.logObj.debug('pair.value: ' + Object.toJSON(pair.value));
      ret += '<tr>';
      ret += '<td>' + pair.key + '</td>';
      if (!pair.value.length){
         ret += '[]';
      } else {
         ret += pair.value.map(function(e){
                  return '<td>' + Object.toJSON(e) + '</td>';
                }).join('');
      }
      ret += '</tr>';
    }.bind(this));
    this.logObj.goOut();
    return ret + '</table>';
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
  initialize : function initialize($super, logObj){
    logObj.getInto('Slices#initialize');
    $super();
    this.names = $w('board nextMoves prevMoves movePointsByUser movePointsAverage moveComments boardPointByUser boardPointAverage boardComments');
    this.logObj = logObj;
    logObj.goOut();
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
    this.logObj.getInto('Slices#read');
    this.logObj.debug('typeof bid : ' + typeof bid);
    this.set(bid, sliceData);
    this.logObj.debug('this['+bid+'] became ' + Object.toJSON(this.get(bid)));
    this.logObj.goOut();
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
  initialize : function initialize($super, logObj){
    this.logObj = logObj;
    this.logObj.getInto('Store#initialize');
    $super();
    this.names = $w('board nextMoves prevMoves movePointsByUser movePointsAverage moveComments boardPointByUser boardPointAverage boardComments');
    this.slices = new Slices(this.logObj);
    this.currentBid = 1;  // 現在の画面のbidの値を格納。初期値は1となる。
    this.logObj.goOut();
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
	 * _toArray(obj)
	 */
	// オブジェクトの各プロパティの値を文字列から配列にして返す
	// 入力例 : {"nxts": "{3,235}", "bid": 2, "pres": "{1}"}
	// 出力例 : {"nxts": [3,235],   "bid": 2, "pres": [1]}
  _toArray : function _toArray(obj) { // Store
    var ret = {};
    for (key in obj){
      switch (typeof obj[key]){
        case 'string':
          if (obj[key].length == 2) {
            ret[key] = [];
          } else {
            ret[key] = obj[key].slice(1,-1).split(',').map(function(e){ return parseInt(e); });
          }
          break;
        case 'number': ret[key] = obj[key];
          break;
        default: throw 'Store#_toArray: unexpected type at an Object in bids'; 
          break;
      }
    }
    return ret;
  },
	/**
	 * read(data)
	 */
	// サーバからうけたデータを自身に格納する
	// 入力 : data  DBからのresponseをunpackしたjavascriptのオブジェクト
	// 出力 : なし
  read : function read(data) { // Store
    this.logObj.getInto('Store#read');
    // this.merge(data); // なぜかmergeがうごかないので下記のようにした
    for (key in data) {
      this.set(key, data[key]);
    }
    this.logObj.debug('merged');
    this.logObj.goOut();
  },
	/**
	 * readDB(data, mask)
	 */
	// サーバからうけたデータを自身に格納する
	// 入力 : data  DBからのresponseをunpackしたjavascriptのオブジェクト
	//        mask  dataNameの使用範囲を指定する数字, 省略時は511
	// 出力 : なし
  readDB : function readDB(data, mask) { // Store
    this.logObj.getInto('Store#readDB');
    // dataに含まれるbidを取り出して配列として保持
    var bids = data['board'].pluck('bid');
    this.logObj.debug('data[board] : ' + Object.toJSON(data['board']));
    this.logObj.debug('bids : ' + Object.toJSON(bids));
    var m = mask || 511;
    bids.each(function(bid){
      this.logObj.debug('bid : ' + Object.toJSON(bid));
      this.slices.set(bid, this.makeSlice(bid, data, m));
    }.bind(this));
    //this.logObj.debug('slieces['+this.currentBid+'] became : ' + this.slices.get(this.currentBid));
    this.logObj.goOut();
  },
	/**
	 * readState(data)
	 */
	// stateのデータを自身に格納する
	// 入力 : state  google wave のgadgetの仕様にしたがう
	// 出力 : なし
  readState : function readState(state) { // Store
    this.logObj.getInto('Store#readState');
    this.currentBid = parseInt(state.get('bid'));
    var slice = new Slice(this.logObj);
    slice.set('board',     (new BoardData(this.logObj)).fromDelta(state.get('board')));
    slice.set('nextMoves', (new Moves(this.logObj)).fromDelta(state.get('next')));
    slice.set('prevMoves', (new Moves(this.logObj)).fromDelta(state.get('prev')));
    this.slices.set(this.currentBid, slice);
    this.logObj.debug('slieces['+this.currentBid+'] became : ' + this.slices.get(this.currentBid));
    this.logObj.goOut();
  },
	/**
	 * makeSlice(bid, data, mask)
	 */
	// １画面ぶんのデータをdataから切り出してSliceオブジェクトとして返す
	// 入力 : 数値 bid
	//        オブジェクト data DBからのresponse
	//        数値 mask this.nameのうち何を結果に含めるかを指定する
	//           指定方法：this.nameの添字をbitに見立てた二進から10進変換
	// 出力 : Sliceオブジェクト(Hash)
  makeSlice : function makeSlice(bid, data, mask) { // Store
    this.logObj.getInto('Store#makeSlice');
    var m = mask || 511;
    this.logObj.debug('m : ' + Object.toJSON(m));
    var target;
    var ret = new Slice(this.logObj);
    var dataNames = this.getMaskedDataName(m);
    this.logObj.debug('masked data name : ' + Object.toJSON(dataNames));
    // ほとんどの場合、あるbidの画面にはbidがそのbidのオブジェクトを集める
    dataNames.each(function(name){
      this.logObj.debug('name : ' + Object.toJSON(name));
      switch(name){
        case 'board':
          target = data['board'].find(function(e){
             return e.bid == bid;
          });
          this.logObj.debug('target : ' + Object.toJSON(target));
          this.logObj.debug('target.bid : ' + Object.toJSON(target.bid));
          this.logObj.debug('target.board : ' + Object.toJSON(target.board));
          var obj = new BoardData(this.logObj);
          this.logObj.debug('obj after initialize : ' + obj.toDelta());
          ret.set('board',    obj.fromDB(target));
          this.logObj.debug('obj after fromDB : ' + obj.toDelta());
          this.logObj.debug('ret : ' + Object.toJSON(ret));
          break;
        case 'nextMoves':
          target = $A(data['nextMoves']).findAll(function(obj){
      	         return obj.bid == bid;
      	       }.bind(this));
          this.logObj.debug('target : ' + Object.toJSON(target));
          var obj = new Moves(this.logObj);
          ret.set('nextMoves', obj.fromDB(target));
          break;
        case 'prevMoves':
          target = $A(data['prevMoves']).findAll(function(obj){
    	       return obj.nxt_bid == bid;
    	     }.bind(this));
          ret.set('prevMoves', (new Moves(this.logObj)).fromDB(target));
          break;
        default:
          this.logObj.fatal('Store#makeSlice : wrong data name arrived!');
          break;
      }
      return ret;
    }.bind(this));
    // prevMovesだけは、あるbidの画面にはnxt_bidがbidのオブジェクトを集める
    this.logObj.debug('ret : ' + Object.toJSON(ret));
    this.logObj.goOut();
    return ret; 
  },
	/**
	 * arrangeByBid()
	 */
	// 自身のデータをbidごとにアクセスしやすくするために再配置する
	// Slicesのオブジェクトthis.slicesに格納する
	// keyとしてbidの数値を指定できるようになる。その値としてsliceを持つ
	// 入力 : なし
	// 出力 : なし (this.slices の内容を変更する)
	// 結果例 : { 1 : bidが1のsliceのデータ, 
	//            2 : bidが2のsliceのデータ, 
	//                ....
	//            n : bidがnのsliceのデータ }
  arrangeByBid : function arrangeByBid(mask) { // Store
    var m = mask || 1023;
    this.logObj.getInto();
    this.logObj.debug('bids : ' + Object.toJSON(this.get('board').pluck('bid')));
    this.get('board').pluck('bid').each(function(target){
      this.logObj.debug('target bid : ' + target);
      this.makeSlice(target, m);
    }.bind(this));
    this.logObj.debug('this.slices became : ' + Object.toJSON(this.slices));
    this.logObj.goOut();
  },
	/**
	 * ask(name, bid)
	 */
	// Storeから個別のname, bidごとのデータを取得する
        // 入力 : name  データの名前 this.namesの要素のいずれか。
	//        bid   取得したいデータのbid
	// 出力 : Storeが保持しているデータ。配列で返す。
  ask : function ask(name, bid){
  },
	/**
	 * findNextMove(move)
	 */
	// 入力されたmoveがcurrentSliceのnextMovesに含まれるか調べ
	// あればそのMoveオブジェクトを返し、無ければundefinedを返す
        // 入力 : Moveオブジェクト
	// 出力 : Moveオブジェクト または false
  findNextMove : function findNextMove(move){ // Store
    this.logObj.getInto('Store#findNextMove'); 
    var ret = this.currentSlice().get('nextMoves').search(move);
    this.logObj.debug('returning : ' + Object.toJSON(ret));
    this.logObj.goOut();
    return ret;
  },
	/**
	 * fit
	 */
	// 
  fit : function fit(){
  },

  getMsg : function getMsg(bid, uid, level, mask, range, async){ // Store
    this.logObj.getInto(); 
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
        this.logObj.getInto('onSuccess_getMsg');
        this.logObj.debug('responseText : ' + Object.toJSON(response.responseText));
        var data= MessagePack.unpack(response.responseText);
        this.logObj.debug('unpacked responseText : ' + Object.toJSON(data));
        this.readDB(data, 7);
        this.logObj.goOut();
        return data;
      }.bind(this),
      onFailure : function onFailure_getData(response){
        this.logObj.getInto();
        this.logObj.debug('onFailure : ' + response.status + response.statusText);
        this.logObj.goOut();
        return false;

      }.bind(this)
    });
    var response = new Ajax.Response(request);
    this.logObj.goOut();
  },

  getQueryStr : function getQueryStr(move){ // Store
    this.logObj.getInto(); 
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
    this.logObj.debug('res : ' + res);
    this.logObj.goOut();
    return res;
  },

  registBoard : function registBoard(move){ // Store
    this.logObj.getInto(); 
    var game = window.gameController.game;
    var request = new Ajax.Request('/bid', {
         method: 'post',
         onCreate: function(request, response){
             if(request.transport.overrideMimeType){
                 request.transport.overrideMimeType("text/plain; charset=x-user-defined");
             }
         },
      parameters : this.getQueryStr(move),
      asynchronous : true,
      //asynchronous : false,
      onSuccess : function onSuccess_registBoard(response){
        this.logObj.getInto('onSuccess_registBoard');
        this.logObj.debug('responseText : ' + Object.toJSON(response.responseText));
        var data= MessagePack.unpack(response.responseText);
        this.logObj.debug('result of registBoard :<br> unpacked responseText : ' + Object.toJSON(data));
          // この出力例：
          //  {"prevMoves": [{"promote": "f", "m_to": "96", "piece": "P", "bid": "1", "mid": 5, "m_from": "97", "nxt_bid": 73630}],
// "nextMoves": [],
// "board": [{"white": "", "black": "", "bid": "1", "board": "lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxxPxSnrpxxxPBNlxpxxPxxL", "turn": "f"}]}
        this.logObj.debug('data[board] : ' + Object.toJSON(data['board']));
        this.logObj.debug('data[board][0] : ' + Object.toJSON(data['board'][0]));
        this.logObj.debug('data[board][0][bid] : ' + Object.toJSON(data['board'][0]['bid']));
        var game = window.gameController.game;
        game.new_bid = parseInt(data['board'][0]['bid']);
              // DBからの返事である、盤面のbid
        this.logObj.debug('game.new_bid : ' + game.new_bid);
        this.slices.read(game.new_bid, data);
        this.logObj.debug('slice read done : ');
        this.logObj.debug('this.slices['+game.new_bid+'] : '+Object.toJSON(this.slices.get(game.new_bid)));
        //var delta =  window.gameController.handler.makeReviewDelta(game.new_bid);
        var delta =  window.gameController.handler.makeDeltaFromSlice(game.new_bid, data);
        this.logObj.debug('delta : ' + Object.toJSON(delta));
        window.gameController.sendDelta(delta);
        this.logObj.goOut();
        return data;
      }.bind(this),
      onFailure : function onFailure_registBoard(response){
        this.logObj.getInto();
        this.logObj.debug('onFailure : ' + response.status + response.statusText);
        this.logObj.goOut();
        return false;
      }.bind(this)
    });
    var response = new Ajax.Response(request);
    this.logObj.goOut();
  },
	/**
	 * toDebugHtml()
	 */
  toDebugHtml: function toDebugHtml() { // Store
    this.logObj.getInto('Store#toDebugHtml'); 
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
      ret_slice += '<tr>'
      ret_slice += '<td>' + pair.key + '</td>';
      ret_slice += '<td>' + pair.value.toDebugHtml() + '</td>';
      ret_slice += '</tr>';
    });
    ret_slice += '</table>';
    this.logObj.goOut();
    return ret + ret_slice;
  }
});

/**
 * Area Class
 */
// それぞれのデータを表示する領域
// livepipeのwindowを使う
var Area = Class.create({

  initialize : function initialize(hand, logObj, container, title, options){
    logObj.getInto('Area#initialize');
    this.handler = hand;
    this.logObj = logObj;
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
    this.openWindow();
    this.logObj.goOut();
  },

  openWindow: function openWindow(){
    this.logObj.getInto('Area#openWindow');
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
    this.window.open();
    this.logObj.goOut();
  },
	/*
	 * show()
	 */
	// dataStoreのデータをもとに、自身のwindowに内容を表示する
  show : function show(){ // Area
    this.logObj.getInto('Area#show');
    this.logObj.debug(this.container + ' area is to be displayed.');
    var ret = '';
    var str = '<ul>';
    var movesObj = this.handler.dataStore.currentSlice().get(this.title);
    this.logObj.debug('title : ' + Object.toJSON(this.title));
    str += movesObj.inject(ret, function(acc, pair){
      var kanji = pair.value.toKanji();
      ret = acc + '<li id="' + this.container + pair.value.mid + '">' + kanji + '</li>';
      return ret;
    }.bind(this));
    str += '</ul>';
    this.logObj.debug('str : ' + str);
    this.logObj.debug('container : ' + this.window.container.id);
    this.window_contents.update(str);
    this.logObj.goOut();
  },

  display : function display_Area(target){ // Area
    this.logObj.getInto();
    this.logObj.debug(this.container + ' stand is to be displayed.');
    this.logObj.debug('target is ' + target);
    this.logObj.debug('target_store is ' + this.handler.target_store);
    var str = '';
    switch (this.container){
      case 'pres':
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
        this.logObj.debug('nxts : str -> ' + str);
        this.logObj.debug('nxts : target -> ' + target);
       	this.logObj.debug('dataStore -> ' + Object.toJSON(this.handler.dataStore));
       	this.logObj.debug('slice -> ' + Object.toJSON(this.handler.dataStore.slices));

       	if(this.handler.dataStore.slices.get(target)){
       	  this.logObj.debug('slices.get('+target+') -> ' + Object.toJSON(this.handler.dataStore.slices.get(target)));
          str = '<ul>';
	  this.logObj.debug(Object.toJSON(this.handler.dataStore.slices.get(target).get('bids')[0]['nxts']));
	   $A(this.handler.dataStore.slices.get(target).get('bids')[0]['nxts']).each(function(e){
	     str += '<li>' + e + '</li>';
	   });
	  str += '</ul>';
          this.logObj.debug('str -> ' + str);
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
    this.logObj.debug('container : ' + this.window.container.id);
    this.window_contents.update(str);
    this.window.open();
    this.logObj.goOut();
  },

  initOnClick : function initOnClick_Area(){ // Area
    this.logObj.getInto();
    this.window_contents.observe('click',
      function(evt){ 
        this.logObj.getInto('observe@Area');
        this.logObj.debug('id of clicked element : ' + evt.findElement('li').id);
        var mid = parseInt(evt.findElement('li').id.match(/\d+/)[0]);
        this.logObj.debug('mid of clicked element : ' + mid);
        this.handler.areaClicked(this.container, mid);
        this.logObj.goOut();
      }.bind(this)
    );
    this.logObj.goOut();
  },

});

//-----------------------------------------------------------------
//  controller
//-----------------------------------------------------------------
var Handler = Class.create({

  initialize : function initialize(controller) {
    this.controller = controller;
    this.logObj = this.controller.log;
    this.logObj.getInto('Handler#initialize');
    this.dataStore = new Store(this.logObj); // データをbidごとに再構成したデータの貯蔵庫
    this.logObj.debug('dataStore was created.');
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
    this.logObj.debug('areas are being initialized');
    this.prevArea = new Area(this, this.logObj,'pres', 'prevMoves',{position:[10,100], width:150, height:400});
    this.prevArea.initOnClick();
    this.nextArea = new Area(this, this.logObj,'nxts', 'nextMoves',{position:[600,100], width:150, height:400});
    this.nextArea.initOnClick();
    // dataStoreのdebug dump用のエリア
    this.dataArea = new Area(this, this.logObj,'data', 'dataStore',{position:[200,500], width:700, height:400});
    this.logObj.debug('areas were initialized');
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

    this.logObj.goOut();
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
    this.logObj.getInto();
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
      this.logObj.debug('delta : ' + Object.toJSON(delta));
    this.logObj.goOut();
    return delta;
  },
	/**
	 * makeReviewDelta(bid)
	 */
	// 入力されたbidのboard情報を取得し、sliceをdeltaに置き換える
	// 入力 : bid 数値 表示したい局面のbid
	//  ただし、これはnullでも可。そのときは画面のテキスト入力画面の値を使う
        // 出力 : 作成されたdelta オブジェクト
  makeReviewDelta: function makeReviewDelta(bid){ // Handler
    var delta = {};
    this.logObj.getInto('Handler#makeReviewDelta');
    this.logObj.debug('bid : ' + bid);
    this.logObj.debug('typeof bid : ' + typeof bid);
    var value = bid || $('inputText').value;
    //var value = bid.toString() || $('inputText').value;
    this.logObj.debug('value : ' + value);
    var slice = this.dataStore.slices.get(value);
    if(!slice){
      this.logObj.debug('was not found in slices key, so try getMsg.');
      this.logObj.debug('slices key is : ' + this.dataStore.slices.keys().join(','));
      this.dataStore.getMsg(value, 1, 3, 7, 'full', false);
      //this.dataStore.arrangeByBid(7);
      slice = this.dataStore.slices.get(value);
    }
    this.logObj.debug('slice : ' + Object.toJSON(slice));
    this.logObj.debug('slice constructor : ' + Object.toJSON(slice.constructor));
    this.logObj.debug('slice.keys : ' + (slice.keys().join(',')));
    //slice = $H(slice);
    //if(slice && !slice.constructor) slice = $H(slice);
    //this.logObj.debug('slice constructor 2 : ' + Object.toJSON(slice.constructor));
    if(slice){
      this.logObj.debug('slices[' + value + '] : ' + Object.toJSON(slice));
      this.logObj.debug('slice.keys : ' + (slice.keys().join(',')));
      slice.each(function(pair){
        this.logObj.debug('key : ' + Object.toJSON(pair.key));
        this.logObj.debug('value : ' + Object.toJSON(pair.value));
      }.bind(this));
      delta['mode']  = 'review';
      delta['bid']   = value.toString();
      delta['turn']  = (slice.get('board').turn ? 't' : 'f');
      delta['board'] = slice.get('board').toDelta();
      delta['next']  = slice.get('nextMoves').toDelta();
      delta['prev']  = slice.get('prevMoves').toDelta();
      this.logObj.debug('delta : ' + Object.toJSON(delta));
    } else {
      this.logObj.fatal('cannot get slice');
    }
    this.logObj.goOut();
    return delta;
  },


	/**
	 * refreshBoard
	 */
	// 入力されたbidのboard情報を取得し、盤面を書き換える。
	// 入力 : bid 数値 表示したい局面のbid
	//  ただし、これはnullでも可。そのときは画面のテキスト入力画面の値を使う
  refreshBoard: function refreshBoard(bid){ // Handler
    this.logObj.getInto('Handler#refreshBoard');
    this.logObj.debug('bid : ' + bid);
    var boardObj, nextMoves, prevMoves;

    if(bid) $('inputText').value = bid;
    var value = $('inputText').value;
    this.logObj.debug('value : ' + value);
    this.logObj.debug('typeof value : ' + typeof value);
    var slice = this.dataStore.slices.get(value);
    this.logObj.debug('slice['+value+'] : ' + Object.toJSON(slice));
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
      this.logObj.fatal('cannot get slice');
    }
    this.logObj.goOut();
  },

  areaClicked : function areaClicked_Handler(place, target){ // Handler
    this.logObj.getInto();
    this.logObj.debug('place -> ' + Object.toJSON(place) + ',  target -> ' + Object.toJSON(target));
    switch(place) {
      case 'nxts' :
        var bid = this.dataStore.currentSlice().get('nextMoves').get(target).nxt_bid;
        this.logObj.debug('bid found : ' + bid);
        window.gameController.sendDelta( this.makeReviewDelta(bid) );
        //this.refreshBoard(bid);
        break;
      case 'pres' :
        // これはバグのもとだな。nextMovesと異なり、prevMovesではmidが一意とはかぎらないので、これだとクリックしたmoveからbidを読んだかどうかわからない。
        var bid = this.dataStore.currentSlice().get('prevMoves').find(function(e){ return e.mid == target; }).bid;
        this.logObj.debug('bid found : ' + bid);
        window.gameController.sendDelta( this.makeReviewDelta(bid) );
        //this.refreshBoard(bid);
        break;
      default :
        break;
    }
    this.logObj.goOut();
  },

  updateData : function updateData(target, uid, range, async){
      this.logObj.getInto(); 
      this.logObj.debug('target: ' + arguments[0]);
      this.logObj.debug('uid: ' + arguments[1]);
      this.logObj.debug('range: ' + arguments[2]);
      this.logObj.debug('async: ' + arguments[3]);
      this.logObj.goOut();
      this.dataStore.getMsg(target, uid, this.gLevel, this.mask, range, async);
  },

  set_data_by_bid : function set_data_by_bid(target, responseJSON){
      var bids_ary;
      this.logObj.getInto();
      this.logObj.debug('contents of responseJSON follows:');
/*
      masked_data_name.each(function(e){
        this.logObj.debug('name : ' + e);
        if(responseJSON[e]) this.logObj.debug('responseJSON['+e+'] : ' + responseJSON[e]);
        else this.logObj.debug('responseJSON['+e+'] not exist');
      });
*/
      var data_hash = responseJSON;
      //var data_hash = $H();
      this.age += 1;
      this.logObj.debug('responseJSONをハッシュdata_hashに格納する');
      // DBから文字列としてうけたものを、JSONオブジェクトとして評価する
/*
      masked_data_name.each(function(e){
	data_hash.set(e, responseJSON[e]);
      });
*/
      this.logObj.debug('data_hash をJSONオブジェクトとして表示してみる');
      this.logObj.debug(Object.toJSON(data_hash), 3);
      this.logObj.debug('データをbidごとに再構成する');
      this.logObj.debug('まずdata_hash[bids]からbidを抽出する');
//      this.logObj.debug('data_hash[bids]は文字列で、カンマ区切りのオブジェクトの配列という形。');
//      this.logObj.debug('したがって、まずsplitし、個々の要素をevalすればobjectの配列となる。');
/*
      try {
        bids_ary = eval(data_hash.get('bids'));
        this.logObj.debug('data_hash[bids] size : ' + bids_ary.size());
      }
      catch (exception){
        alert(exception);
      }
      bids_ary.each(function(e){
        this.logObj.debug(e);
      });
      this.logObj.debug('eval bids_ary[0] : ' + Object.toJSON(eval(bids_ary[0])));
      this.logObj.debug('bids_ary -> ' + Object.toJSON(bids_ary));
*/
      //bids_ary = bids_ary.map(function(e){ return eval(e); }).pluck('bid');
      bids_ary = data_hash['bids'].pluck('bid');
      this.logObj.debug('bids_ary -> ' + Object.toJSON(bids_ary));
        // そのbidごとに、data_hashから抽出したハッシュを登録する
      bids_ary.each(function(bid){
        this.logObj.debug('bid : ' + bid);
        data_by_bid.set(bid, extract_from_data_hash_by_bid(bid, data_hash));
        this.logObj.debug('data_by_bid -> ' + Object.toJSON(data_by_bid));
        // ageも追加
        age_hash.set(bid, this.age);
      });
      // 再構成したデータのtargetぶんを表示してみる。
      this.logObj.debug('updateData : target -> ' + Object.toJSON(target), 3);
      this.logObj.debug('updateData : data_by_bid.get[target] -> ' + Object.toJSON(data_by_bid.get(target)), 3);
      // age_hash を表示
      this.logObj.debug('updateData : age_hash -> ' + Object.toJSON(age_hash), 3);
      // garbage collect
      var ages = age_hash.values().sortBy(function(e){ return parseInt(e); }).uniq();
      this.logObj.debug('updateData : ages -> ' + Object.toJSON(ages), 3);
      while(ages.size() > gLevel*2 ){
        age_hash.findAll(function(e){ return e[1] == ages[0]; }).each(function(b){
          data_by_bid.unset(b.key);
          age_hash.unset(b.key);
        });
        ages.shift();
      } 
      this.logObj.debug('updateData : ages after gc -> ' + Object.toJSON(ages), 3);
      this.logObj.debug('updateData : age_hash after gc -> ' + Object.toJSON(age_hash), 3);
      this.logObj.goOut();
  },
  
  updateDisplay : function updateDisplay(target){ // Handler
    this.logObj.getInto();
    this.prevArea.display(target);
    this.selfArea.display(target);
    this.dataArea.display(target);
    this.nextArea.display(target);
    $('size').update(this.dataStore.slices.size());
    this.logObj.debug('size was updated.');
    var ages = this.age_hash.values().sort().uniq();
    this.logObj.debug('ages : ' + Object.toJSON(ages));
    var bids_per_age = $H();
    ages.each(function(age){
      bids_per_age.set(age, age_hash.findAll(function(e){ return e[1] == age; }));
    });
    var agestr = bids_per_age.inject('',function(str, e){
       str += (e.key + ':' + e.value.size() + ':'+ e.value.invoke("first").sortBy(function(e){return parseInt(e);}).join(",") + '<br>');
       return str;
    });
    $('age').update(agestr);
    this.logObj.goOut();
  },

  cs_gc : function cs_garbageCollect(){
    this.logObj.getInto();
    this.logObj.debug('values : ' + Object.toJSON(cs.values()),3); 
    var minCycle = cs.values().map(function(e){ return e[2]; }).min();
    this.logObj.debug('minCycle : ' + minCycle);
    cs.each(function(pair){
      //this.logObj.debug('pair : ' + Object.toJSON(pair),3);
      if ( pair.value[2] <= minCycle + 2 ) cs.unset(pair.key);
    });
    this.logObj.goOut();
  }
});

var DbAccessor = Class.create({

   // 入力 : bid, uid, range, async
   //   range : 
   //        
   // 出力 : levelまでの深さのbids配列に対応するデータ
   //   例 : level = 0  とは自分だけを指すので{ bid : [[n0, n1, ..],[p0, p1, ..] }
   //        level = 1  のとき、bidのnxtBidsも展開する
   //             { bid : [[n0, n1, ..],[p0, p1, ..]]
   //                n0 : [[m0, m1, ..],[j0, j1, ..]]
   //		     n1 : [[l0, l1, ..],[i0, i1, ..]]
   //		     ...
   //                p0 : [[x0, x1, ..],[y0, y1, ..]]
   //                ...
   //		  }
   //        以下、levelがひとつ増えるごとに、展開が一段階増える	

  getData : function getData(bid, uid, range, async){
     logObj.getInto(); 
     var request = new Ajax.Request('/getData', {
       method : 'post',
       parameters : { 'bid' : bid , 'uid' :uid, 'level' : gLevel, 'mask' : gMask, 'range' : range },
       asynchronous : async,
       onSuccess : function onSuccess_getData(response){
         logObj.getInto('onSuccess_getData');
//         logObj.debug(arguments);
//         logObj.debug(Object.toJSON(response.responseJSON));
         hand.set_data_by_bid(bid,response.responseJSON);
	 logObj.goOut();
	 return;
       },
       onFailure : function onFailure_getData(response){
         logObj.getInto();
         logObj.debug('onFailure : ' + response.status + response.statusText, 3);
         logObj.goOut();
         return false;
       }
     });
     var response = new Ajax.Response(request);
     logObj.goOut();
   },

   getBids : function getBids(bid, uid, range, async){
     logObj.getInto(); 
     var request = new Ajax.Request('/getBids', {
          method: 'get',
          onCreate: function(request, response){
              if(request.transport.overrideMimeType){
                  request.transport.overrideMimeType("text/plain; charset=x-user-defined");
              }
          },
       parameters : { 'bid' : bid , 'uid' :uid, 'level' : gLevel, 'mask' : gMask, 'range' : range },
       asynchronous : async,
       onSuccess : function onSuccess_getBids(response){
         logObj.getInto('onSuccess_getBids');
         logObj.debug('responseText : ' + Object.toJSON(response.responseText));
         var data = MessagePack.unpack(response.responseText);
         logObj.debug('unpacked responseText : ' + Object.toJSON(data));
         $('bids').update(Object.toJSON(data));
	 logObj.goOut();
	 return;
       },
       onFailure : function onFailure_getData(response){
         logObj.getInto();
         logObj.debug('onFailure : ' + response.status + response.statusText, 3);
         logObj.goOut();
         return false;
       }
     });
     var response = new Ajax.Response(request);
     logObj.goOut();
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
  logObj.getInto();
  var ret_hash = $H();
  $H(data_hash).each(function(pair){
    logObj.debug('key : ' + Object.toJSON(pair.key));
    logObj.debug('value : ' + Object.toJSON(pair.value));
    var v =  pair.value.findAll(function(obj){
	       return obj.bid == target;
	     });
    logObj.debug('v : ' + Object.toJSON(v));
    ret_hash.set(pair.key,v);
  });
  logObj.debug('ret_hash : ' + Object.toJSON(ret_hash));
  logObj.goOut();
  return ret_hash;
}

/*
function init(){
  logObj = makeLogObj('Log', {width:800, height:550, resizable:false});
  $('logger0').insert(new Element('img', {id:'handle0', src:"img/lib/window_close.gif"}));
  new Resizable('logger0',{handle:'handle0'});

  logObj.debug('creating masked_data_name.');
  for(var index=0; index < 10; index++){
    if ((mask & (1 << index)) > 0) masked_data_name.push(data_name[index]);
  }
  logObj.debug('masked_data_name -> ' + Object.toJSON(masked_data_name));
  hand = new Handler(logObj);
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
  logObj.debug('prevArea was displayed');
  nextArea.display('1');
  logObj.debug('nextArea was displayed');
  selfArea.display('1');
  logObj.debug('selfArea was displayed');
  dataArea.display('1');
  logObj.debug('dataArea was displayed');
}
*/
