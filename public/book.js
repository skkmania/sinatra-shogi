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
    this.book = [];
    this.kid = null;
       // Moveオブジェクトの配列

    this.log.goOut();
  },
	/*
	 * showInputBox()
	 */
  showInputBox: function showInputBox(){
    this.log.getInto('Book#showInputBox');
    var textarea = new Element('textarea',{ id:this.textAreaId, cols:20, rows:20,className:'book' });
    var button = new Element('input',{ id:'bookBack', type:'button', value:'post',className:'book' });
    button.observe('click', function(){
      if(this.legalCheck()){
        this.postBook();
      } else {
      }
      return false;
    }.bind(this));
    this.area.window_contents.appendChild(button);
    this.area.window_contents.appendChild(textarea);
    this.log.goOut();
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
    var bookText = $(this.textAreaId).value;
    var ret = true;
    this.log.debug('returning : ' + ret);
    this.log.goOut();
    return ret;
  },
	/*
	 * readDB
	 */
	// DBからのresponseTextをmoveの配列として読む
	// それは、自身のbookプロパティとして参照する。
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
    this.book = ret;
    this.log.debug('returning : ' + ret.invoke('toDelta').join(':'));
    this.log.goOut();
    return ret;
  },
	/*
	 * showBookForm
	 */
	// showBookのためのformをAreaに表示する
	// 入力 なし
	// 出力 なし
  showBookForm : function showBookForm(){ // Book
    this.log.getInto(); 
    //var form = new Element('form',{ id:'getBookForm' });
    var label  = Builder.node('label',{ htmlFor:'kidInput', className:'book' }, 'kid');
    var input   = new Element('input',{ id:'kidInput', type:'text', size: 8, className:'book' });
    var button = new Element('input',{ id:'kidInput', type:'button', value:'get',className:'book' });
    button.observe('click', function(){
      var v = parseInt($('kidInput').value);
      // alert('button clicked' + v);
      this.getBook(v);
      this.showBook();
      this.showBackButton();
      return false;
    }.bind(this));
    //this.log.debug('input created : ' + form.className);
    this.area.window_contents.appendChild(label);
/*
    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(button);
*/
    //this.area.window_contents.appendChild(form);
    this.area.window_contents.appendChild(input);
    this.area.window_contents.appendChild(button);
    this.log.goOut();
  },
	/*
	 * showBackButton
	 */
	// showBookのためのformをAreaに表示する
	// 入力 なし
	// 出力 なし
  showBackButton : function showBackButton(){ // Book
    this.log.getInto(); 
    var button = new Element('input',{ id:'bookBack', type:'button', value:'back',className:'book' });
    button.observe('click', function(){
      this.showBookForm();
      this.showInputBox();
      return false;
    }.bind(this));
    this.area.window_contents.appendChild(button);
    this.log.goOut();
  },
	/*
	 * showBook
	 */
	// this.bookの内容をAreaに表示する
	// 個々の手はそのbidの局面へのリンクアンカーとする
	// 入力 数値 foundCnt 既存の手の手数
	// 出力 なし
  showBook : function showBook(foundCnt){ // Book
    this.log.getInto(); 
    var ul = new Element('ul',{ className:'book',listStyleType:'decimal' });
    this.log.debug('ul created : ' + ul.className);
    this.book.each(function(m, idx){
      this.log.debug('idx : ' + idx + ', m : ' + m.toDelta());
      var cn = 'book';
      if(foundCnt && idx <= foundCnt) cn += ' found';
      var elm = new Element('li',{ className: cn });
      elm.innerHTML = m.toKanji();
      ul.appendChild(elm);
    }.bind(this));
    $(this.area.window_contents).update(ul);
    this.area.window_contents.appendChild(this.backButton);
    this.log.goOut();
  },
	/*
	 * getBook
	 */
	// サーバにkifの内容をAjaxで問い合わせる
	// 入力 数値 kidの値
	// 出力 なし
	//   だが、ajaxのresponsが帰ってきたらthis.bookに値を格納する
  getBook : function getBook(arg_kid){ // Book
    this.log.getInto('Book#getBook'); 
    this.log.debug('kid : ' + arg_kid);
    this.kid = arg_kid;
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
        var data= msgpack.unpack(response.responseText);
        this.log.debug('result of getBook :<br> unpacked responseText : ' + Object.toJSON(data));
        this.readDB(data);
        this.log.debug('response read done : ');
        this.log.goOut();
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
  },
	/*
	 * postBook
	 */
	// getBookとの違い : 何手目までが既存手であったかをserverから教えてもらっている
  postBook : function postBook(){ // Book
    this.log.getInto('Book#postBook'); 
    var bookText = $(this.textAreaId).value;
    var request = new Ajax.Request('/book', {
         method: 'post',
         onCreate: function(request, response){
             if(request.transport.overrideMimeType){
                 request.transport.overrideMimeType("text/plain; charset=x-user-defined");
             }
         },
      parameters : { text: bookText },
      asynchronous : true,
      onSuccess : function onSuccess_postBook(response){
        this.log.getInto('Book#onSuccess_postBook');
        this.log.debug('responseText : ' + Object.toJSON(response.responseText));
        var data= msgpack.unpack(response.responseText);
        this.log.debug('result of postBook :<br> unpacked responseText : ' + Object.toJSON(data));
        this.readDB(data);
        this.showBook(data.foundCnt);
        this.showBackButton();
        this.log.debug('slice read done : ');
        this.log.goOut();
        return data;
      }.bind(this),
      onFailure : function onFailure_postBook(response){
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
