//  book.js
//   2010/06/25

// 棋譜を管理するクラス

var Book = Class.create({
//  
	/*
	 * initialize(handler)
	 */
  initialize: function initialize(handler, id){
    this.handler = handler;
    this.log     = handler.logObj;
    this.area    = handler.readBookArea;
    this.textAreaId  = id;
    this.log.getInto('Book#initialize');

    this.log.goOut();
  },
	/*
	 * showInputBox()
	 */
  showInputBox: function showInputBox(){
    this.log.getInto('Book#showInputBox');
    var str = 
   '<div id="kifRead">\
     <p id="krTitle">copy kif below</p>\
     <form method="POST" id="kifReadForm" action="">\
       <textarea name="kifText" cols="20" rows="20" id="';
    str += this.textAreaId + '"></textarea>\
         <input type="submit" name="submit" value="post" />\
         <input type="reset" name="reset" value="reset" />\
         <input type="range" name="range0" value="0" />\
     </form>\
   </div>';
    this.area.window_contents.update(str);
    this.log.goOut();
  },
	/*
	 * readInputBox()
	 */
  readInputBox: function readInputBox(){
    this.log.getInto('Book#readInputBox');
    this.kif = $(this.textAreaId).value;
    this.log.debug('read input box : ' + this.kif);
    this.log.goOut();
    return this.kif;
  },
	/*
	 * legalCheck()
	 */
	// 機能：this.kifがルールに則っているか調べ
	//        則っている範囲内の手の羅列である文字列を返す
	// 入力 : なし
	// 出力 : 文字列 pure moveを並べた文字列。長さは6 * 手数となる
	// 出力例 : 7776Pf3334pf2726Pf8384pf8822Bt
  legalCheck: function legalCheck(){ // Book
    this.log.getInto('Book#legalCheck');
    this.kif = $(this.textAreaId).value;
    var ret = false;
    this.log.debug('returning : ' + ret);
    this.log.goOut();
    return ret;
  },
	/*
	 * readDB
	 */
	// DBからのresponseTextをmoveの配列として読む
	// 入力 配列 要素はmoveを意味するjsのオブジェクト DBからのレスポンス
	//    順序は棋譜の手数順である。DBのselectでそう並べているので。
	//     例 : 
	//  [{"promote":false, "m_to":76, "bid":1, "piece":"P",
	//    "m_from":77, "mid":0, "cnt":1, "nxt_bid":2},
	//   {"promote":false, "m_to":34, "bid":2, "piece":"p",
	//    "m_from":33, "mid":0, "cnt":2, "nxt_bid":3},
	//   {"promote":false, "m_to":26, "bid":3, "piece":"P",
	//    "m_from":27, "mid":0, "cnt":3, "nxt_bid":4}]
	// 出力 配列 moveオブジェクトの配列
  readDB : function readDB(ary){ // Book
    this.log.getInto('Book#readDB'); 
    var ret = ary.map(function(e){
      return new Move(this.log).fromObj(e);
    }.bind(this));
    this.log.debug('returning : ' + ret.invoke('toDelta').join(':'));
    this.log.goOut();
    return ret;
  },
	/*
	 * getBook
	 */
  getBook : function getBook(arg_kid){ // Book
    this.log.getInto(); 
    var request = new Ajax.Request('/book', {
         method: 'get',
         onCreate: function(request, response){
             if(request.transport.overrideMimeType){
                 request.transport.overrideMimeType("text/plain; charset=x-user-defined");
             }
         },
      parameters : { kid : arg_kid },
      asynchronous : false,
      onSuccess : function onSuccess_getBook(response){
        this.log.getInto('Book#onSuccess_getBook');
        var data= MessagePack.unpack(response.responseText);
        this.log.debug('result of getBook :<br> unpacked responseText : ' + Object.toJSON(data));
          // この出力例：
              // DBからの返事である、盤面のbid
        var ret = this.readDB(data);
        this.log.debug('response read done : ');
        this.log.goOut();
        return ret;
      }.bind(this),
      onFailure : function onFailure_getBook(response){
        this.log.getInto();
        this.log.debug('onFailure : ' + response.status + response.statusText);
        this.log.goOut();
        return false;
      }.bind(this)
    });
    var response = new Ajax.Response(request);
    this.log.goOut();
    return response;
  },
	/*
	 * regist
	 */
  regist : function regist(move){ // Book
    this.log.getInto(); 
    var game = window.gameController.game;
    var request = new Ajax.Request('/book', {
         method: 'post',
         onCreate: function(request, response){
             if(request.transport.overrideMimeType){
                 request.transport.overrideMimeType("text/plain; charset=x-user-defined");
             }
         },
      parameters : this.getQueryStr(),
      asynchronous : true,
      onSuccess : function onSuccess_regist(response){
        this.log.getInto('Book#onSuccess_regist');
        this.log.debug('responseText : ' + Object.toJSON(response.responseText));
        var data= MessagePack.unpack(response.responseText);
        this.log.debug('result of regist :<br> unpacked responseText : ' + Object.toJSON(data));
          // この出力例：
        window.gameController.game.new_bid = parseInt(data['board'][0]['bid']);
              // DBからの返事である、盤面のbid
        this.readDB(data, 7);
        this.log.debug('slice read done : ');
//        this.log.debug('this.slices['+game.new_bid+'] : '+Object.toJSON(this.slices.get(game.new_bid)));
        //var delta =  window.gameController.handler.makeReviewDelta(game.new_bid);
        this.log.goOut();
        return data;
      }.bind(this),
      onFailure : function onFailure_regist(response){
        this.log.getInto();
        this.log.debug('onFailure : ' + response.status + response.statusText);
        this.log.goOut();
        return false;
      }.bind(this)
    });
    var response = new Ajax.Response(request);
    this.log.goOut();
  },

  toDebugString: function toDebugString(){
    return '';
  }
});
