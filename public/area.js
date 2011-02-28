//  area.js
//   2010/11/10
/**
 * Area Class
 */
// それぞれのデータを表示する領域
// livepipeのwindowを使う
var Area = Class.create({

  initialize : function initialize(options){
    LOG.getInto('Area#initialize');
    this.LOG = LOG;
    this.notInited = true;  // 対応するオブジェクトがinitAreaの中でfalseにする
      // 複数のオブジェクトが同じエリアを使いまわすときに役立てるフラグ
    this.container = options.container;
    this.title = options.title;
    this.window_header = new Element('div',{ className: 'window_header' });  
    this.window_title = new Element('div',{  className: 'window_title'  });  
    this.window_title.insert(this.title);
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
    LOG.debug(this.container + ' window is opening');
    this.openWindow();
    LOG.goOut();
  },

  openWindow: function openWindow(){ // Area
    LOG.getInto('Area#openWindow');
    var links_pool = $('links_pool');
    if (!links_pool) {
      links_pool = new Element('div',{'id':'links_pool'});
    }
    if (!this.window || !this.window.document) {
      this.anchor = new Element('a',{'id':this.title+'anchor', 'href':'#' + this.title, 'title': this.title });
      links_pool.appendChild(this.anchor);
      this.anchor.insert(this.title);
      this.window = new Control.Window(this.anchor, this.default_options); 
      // window_headerにwindow_titleとwindow_closeを挿入してから
      this.window_header.insert(this.window_close);
      this.window_header.insert(this.window_title);
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
});

areaSettings = {
  'menu' : {
              'container': 'menu',
              'title'    : 'Menu',
              'position' : [5,22],
              'width'    : 200,
              'height'   : 68 
            },
  'controlPanel' : {
              'container': 'controlPanel',
              'title'    : 'ControlPanel',
              'position' : [205,22],
              'width'    : 400,
              'height'   : 68 
            },
  'data' : {
              'container': 'data',
              'title'    : 'dataStore',
              'position' : [160,100],
              'width'    : 520,
              'height'   : 440
            },
  'board' : {
              'container': 'boardArea',
              'title'    : 'Board',
              'position' : [160,120],
              'width'    : 520,
              'height'   : 440
            },
  'prevMoves' : {
              'container': 'pres',
              'title'    : 'prevMoves',
              'position' : [10,120],
              'width'    : 120,
              'height'   : 300
            },
  'nextMoves' : {
              'container': 'nxts',
              'title'    : 'nextMoves',
              'position' : [690,120],
              'width'    : 120,
              'height'   : 400
            },
  'nextMovePoints' : {
              'container': 'nextMovePoints',
              'title'    : 'NextMovePoints',
              'position' : [690,100],
              'width'    : 120,
              'height'   : 400
            },
  'nextMoveComments' : {
              'container': 'nextMoveComments',
              'title'    : 'NextMoveComments',
              'position' : [1010,100],
              'width'    : 180,
              'height'   : 400
            },
  'boardPoint' : {
              'container': 'boardPoint',
              'title'    : 'BoardPoint',
              'position' : [5,450],
              'width'    : 120,
              'height'   : 70
            },
  'boardComments' : {
              'container': 'boardComments',
              'title'    : 'BoardComments',
              'position' : [5,580],
              'width'    : 700,
              'height'   : 100
            },
  'readBook' : {
              'container': 'readBook',
              'title'    : 'ReadBook',
              'position' : [850,580],
              'width'    : 220,
              'height'   : 380
            },
  'options' : {
              'container': 'options',
              'title'    : 'Options',
              'position' : [550,630],
              'width'    : 330,
              'height'   : 150
            },
  'bookmarks' : {
              'container': 'bookmarks',
              'title'    : 'BookMarks',
              'position' : [900,50],
              'width'    : 300,
              'height'   : 400,
              'resizable': new Element('div',
                           { className:'bkmk_resizable', title:'resize' })
            },
  'maintainer' : {
              'container': 'maintainer',
              'title'    : 'Maintainer',
              'position' : [250,630],
              'width'    : 250,
              'height'   : 100
            }
};

function Areas(opt) {
  this.initialize(opt);
};

Areas.data_name = $w('data menu controlPanel board nextMoves prevMoves nextMovePoints nextMoveComments boardPoint boardComments maintainer readBook options bookmarks');
Areas.prototype = {
  initialize: function(opt) {
    Areas.data_name.each(function(name){
      this[name] = new Area(opt[name]);
    }.bind(this));
  }
};

areas = new Areas(areaSettings);
