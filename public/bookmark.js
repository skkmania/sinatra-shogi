// bookmark.js
// 2011/02/14
//   Boardを画像にして小さなwindowに表示する
//

var Bookmark = Class.create({
  initialize : function initialize() {
    LOG.getInto('Bookmark#initialize');
    LOG.goOut();
    return this;
  },
	/**
	 * fromObj(obj)
	 */
  fromObj: function fromObj(obj) { // Bookmark              
    this.bid = obj.bid;
    this.size = obj.size;
    this.name = new Element('div',{ contenteditable:'true' });
    this.name.textContent = obj.name;
    this.imgData = obj.img;
    this.initArea();
    return this;
  },
	/**
	 * fromBoard(board)
	 */
  fromBoard: function fromBoard(board) { // Bookmark              
    this.board = board;
    this.bid = board.bid;
    this.canvasId = 'cv' + this.bid;
    this.imgData = this.board.toPNG(this.canvasId, this.size);
    this.name = new Element('div',{ id: this.bid + 'bkmkName',
                                    contenteditable: "true"  });
    this.name.value = 'new bookmark';
    this.initArea();
    return this;
  },
	/**
	 * initArea()
	 */
  initArea: function initArea() { // Bookmark              
    LOG.getInto('Bookmark#initArea');
    this.size = window.gameController ? window.gameController.options.bkmkSize : 20;
    this.options = { 
              container:document,
              title:	this.bid,
              width:	this.size*13,
              height:	this.size*12 };

    this.toMainButton = new Element('div', { className:'toMain', title:'toMain' });
    this.toMainButton.observe('click', this.toMain.bind(this));

    this.saveButton = new Element('div', { className:'save', title:'save' });
    this.saveButton.observe('click', this.save.bind(this));

    this.resizable_handle = new Element('div', { className:'bkmk_resizable', title:'resize' });
    this.options.resizable = this.resizable_handle;

    this.imgDiv = new Element('img');
    this.imgDiv.src = this.imgData;

    this.linkToComments = new Element('div',{className:'bmComments'});

    this.area = new Area(this.options);
    this.area.window_title.insert(this.saveButton);
    this.area.window_title.insert(this.toMainButton);
    this.area.window_title.addClassName('bookmark_title');
    this.area.window_contents.insert(this.name);
    this.area.window_contents.insert(this.imgDiv);
    this.area.window_contents.insert(this.linkToComments);
    this.area.window_contents.insert(this.resizable_handle);
    this.area.window.open();
    LOG.goOut();
  }, 
	/**
	 * toMain()
	 */
  toMain: function toMain() { // Bookmark              
    LOG.getInto('Bookmark#toMain');
    window.gameController.game.board.makeBookmark();
    window.gameController.jumpButtonPressed(this.bid);
    LOG.goOut();
  }, 
	/**
	 * save()
	 */
  save: function save() { // Bookmark              
    LOG.getInto('Bookmark#save');
    if(!this.imgData) {
      this.imgData = this.board.toPNG($(this.canvasId),this.size);
    }
    bookMarks.addEntry(this);
    LOG.goOut();
  } 
});

(function(global){
  function BookMarks() {
    this.initialize();
  }
  BookMarks.prototype = {
    initialize: function() {
      if (!localStorage.bookmarks) {
        localStorage.bookmarks = JSON.stringify({});
      }
      this.storage = JSON.parse(localStorage.bookmarks);
      this.name = 'bookmarks';
      this.initArea();
      this.loadLocal();
    },
	/**
	 * initArea()
	 */
    initArea: function() { // BookMarks              
      this.area = areas[this.name];

      this.saveButton = new Element('div', { className:'save', title:'save' });
      this.saveButton.observe('click', this.saveLocal.bind(this));
      this.area.window_title.insert(this.saveButton);

      this.resizable_handle = areaSettings['bookmarks']['resizable'];

      this.area.window_contents.insert(this.resizable_handle);
      this.area.window.open();
    }, 
	/**
	 * loadLocal()
	 */
    loadLocal: function() { // BookMarks              
      for (bid in this.storage) {
        if (this.storage[bid]) {
          this.addEntry(new Bookmark().fromObj(this.storage[bid]));
        }
      }
    },
	/**
	 * saveLocal()
	 */
    saveLocal: function() { // BookMarks              
      localStorage.bookmarks = JSON.stringify(this.storage);
    },
	/**
	 * mkDeleteButton(bm)
	 */
	// 入力: bm Bookmarkオブジェクト
    mkDeleteButton: function(bm) { // BookMarks              
      var ret = new Element('div', { className: 'deleteBkmkButton' });
      ret.observe('click', this.deleteEntry.bind(this, bm));
      return ret;
    },
	/**
	 * putLine(bm)
	 */
	// 入力: bm Bookmarkオブジェクト
    putLine: function(bm) { // BookMarks              
      var entry = new Element('div', { id: bm.bid + 'bkmk',
                                       className: 'bkmkEntry' });
      entry.insert(this.mkDeleteButton(bm));
      entry.insert(bm.area.anchor);
      var nameDiv = new Element('div');
      nameDiv.id = bm.bid + 'bkmksName';
      nameDiv.textContent = bm.name.textContent;
      entry.insert(nameDiv);
      this.area.window_contents.insert({ top:entry });
    },
	/**
	 * addEntry(bm)
	 */
	// 入力: bm Bookmarkオブジェクト
    addEntry: function(bm) { // BookMarks
      if (this.storage[bm.bid]){
        // 既存の場合
        this.storage[bm.bid].name = bm.name.textContent;
        var target = $(bm.bid + 'bkmksName');
        if (target) {
          target.update(bm.name.textContent);
        } else {
          // storageには存在するが、entryにはない場合
          this.putLine(bm);
        }
      } else {
        // 新規の場合
        this.storage[bm.bid] = { name: bm.name.textContent,
                                  bid: bm.bid,
                                 size: bm.size,
                                  img: bm.imgData };
        this.putLine(bm);
      }
    },
	/**
	 * deleteEntry(bm)
	 */
	// 入力: bm Bookmarkオブジェクト
    deleteEntry: function(bm) { // BookMarks              
      delete this.storage[bm.bid];
      $(bm.bid+'bkmk').remove();
    }
  };
  global.bookMarks = new BookMarks();
})(window);
