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
    var size = this.controller.options.bkmkSize || 20;
    this.options = { 
              container:document,
              title:	this.bid,
              width:	size*13,
              height:	size*12 };

    this.toMainButton = new Element('div', { className:'toMain' });
    this.toMainButton.observe('click', this.toMain.bind(this));

    this.name = new Element('div',{ contenteditable:'true' });
    this.name.textContent = 'new bookmark';

    this.canvas = new Element('canvas',{ id:this.canvasId,
                                      width:size*12 + 'px',
                                     height:size*10 + 'px' });

    this.linkToComments = new Element('div',{className:'bmComments'});

    this.area = new Area(this.options);
    this.area.window_title.insert(this.toMainButton);
    this.area.window_title.addClassName('bookmark_title');
    this.area.window_contents.insert(this.name);
    this.area.window_contents.insert(this.canvas);
    this.area.window_contents.insert(this.linkToComments);
    this.area.window.open();
    var imgData = this.board.toPNG($(this.canvasId),size);
/*
これの扱いは要検討
    this.imgDiv = new Element('img');
    this.imgDiv.src = imgData;
    this.area.window_contents.insert(this.imgDiv);
*/
    LOG.goOut();
  }, 
	/**
	 * toMain()
	 */
  toMain: function toMain() { // Bookmark              
    LOG.getInto('Bookmark#toMain');
    this.board.makeBookmark();
    this.controller.jumpButtonPressed(this.bid);
    LOG.goOut();
  } 
});
