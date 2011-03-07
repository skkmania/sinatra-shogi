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

    // checkbox for mask
    var maskElm = new Element('div', { id:'maskElm' });
    maskElm.insert('mask');
    var label = null;
    dataStore.names.each(function(n, idx){
      label = new Element('label');
      label.textContent = n;
      var tmp = new Element('input',
           { type:'checkbox', name: n, value: idx, className: 'maskCkbx' });
      if(idx < 3) tmp.checked = true;  // by default
      label.insert(tmp);
      maskElm.insert(label);
    });

    this.area.window_contents.update(contents);
    this.area.window_contents.insert(maskElm);
    this.area.window.open();
    $('saveWindowColorsButton').observe('click',this.saveWindowColors.bind(this));
    $('loadWindowColorsButton').observe('click',this.loadWindowColors.bind(this));
    $('maskElm').observe('click', this.getMask.bind(this));
    LOG.goOut();
  }, 

	/**
	 * getMask()
	 */
	// チェックされた項目の値の2のべき乗の和をthis.msgOption.maskに
	// 格納して、それを返す
	// 入力： なし
	//        だが、画面のチェックボックスの状態が入力値として働く
	// 出力： this.msgOption.mask
	// 副作用：this.msgOption.maskを更新する
  getMask: function getMask() { // Options              
    LOG.getInto('Options#getMask', Log.DEBUG2);
    this.msgOption.mask =  $$('.maskCkbx').filter(function(c){
                                    return c.checked; }
           ).pluck('value').inject(0,function(acc,v){
                                  return acc + Math.pow(2,parseInt(v));
           });
    LOG.goOut(Log.DEBUG2);
    return this.msgOption.mask;
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
dataStore.getInitialData();
