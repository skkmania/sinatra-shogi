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
    this.LOG     = LOG;
    this.textAreaId  = id;
    LOG.getInto('Book#initialize');
    this.book = [];
    this.kid = null;
       // Moveオブジェクトの配列

    LOG.goOut();
  },
	/*
	 * initArea()
	 */
  initArea: function initArea(){
    LOG.getInto('Book#initArea');
    // 棋譜読み込み用のエリア
//    this.area = new Area(this, 'readBook', 'ReadBook',{position:[850,580], width:200, height:380});
//    this.area.initOnClick();
    LOG.goOut();
  },
	/*
	 * showInputBox()
	 */
  showInputBox: function showInputBox(){
    LOG.getInto('Book#showInputBox');
    var textarea = new Element('textarea',{ id:this.textAreaId, cols:20, rows:20,className:'book' });
    var button = new Element('input',{ id:'bookBack', type:'button', value:'post',className:'book' });
    button.observe('click', function(){
      this.writtenContent = textarea.value;
      this.LOG.debug('content: ' + this.writtenContent);
      if(this.legalCheck()){
        this.postBook();
      } else {
        this.showError();
      }
      return false;
    }.bind(this));
    this.area.window_contents.appendChild(button);
    this.area.window_contents.appendChild(textarea);
    LOG.goOut();
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
    LOG.getInto('Book#legalCheck');
    //var bookText = $(this.textAreaId).value;
    //LOG.debug('written content: ' + bookText);
    var ret = true;
    LOG.debug('returning : ' + ret);
    LOG.goOut();
    return ret;
  },
	/*
	 * showError()
	 */
	// 機能：this.kifがルールに則っていないときにエラーを表示する
	// 入力 : なし
	// 出力 : なし
  showError: function showError(){ // Book
    LOG.getInto('Book#showError');
    $(this.textAreaId).value = 'Error!';
    LOG.goOut();
  },
	/*
	 * readDB
	 */
	// DBからのresponseTextを解釈してメタデータとmoveの配列として読む
	// それは、自身のbookプロパティとして参照する。
	// 入力 配列 要素はjsのオブジェクトひとつだけ
        //    key : value
        //    kid : 数値
        //    tesu:
        //    result:
        //    black:
        //    white:
        //    gdate
        //    kif: 文字列 指し手を:区切りで並べてある。
	//    順序は棋譜の手数順である。
	//     例 : "1,0,77,76,P,f,2:2,0,33,34,p,f,3:3,0,27,26,P,f,4:4,0,41,32,g,f,5:5,0,69,78,G,f,6"
	// 出力 配列 moveオブジェクトの配列
  readDB : function readDB(ary){ // Book
    LOG.getInto('Book#readDB'); 
    Object.extend(this, ary[0]);
    this.moves = this.kif.split(':').map(function(e){
      return new Move().fromRecord(e.split(','));
    }.bind(this));
    LOG.debug('returning : ' + this.moves.invoke('toDelta').join(':'));
    LOG.goOut();
    return this.moves;
  },
	/*
	 * readDB_old
	 */
        // 2010.10.14 仕様変更への対応
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
  readDB_old : function readDB_old(ary){ // Book
    LOG.getInto('Book#readDB'); 
    var ret = ary.map(function(e){
      return new Move().fromObj(e);
    }.bind(this));
    this.book = ret;
    LOG.debug('returning : ' + ret.invoke('toDelta').join(':'));
    LOG.goOut();
    return ret;
  },
	/*
	 * showBookForm
	 */
	// showBookのためのformをAreaに表示する
	// 入力 なし
	// 出力 なし
  showBookForm : function showBookForm(){ // Book
    LOG.getInto(); 
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
    //LOG.debug('input created : ' + form.className);
    this.area.window_contents.appendChild(label);
/*
    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(button);
*/
    //this.area.window_contents.appendChild(form);
    this.area.window_contents.appendChild(input);
    this.area.window_contents.appendChild(button);
    LOG.goOut();
  },
	/*
	 * showBackButton
	 */
	// showBookのためのformをAreaに表示する
	// 入力 なし
	// 出力 なし
  showBackButton : function showBackButton(){ // Book
    LOG.getInto(); 
    var button = new Element('input',{ id:'bookBack', type:'button', value:'back',className:'book' });
    button.observe('click', function(){
      this.showBookForm();
      this.showInputBox();
      return false;
    }.bind(this));
    this.area.window_contents.appendChild(button);
    LOG.goOut();
  },
	/*
	 * showBook
	 */
	// this.bookの内容をAreaに表示する
	// 個々の手はそのbidの局面へのリンクアンカーとする
	// 入力 数値 foundCnt 既存の手の手数
	// 出力 なし
  showBook : function showBook(foundCnt){ // Book
    LOG.getInto("Book#showBook"); 
    var ul = new Element('ul',{ className:'book',listStyleType:'decimal' });
    LOG.debug('ul created : ' + ul.className);
    // add metadata
    $w('kid gdate black white tesu result').each(function(e){
      var elm = new Element('li', { className: "metabookdata" }); 
      elm.innerHTML = this[e];
      ul.appendChild(elm);
    }.bind(this));
    // add moves 
    LOG.debug('moves size : ' + this.moves.size());
    this.moves.each(function(m, idx){
      this.LOG.debug('idx : ' + idx + ', m : ' + m.toDelta());
      var cn = 'book';
      if(foundCnt && idx <= foundCnt) cn += ' found';
      var elm = new Element('li',{ id: 'km_'+m.nxt_bid, className: cn });
      elm.innerHTML = m.toKanji();
      ul.appendChild(elm);
    }.bind(this));
    $(this.area.window_contents).update(ul);
    this.area.window_contents.appendChild(this.backButton);
    LOG.goOut();
  },
	/*
	 * getBook
	 */
	// サーバにkifの内容をAjaxで問い合わせる
	// 入力 数値 kidの値
	// 出力 なし
	//   だが、ajaxのresponsが帰ってきたらthis.bookに値を格納する
  getBook : function getBook(arg_kid){ // Book
    LOG.getInto('Book#getBook'); 
    LOG.debug('kid : ' + arg_kid);
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
        this.LOG.getInto('Book#onSuccess_getBook');
        var data= msgpack.unpack(response.responseText);
        this.LOG.debug('result of getBook :<br> unpacked responseText : ' + JSON.stringify(data));
        this.readDB(data);
        this.LOG.debug('response read done : ');
        this.LOG.goOut();
      }.bind(this),
      onFailure : function onFailure_getBook(response){
        this.LOG.getInto();
        this.LOG.debug('onFailure : ' + response.status + response.statusText);
        this.LOG.goOut();
        return false;
      }.bind(this)
    });
    var response = new Ajax.Response(request);
    LOG.goOut();
  },
	/*
	 * postBook
	 */
	// getBookとの違い : 何手目までが既存手であったかをserverから教えてもらっている
  postBook : function postBook(){ // Book
    LOG.getInto('Book#postBook'); 
    //var bookText = $(this.textAreaId).value;
    var request = new Ajax.Request('/book', {
         method: 'post',
         onCreate: function(request, response){
             if(request.transport.overrideMimeType){
                 request.transport.overrideMimeType("text/plain; charset=x-user-defined");
             }
         },
      parameters : { text: this.writtenContent },
      //parameters : { text: bookText },
      asynchronous : true,
      onSuccess : function onSuccess_postBook(response){
        this.LOG.getInto('Book#onSuccess_postBook');
        this.LOG.debug('responseText : ' + Object.toJSON(response.responseText));
        var data= msgpack.unpack(response.responseText);
        this.LOG.debug('result of postBook :<br> unpacked responseText : ' + Object.toJSON(data));
        this.readDB(data);
        this.showBook(data.foundCnt);
        this.showBackButton();
        this.LOG.debug('slice read done : ');
        this.LOG.goOut();
        return data;
      }.bind(this),
      onFailure : function onFailure_postBook(response){
        this.LOG.getInto();
        this.LOG.debug('onFailure : ' + response.status + response.statusText);
        this.LOG.goOut();
        return false;
      }.bind(this)
    });
    var response = new Ajax.Response(request);
    LOG.goOut();
  },

  toDebugString: function toDebugString(){
    return '';
  }
});
