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
'<div id="rev-b">\
  <button id="reverse-button" class="reverse t" onclick="window.gameController.game.reverse();">reverse</button>\
  <button id="dump-button" class="dump t" onclick="window.gameController.game.debug_dump();">dump</button>\
  <select id="piece-select" class="pieceSelect" value="chr:serif" onChange="window.gameController.pieceSelect($(\'piece-select\').value);">\
    <option>chr:serif</option>\
    <option>chr:sans-serif</option>\
    <option>chr:Takao P明朝</option>\
    <option>chr:Takao Pゴシック</option>\
    <option>img:csa</option>\
    <option>img:koma</option>\
  </select>\
  <span id="storeGeneration"></span>\
  <span id="storeSize"></span>\
  <button id="dumpStore-button" class="dumpStorebutton t" onclick="window.dataStore.dump();">dump_store</button>\
  <button id="clearState-button" class="options t" onclick="window.gameController.options.clearState();">clear_state</button>\
  <button id="showState-button" class="options t" onclick="window.gameController.options.showState();">show_state</button>\
</div>\
<div id="showState"></div>';
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
