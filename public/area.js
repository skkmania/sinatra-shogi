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
	 * display(target)
	 */
	// Area のwindowの中身にデータを入力し、window.contentsをupdateする
	// 入力 : 数値 target 表示したい画面のbid
	// 出力 : なし
  display : function display_Area(target){ // Area
    LOG.getInto();
    LOG.debug(this.container + ' area is to be displayed.');
    var str = '';
    switch (this.container){
      case 'pres':
   	str = '<ul>';
	dataStore.currentSlice().get('prevMoves').each(function(paer){
          });
/*
	 if(dataStore.slices.get(target)){
   	      str = '<ul>';
	   $A(dataStore.slices.get(target).get('bids')[0]['pres']).each(function(e){
	     str += '<li>' + e + '</li>';
	   });
   	      str += '</ul>';
	 } else {
	   if(!dataStore.slices.get(target)){
	     str = '<ul><li>now loading</li></ul>';
	     this.window_contents.update(str);
           }
           str = '<ul>';
           if (dataStore.slices.get(this.handler.target_store)) {
	     $A(dataStore.slices.get(target_store).get('bids')[0]['pres']).each(function(e){
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
           LOG.debug('target is ' + target);
           str = '<ul><li>' + target + '</li></ul>';
           break;
      case 'data':
           str = dataStore.toDebugHtml();
           break;
      case 'nxts':
        LOG.debug('nxts : str -> ' + str);
        LOG.debug('nxts : target -> ' + target);
       	LOG.debug('dataStore -> ' + Object.toJSON(dataStore));
       	LOG.debug('slice -> ' + Object.toJSON(dataStore.slices));

       	if(dataStore.slices.get(target)){
       	  LOG.debug('slices.get('+target+') -> ' + Object.toJSON(dataStore.slices.get(target)));
          str = '<ul>';
	  LOG.debug(Object.toJSON(dataStore.slices.get(target).get('bids')[0]['nxts']));
	   $A(dataStore.slices.get(target).get('bids')[0]['nxts']).each(function(e){
	     str += '<li>' + e + '</li>';
	   });
	  str += '</ul>';
          LOG.debug('str -> ' + str);
        } else {
	  if(!dataStore.slices.get(target)){
	    str = '<ul><li>now loading</li></ul>';
	    this.window_contents.update(str);
          }
          str = '<ul>';
          if (dataStore.slices.get(this.handler.target_store)) {
	    $A(dataStore.slices.get(this.target_store).get('bids')[0]['nxts']).each(function(e){
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
  }
});

areaSettings = {
  'controlPanel' : {
              'container': 'controlPanel',
              'title'    : 'ControlPanel',
              'position' : [10,0],
              'width'    : 500,
              'height'   : 90 
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
              'position' : [160,100],
              'width'    : 520,
              'height'   : 440
            },
  'prevMoves' : {
              'container': 'pres',
              'title'    : 'prevMoves',
              'position' : [10,100],
              'width'    : 120,
              'height'   : 300
            },
  'nextMoves' : {
              'container': 'nxts',
              'title'    : 'nextMoves',
              'position' : [690,100],
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
              'position' : [10,450],
              'width'    : 120,
              'height'   : 100
            },
  'boardComments' : {
              'container': 'boardComments',
              'title'    : 'BoardComments',
              'position' : [10,580],
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
  'maintainer' : {
              'container': 'maintainer',
              'title'    : 'Maintainer',
              'position' : [600,800],
              'width'    : 400,
              'height'   : 200
            }
};

function Areas(opt) {
  this.initialize(opt);
};

Areas.data_name = $w('data controlPanel board nextMoves prevMoves nextMovePoints nextMoveComments boardPoint boardComments maintainer readBook');
Areas.prototype = {
  initialize: function(opt) {
    Areas.data_name.each(function(name){
      this[name] = new Area(opt[name]);
    }.bind(this));
  }
};

areas = new Areas(areaSettings);
