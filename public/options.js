// options.js
// 2011/02/7
// pseudo-wave.rbを使うアプリケーションをテストするときに
// サーバ側が持っているstateを書き換えるなどのメンテナンス作業を
// するためのwindowを表示する

var Options = Class.create({
  initialize : function initialize() {
    LOG.getInto('Options#initialize');
    this.name = 'options';
    // default
    this.isTxt = true;
    this.isImg = false;
    this.boardSize = 40;
    this.bkmkSize  = 20;
    this.msgOption = { bid: 1, uid: 1, level: 3, mask: 7,
                       range:'full', async: true };
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
  <p><label>Board Size:<input type="number" max="50" min="10" name="boardSize" id="boardSize" onChange="window.gameController.resizeBoard();"/></label></p>\
  駒書体選択:\
  <select id="piece-select" class="pieceSelect" onChange="window.gameController.pieceSelect($(\'piece-select\').value);">\
    <option>chr:serif</option>\
    <option>chr:sans-serif</option>\
    <option>chr:mikachan\-P</option>\
    <option>chr:Takao P明朝</option>\
    <option>chr:Takao Pゴシック</option>\
    <option>img:csa</option>\
    <option>img:koma</option>\
  </select>\
  <span id="storeGeneration"></span>\
  <span id="storeSize"></span>\
  <p><label>Bookmark Size:<input type="number" max="50" min="10" name="bookmarkSize" id="bookmarkSize" onChange="globalOptions.bkmkSize = $(\'bookmarkSize\').value;"/></label></p>\
</div>';
    contents += '<div id="saveWindowColorsButton">save Window Colors</div>';
    contents += '<div id="loadWindowColorsButton">load Window Colors</div>';
    this.area.window_contents.update(contents);
    this.area.window.open();
    $('saveWindowColorsButton').observe('click',this.saveWindowColors.bind(this));
    $('loadWindowColorsButton').observe('click',this.loadWindowColors.bind(this));
    LOG.goOut();
  }, 
	/**
	 * saveWindowColors()
	 */
  saveWindowColors: function saveWindowColors() { // Options              
    LOG.getInto('Options#saveWindowColors', Log.DEBUG2);
    var tmp = {};
    // windowのうちbackgroundColorが設定されているものについて
    // { key: rgb(...) }という形のオブジェクトとして集める
    $H(areas).each(function(pair){
      if (pair.value.window_contents
       && pair.value.window_contents.style.backgroundColor)
       tmp[pair.key] = pair.value.window_contents.style.backgroundColor;
    });
    // そして、そのtmpを文字列にしてlocalStorageに保存する
    localStorage.colors = JSON.stringify(tmp);
    LOG.goOut(Log.DEBUG2);
  }, 
	/**
	 * loadWindowColors()
	 */
  loadWindowColors: function loadWindowColors() { // Options              
    LOG.getInto('Options#loadWindowColors', Log.DEBUG2);
    var tmp = JSON.parse(localStorage.colors);
    for(key in tmp){
      areas[key].window_contents.style.backgroundColor = tmp[key];
    }
    LOG.goOut(Log.DEBUG2);
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
	/**
	 * getMsgOption()
	 */
  getMsgOption: function getMsgOption() { // Options              
    LOG.getInto('Options#getMsgOption');
    $('getMsgOption').update(wave.getState().toDebugHtml());
    LOG.goOut();
  }, 
});

globalOptions = new Options();
