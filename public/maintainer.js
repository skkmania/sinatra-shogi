// maintainer.js
// 2010/11/8
// pseudo-wave.rbを使うアプリケーションをテストするときに
// サーバ側が持っているstateを書き換えるなどのメンテナンス作業を
// するためのwindowを表示する

var Maintainer = Class.create({
  initialize : function initialize(controller) {
    LOG.getInto('Maintainer#initialize');
    this.controller = controller;
    this.name = 'maintainer';
    this.initArea();
    LOG.goOut();
  },
	/**
	 * initArea()
	 */
  initArea: function initArea() { // Maintainer              
     LOG.getInto('Maintainer#initArea');
    this.area = areas[this.name];
     var contents =
'<div id="rev-b">\
  <button id="reverse-button" class="reverse t" onclick="window.gameController.game.reverse();">reverse</button>\
  <button id="dump-button" class="dump t" onclick="window.gameController.game.debug_dump();">dump</button>\
  <button id="test-button" class="testbutton t" onclick="new Test.Unit.Runner( testcases, \'testlog\' );">run_test</button>\
  <button id="dumpStore-button" class="dumpStorebutton t" onclick="window.dataStore.dump();">dump_store</button>\
  <button id="clearState-button" class="maintainer t" onclick="window.gameController.maintainer.clearState();">clear_state</button>\
  <button id="showState-button" class="maintainer t" onclick="window.gameController.maintainer.showState();">show_state</button>\
</div>\
<div id="showState"></div>';
    this.area.window_contents.update(contents);
    this.area.window.open();
    LOG.goOut();
  }, 
	/**
	 * clearState()
	 */
  clearState: function clearState() { // Maintainer              
    LOG.getInto('Maintainer#clearState');
    wave.getState().reset();
    LOG.goOut();
  }, 
	/**
	 * showState()
	 */
  showState: function showState() { // Maintainer              
    LOG.getInto('Maintainer#showState');
    $('showState').update(wave.getState().toDebugHtml());
    LOG.goOut();
  }, 
});
