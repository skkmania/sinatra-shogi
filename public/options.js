// options.js
// 2011/02/7
// pseudo-wave.rbを使うアプリケーションをテストするときに
// サーバ側が持っているstateを書き換えるなどのメンテナンス作業を
// するためのwindowを表示する

var Options = Class.create({
  initialize : function initialize(controller) {
    LOG.getInto('Options#initialize');
    this.controller = controller;
    this.name = 'options';
    // default
    this.isTxt = true;
    this.isImg = false;
    this.boardSize = 40;
    this.bkmkSize  = 20;
    this.initArea();
    LOG.goOut();
  },
	/**
	 * initArea()
	 */
  initArea: function initArea() { // Options              
     LOG.getInto('Options#initArea');
    this.area = areas[this.name];
     var contents =
'<div id="optionsDiv">\
  <p><label>Board Size:<input type="number" max="50" min="10" name="boardSize" id="boardSize" onChange="window.gameController.resizeBoard();"/></label></p><br>\
  駒書体選択:\
  <select id="piece-select" class="pieceSelect" onChange="window.gameController.pieceSelect($(\'piece-select\').value);">\
    <option>chr:serif</option>\
    <option>chr:sans-serif</option>\
    <option>chr:mikachan\-P</option>\
    <option>chr:Takao P明朝</option>\
    <option>chr:Takao Pゴシック</option>\
    <option>img:csa</option>\
    <option>img:koma</option>\
  </select><br>\
  <span id="storeGeneration"></span>\
  <span id="storeSize"></span><br>\
  <p><label>Bookmark Size:<input type="number" max="50" min="10" name="bookmarkSize" id="bookmarkSize" onChange="window.gameController.options.bkmkSize = $(\'bookmarkSize\').value;"/></label></p><br>\
</div>';
    this.area.window_contents.update(contents);
    this.area.window.open();
    LOG.goOut();
  }, 
	/**
	 * clearState()
	 */
  clearState: function clearState() { // Options              
    LOG.getInto('Options#clearState');
    wave.getState().reset();
    LOG.goOut();
  }, 
	/**
	 * showState()
	 */
  showState: function showState() { // Options              
    LOG.getInto('Options#showState');
    $('showState').update(wave.getState().toDebugHtml());
    LOG.goOut();
  }, 
});
