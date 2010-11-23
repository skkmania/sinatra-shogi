//  area.js
//   2010/11/10
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
    LOG.debug('movesObj : ' + movesObj.toDebugString());
    LOG.debug('title : ' + JSON.stringify(this.title));
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
