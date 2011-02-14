// bookmark.js
// 2011/02/14
//   Boardを画像にして小さなwindowに表示する
//

var Bookmark = Class.create({
  initialize : function initialize(board) {
    LOG.getInto('Bookmark#initialize');
    this.controller = window.gameController;
    this.board = board;
    this.bid = board.bid;
    this.canvasId = 'cv' + this.bid;
    this.initArea();
    LOG.goOut();
  },
	/**
	 * initArea()
	 */
  initArea: function initArea() { // Bookmark              
    LOG.getInto('Bookmark#initArea');
    this.options = { 
              container:document,
              title:	this.bid,
              width:	300,
              height:	300 };
    this.name = new Element('div',{ contenteditable:'true' });
    this.name.textContent = 'new bookmark';
    this.canvas = new Element('canvas',{ id:this.canvasId, width:'250px',height:'250px' });
    this.linkToComments = new Element('div',{class:'bmComments'});
    this.area = new Area(this.options);
    this.area.window_contents.insert(this.name);
    this.area.window_contents.insert(this.canvas);
    this.area.window_contents.insert(this.linkToComments);
    this.area.window.open();
    var imgData = this.board.toPNG($(this.canvasId));
/*
これの扱いは要検討
    this.imgDiv = new Element('img');
    this.imgDiv.src = imgData;
    this.area.window_contents.insert(this.imgDiv);
*/
    LOG.goOut();
  }, 
	/**
	 * showState()
	 */
  showState: function showState() { // Bookmark              
    LOG.getInto('Bookmark#showState');
    $('showState').update(wave.getState().toDebugHtml());
    LOG.goOut();
  } 
});
