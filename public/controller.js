//GameConstructor = { 'shogi':ShogiGame, 'animalshogi':AnimalShogiGame };

/**
 * Player
 */
Player = Class.create({
	/**
	 * initialize(id, name, mine)
	 */
  initialize: function initialize(id, name, isViewer ) {
    this.id = id;
    this.name = name;
    this.isViewer = isViewer;
  },
	/**
	 * stand()
	 */
  stand: function stand(){
    return (this.id == 'player1') ?
        window.gameController.game.blackStand
      : window.gameController.game.whiteStand;
  },
	/**
	 * atTop()
	 */
  atTop: function atTop(game){ // Player
    return (this.id == 'player1') == (window.gameController.top == 1);
  },
	/**
	 * shortName()
	 */
  shortName: function shortName() {
    return this.name.split('@').first();
  },
	/**
	 * statusHtml()
	 */
  statusHtml: function statusHtml() { // Player
// playerのshort nameのspan のHTMLを返す。mine, turnのどちらかあるいは両方をclassとして指定する。
// classの意味（効果はcssで次のように定義されている。）
// mine は下線をひく
// turn は背景色を黄色にする
    var classNames = this.isViewer ? 'mine' : '';
    if (window.gameController.playerInTurn() == this) classNames += ' turn';
    return '<span class="' + classNames + '">' + this.shortName() + '</span>';
  },
	/**
	 * toString()
	 */
  toString: function toString() { // Player
    return this.name;
  },
	/**
	 * toDebugString()
	 */
  toDebugString: function toDebugString() { // Player
    return 'Player: name: ' + this.name + ', isViewer: ' +  this.isViewer + ', atTop: ' + this.atTop(); 
  }
});

/**
 * Menu
 */
Menu = Class.create({
	/**
	 * initialize(game)
	 */
  initialize: function initialize(controller) { // Menu
    LOG.getInto('Menu#initialize');
    this.controller = controller;
    this.name = 'menu';
    this.initArea();
    LOG.goOut();
  },
	/**
	 * initArea()
	 */
  initArea: function initArea() { // Menu              
    this.area = areas[this.name];
    LOG.getInto('Menu#initArea');
    var contents = '<input id="inputViewerId" type="text" name="viewerId" maxlength="10" />\
<button id="review-button" class="review t" onclick="window.gameController.reviewButtonPressed($F(\'inputViewerId\')); this.hide();">review</button>\
<button id="join-button" class="join t" onclick="window.gameController.joinButtonPressed($F(\'inputViewerId\')); this.hide();">join</button>\
<div id="play-list">Play List</div>\
<button id="play-button" class="play t" onclick="window.gameController.playButtonPressed($F(\'inputViewerId\')); this.hide();">play</button>\
<div id="watch-list">Watch List</div>\
<button id="watch-button" class="watch t" onclick="window.gameController.watchButtonPressed($F(\'inputViewerId\')); this.hide();">watch</button>\
<form>\
<button id="gpsPlay-button" class="gpsPlay t" onclick="window.gameController.gpsPlayButtonPressed($F(\'inputViewerId\'));return false;">gpsPlay</button>\
<input type="radio" name="turnRequestBlack" class="reqBlack t" label="reqBlack t" />\
<input type="radio" name="turnRequestWhite" class="reqWhite t" label="reqWhite t" />\
</form>'
    this.area.window_contents.update(contents);
    this.area.window.open();
    LOG.goOut();
  },
	/**
	 * addGpsPlayButton()
	 */
	// 機能: 局面指定GPS対局ボタンを用意する
	// 入力:
	// 出力:
	// 副作用:
  addGpsPlayButton: function addGpsPlayButton() { // Menu
    var contents = '<button id="askGps-button" class="askGps t" onclick="window.gameController.askGpsButtonPressed(); this.hide();">askGps</button>';
    this.area.window_contents.insert(contents, { after: $('inputViewerId')});
  },
	/**
	 * addToryoButton()
	 */
	// 機能: 投了ボタンを用意する
	// 入力:
	// 出力:
	// 副作用:
  addToryoButton: function addToryoButton() { // Menu
    var contents = '<button id="toryo-button" class="toryo t" onclick="window.gameController.toryoButtonPressed(); this.hide();">toryo</button>';
    this.area.window_contents.insert(contents, { after: $('inputViewerId')});
  }
});

/**
 * ControlPanel
 */
ControlPanel = Class.create({
	/**
	 * initialize(game)
	 */
  initialize: function initialize(controller) { // ControlPanel
    LOG.getInto('ControlPanel#initialize');
    this.controller = controller;
    this.name = 'controlPanel';
    this.initArea();
    this.counterElm = $('counterNum');
    LOG.goOut();
  },
	/**
	 * initArea()
	 */
  initArea: function initArea() { // ControlPanel              
    this.area = areas[this.name];
    LOG.getInto('ControlPanel#initArea');
    var contents =   '<div id="sidebar">\
                       <div id="control-panel">\
                         <div id="message">\
                           <div class="t">message</div>\
                           <div id="message-body"></div>\
                         </div>\
                       </div>\
                     </div>';
        contents +=  '<div id="Title">\
                       <p id="kid">局面ID: </p>\
                       <input id="inputText" type="text" name="bid" maxlength="7" value="1" />\
                       <button onclick="javascript:window.gameController.jumpButtonPressed();" id="submitButton">jump</button>\
                    </div>';
        contents += '<div id="counter"><span class="t">count</span><span id="counterNum"><span></div>';
        contents += '<div id="bottom-panel" class="player"><span class="t">sente</span> : <span class="t">waiting</span></div>';
        contents += '<div id="top-panel" class="player"><span class="t">gote</span> : <span class="t">waiting</span></div>';
    this.area.window_contents.update(contents);
    this.area.window.open();
    LOG.goOut();
  }, 
	/**
	 * reverse()
	 */
  reverse: function reverse() { // ControlPanel              
     LOG.getInto('ControlPanel#reverse');
      if (this.controller.top == 1){                                                
        this.player1Elm = $('top-panel');
        this.player2Elm = $('bottom-panel');
      } else {       
        this.player2Elm = $('top-panel');
        this.player1Elm = $('bottom-panel');
      }                    
    this.player1Elm.update(t('sente') + (this.controller.player1 ? this.controller.player1.statusHtml() : t('waiting')));
    this.player2Elm.update(t('gote') +  (this.controller.player2 ? this.controller.player2.statusHtml() : t('waiting')));
    LOG.goOut();
  }, 
	/**
	 * waitPlayer()
	 */
  waitPlayer: function waitPlayer() { // ControlPanel             
    LOG.getInto();
    LOG.goOut();
  }, 
	/**
	 * update()
	 */
  update: function update(mode) { // ControlPanel             
    LOG.getInto('ControlPanel#update');
    LOG.debug('mode : ' + mode);
    // counter: の表示を現手数へ更新
    this.counterElm.update(this.controller.count);
    // bidの表示を現在の盤面のbidへ更新
    $('inputText').value = this.controller.game.board.bid;
    if (!this.elm) this.elm = $('control-panel');                         
    if (this.controller.top == 1){                                                
      this.player1Elm = $('top-panel');
      this.player2Elm = $('bottom-panel');
    } else {       
      this.player2Elm = $('top-panel');
      this.player1Elm = $('bottom-panel');
    }                    
    switch(mode){
      case 'onePlayer':
        if(this.controller.players[0])
          $('message-body').update(this.controller.players[0] + ' is waiting');
        break;
      case 'playing':
        this.controller.message('');
        if(this.controller.player1)
          this.player1Elm.innerHTML = t('sente') + this.controller.player1.statusHtml();
        else
          this.player1Elm.innerHTML = t('sente');
        LOG.debug('player1 is written on panel');
        if(this.controller.player2)
          this.player2Elm.innerHTML = t('gote') + this.controller.player2.statusHtml();
        else
          this.player2Elm.innerHTML = t('gote');
        LOG.debug('player2 is written on panel');
        break;
      case 'over':
        this.controller.message(t('already_over') + '<br>' + wave.getState().get('winner') + t('win'));
        if(this.controller.player1)
          this.player1Elm.innerHTML = t('sente') + this.controller.player1.statusHtml();
        if(this.controller.player2)
          this.player2Elm.innerHTML = t('gote') + this.controller.player2.statusHtml();
        break;
      case 'slice':
        this.controller.message('');
        break;
      default:
        this.player1Elm.innerHTML = t('sente');
        this.player2Elm.innerHTML = t('gote');
    }
    LOG.warn('cp update leaving'); 
    LOG.goOut();
  } 
});

/*
 *	 GameController
 */
GameController = Class.create({
	/**
	 * initialize(settings)
	 */
  initialize: function initialize(settings) { // GameController
    this.settings = settings;
    var title = settings['logTitle'] || 'popup';
    LOG.getInto('GameController#initialize');
    if(settings === undefined){
      LOG.debug('settings is undefined.');
    } else {
      LOG.debug('settings : ' + Object.toJSON(this.settings));
    }
    this.maintainer = new Maintainer(this);
    this.options = new Options(this);
    this.book = new Book(this);
    this.container = $(this.settings['containerId']);
    this.playerSetting = settings['playerSetting'] || 'viewer';
    this.players = $A([]);       // playerのIDの文字列の配列
    this.playerObjects = $A([]); // playerオブジェクトの配列
    this.blackplayers = $A([]);  // 先手playerのPlayerオブジェクトの配列
    this.whiteplayers = $A([]);  // 後手playerのPlayerオブジェクトの配列
    this.menu = new Menu(this);
    this.controlPanel = new ControlPanel(this);
    this.count = 0;
       // 手数。このgameではcount手目を指した局面がthis.gameの
       // board, blackStand, whiteStandに反映されているものとする.

    this.top_by_viewer = false;
      // viewerが反転ボタンでtopを決定したとき、その値を持つ。
      // それまではfalse. したがって、これがfalseのあいだはplayerとviewerの関係のみで
      // topを決めることができる。
      // すなわち、
      //  viewer == player1 のとき、top = 0 (player1がbottomなので)
      //  viewer == player2 のとき、top = 1 (player2がbottomなので)
      //  viewer がplayerでないとき、top = 0 （先手がbottomがデフォルトであるので)
      //  Boardのinitializeにおいては
      //  top=0を前提にstyle.top, style.leftを決めている
      //  ので、topが決まったこの時点で必要なら修正しておく必要がある
    LOG.debug('GameController initializer coming to end.');
    LOG.debug('now, going to each process named by playerSetting : ' + this.playerSetting);
    LOG.goOut();
    switch(this.playerSetting){
      case 'review':  // 検討モード
        this.mode = 'noPlayers';
        this.prepareReview();
        break;
      case 'playGame':  // 対局モード
        this.mode = '';
        this.lookForParticipants();
        this.game = new ShogiGame(settings, this);
        break;
      case 'gpsclient': // GPS将棋クライアントモード
        break;
      case 'viewer': // 観戦モード
        break;
      default:
        break;
    }
  },

  lookForParticipants : function lookForParticipants(){
    LOG.getInto('GameController#lookForParticipants');
    this.message(t('click_join_button'));
    LOG.goOut();
  },
	/**
	 * prepareReview()
	 */
        // 入力：なし
        // 出力：なし
        // 機能：reviewモードのためにplayerの名前を決定し、所定の配列に格納する
        //   reviewモードの名前付け規則
        //     wave ID の場合: 先手： IDの先頭に'b_' を追加する
        //                   : 後手： IDの先頭に'w_' を追加する
  prepareReview: function prepareReview() { // GameController
    LOG.getInto('GameController#prepareReview');
    var name = wave.getViewer().getId();
    this.players.push('b_' + name);
    this.players.push('w_' + name);
    this.player1 = new Player('player1', 'b_' + name, true);
    this.player2 = new Player('player2', 'w_' + name, true);
    var delta = this.addPlayersToDelta();
    if($('join-button')){ $('join-button').hide(); }
    this.game = new ShogiGame(this.settings, this);
    this.count = 0;
    this.top_by_viewer = 0;
    this.top = 0;
    LOG.goOut();
    this.sendDelta(delta);
    this.playing(wave.getState());
    this.game.show();
  },
	/**
	 * acceptState()
	 */
        // state changeに対するコールバック
        // 機能：state.modeに対応し、各関数にふりわける
        //   state.modeがとりうる値（文字列）は
        //    noPlayers, onePlayer,
        //    preparePlayers, playing
        //    review
  acceptState: function acceptState() { // GameController
    LOG.getInto('GameController#acceptState');
    if(wave) {
      var state = wave.getState();
      LOG.debug('state in string is: ' + arrange(state));
      this.mode = state.get('mode');
      LOG.debug('mode read from state is : ' + this.mode);
      if (this.mode){
        this[this.mode](state);
     } else {
        LOG.debug('there is no mode in state');
        this.mode = 'noPlayers';
        LOG.debug('so, this.mode is set to "noPlayers"');
        this.noPlayers();
     }
   } else {
      LOG.fatal('wave not found');
   }
   LOG.goOut();
  },
	/**
	 * noPlayers()
	 */
        // gadget起動時のstate changeに対するコールバック
        // 機能：最初の参加者を受付、次の参加を待つ
  noPlayers: function noPlayers() { // GameController
    LOG.getInto('GameController#noPlayers');
    this.controlPanel.update('noPlayers');
        // join buttonがclickされるのを待つ
    this.message(t('click_join_button'));
    LOG.goOut();
  },
        /*
	 * onePlayer(state)
	 */
        // gadget起動時のstate changeに対するコールバック
        // 参加者が一人だけいるstateに対応する
        // 機能：2人目の参加者を受付
  onePlayer: function onePlayer(state) { // GameController
    LOG.getInto('GameController#onePlayer');
    this.getPlayersFromState(state);
    this.controlPanel.update('onePlayer');
    LOG.goOut();
  },
        /*
	 * preparePlayers(state)
	 */
        // 参加者が2人以上いるstateに対応する
        // 機能：playersを対局用に配置する
  preparePlayers: function preparePlayers(state) { // GameController
    LOG.getInto('GameController#preparePlayers');
    this.getPlayersFromState(state);
    if(!this.game.askPlayersEnough(this.players)){
      LOG.fatal('game says not enouph player!');
      //this.controlPanel.waitPlayer();
    } else {
      //this.mainRoutine();
      this.playing(state);
    }
    this.controlPanel.update('preparePlayers');
    LOG.goOut();
  }, 
	/**
	 * playing(state)
	 */
        // プレイヤーが揃ってゲームが始まった後のstateChangeへのコールバック
        // これが呼ばれたときにはstateのmodeは'playing'であり
        // stateのplayersにはメンバーの名の文字列が
        // コンマ区切りで複数個並んでいる
  playing: function playing(state) {  // GameController
    LOG.getInto('GameController#playing');

    // stateから、dataStoreに情報を格納する
    dataStore.readState(state);

    this.count = state.get('count') || 0;
    if(!this.player1) this.getPlayersFromState(state);
    this.determineTop();
    // topが決まったので持ち駒の位置も決められる。
    this.game.setStandPosition();
    if($('join-button')){ $('join-button').hide();}
    // 最初だけは将棋盤の向きが逆になっているかもしれないので調整。
    if(this.count === 0) this.adjustDirection();
    //if (!this.game.board.shown) this.game.board.show();
    this.game.boardReadFromDB();  // 盤面の読み込み
    // １手ごとのデータ先読み
    dataStore.getMsg((this.game.board.bid || 1), 1, 3, 7, 'full', true);
    this.game.toggleDraggable();
    this.game.board.turn = this.readTurnFromState(state);
    $('boardTurn').update('board : ' + this.game.board.turn.toString());
    this.controlPanel.update('playing');
    dataStore.currentSlice().get('nextMoves').show();
    dataStore.currentSlice().get('prevMoves').show();
    //this.prepareFromState(state);
    LOG.goOut();
  },
	/**
	 * review(state)
	 */
        // reviewモードにおいて、reviewの配布がなされたときに受け取って処理するためのコールバック
        // 
  review: function review(state) { // GameController
    LOG.getInto('GameController#review');

    // stateから、dataStoreに情報を格納する
    dataStore.readState(state);

    // 画面を更新する
    $('inputText').value = dataStore.currentBid;
    this.game.board.turn = this.readTurnFromState(state);
    this.game.board.bid    = parseInt(state.get('bid') || 1);
    $('boardTurn').update('board : ' + this.game.board.turn.toString());
    this.game.boardReadFromDB();
    this.game.toggleDraggable();
    this.controlPanel.update('review');
    dataStore.currentSlice().get('nextMoves').show();
    dataStore.currentSlice().get('prevMoves').show();
    LOG.goOut();
  },
	/**
	 * over(state)
	 */
        // 勝負がついた後のstateChangeへのコールバック
        // これが呼ばれたときにはstateのmodeは'over'であり
        // stateのwinnerには勝者の名の文字列がある
  over: function over(state) {  // GameController
    LOG.getInto('GameController#over');
    this.count = state.get('count') || 0;
    if(!this.player1) this.getPlayersFromState(state);
    if($('join-button')){ $('join-button').hide(); }
    if (!this.game.board.shown) this.game.board.show();
//  ここの処理は他のコールバックを参考に書き直すこと
    this.controlPanel.update('over');
      // draggableは消してしまい、ゲームを継続できなくする
    this.game.allPieces().pluck('drag').compact().invoke('destroy');
    LOG.goOut();
  }, 
	/**
	 * mainRoutine()
	 */
  mainRoutine: function mainRoutine() { // GameController
    LOG.getInto('GameController#mainRoutine');
    this.providePlayer();
    this.makeGameAct();
    LOG.debug('leaving mainRoutine');
    LOG.goOut();
  },
	/**
	 * refreshBoard
	 */
	// 入力されたbidのboard情報を取得し、盤面を書き換える。
	// 入力 : bid 数値 表示したい局面のbid
  refreshBoard: function refreshBoard(bid){ // GameController
    LOG.getInto('GameController#refreshBoard');
    LOG.debug('bid : ' + bid);
    var boardObj, nextMoves, prevMoves;

    if(bid) $('inputText').value = bid;
    var slice = dataStore.slices.get(bid);
    LOG.debug('slice['+bid+'] : ' + Object.toJSON(slice));
    if(!slice){
      LOG.debug('was not found in slices key, so try getMsg.');
      dataStore.getMsg(bid, 1, 3, 7, 'full', false);
      slice = dataStore.slices.get(bid);
    }
    if(slice){
      this.game.boardReadFromDB();
      this.game.board.show();
      dataStore.currentSlice().get('prevMoves').show();
      dataStore.currentSlice().get('nextMoves').show();
    } else {
      LOG.fatal('cannot get slice');
    }
    LOG.goOut();
  },
	/**
	 * makeDelta()
	 */
  makeDelta: function makeDelta(flag, winner){ // GameController
    LOG.getInto('GameController#makeDelta');
    this.count++;
    var delta = {};
    if (this.playerSetting == 'review') {
      var obj = {};
      obj['board']  = this.game.board.toString();
      obj['black']  = this.game.blackStand.toString();
      obj['white']  = this.game.whiteStand.toString();
      obj['bid']    = this.game.board.bid.toString();
      obj['turn']   = (!this.game.board.turn).toString();
      delta['board'] = Object.toJSON(obj);
      delta['count'] = this.count.toString();
      delta['next']  = Object.toJSON([]);
      delta['prev']  = Object.toJSON([]);
      this.mode = 'review';
      delta['mode']   = 'review';
    } else {
      delta['board']  = this.game.board.toString();
      delta['bstand'] = this.game.blackStand.toString();
      delta['wstand'] = this.game.whiteStand.toString();
      delta['count']  = this.count.toString();
      delta['mode']   = this.mode;
    }
    switch(flag){
      case 'continue':
        break;
      case 'finish':
        delta['mode'] = 'over';
        delta['winner'] = winner.name;
        break;
      default:
        break;
    }
    LOG.goOut();
    return delta;
  },
	/**
	 * makeReviewDelta(bid, move)
	 */
	// 入力されたbidのboard情報を取得し、sliceをdeltaに置き換える
	// 入力 : bid 数値 表示したい局面のbid
	//  ただし、これはnullでも可。そのときは画面上のbid入力エリアの値を使う
	//        move CSA形式文字列 表示したい局面に至る指し手
	//          つまり、ユーザが指した手をStateに載せてサーバに伝えたい
        // 出力 : 作成されたdelta オブジェクト
  makeReviewDelta: function makeReviewDelta(bid, move){ // GameController
    var delta = {};
    LOG.getInto('GameController#makeReviewDelta');
    this.count++;
    LOG.debug('bid in arguments : ' + bid);
    LOG.debug('move in arguments : ' + move);
    LOG.debug2('typeof bid : ' + typeof bid);
    var value = bid || $('inputText').value;
    LOG.debug('value (determined bid): ' + value);
    var slice = dataStore.slices.get(value);
    if(!slice){
      LOG.debug('was not found in slices key, so try getMsg.');
      LOG.debug('slices key is : ' + dataStore.slices.keys().join(','));
      dataStore.getMsg(value, 1, 3, 7, 'full', false);
      slice = dataStore.slices.get(value);
    }
    LOG.debug('slice : ' + slice.toDebugString());
    LOG.debug('slice.keys : ' + (slice.keys().join(',')));
    if(slice){
      LOG.debug('bidに対するsliceが確定できた');
      LOG.debug('slices[' + value + '] : ' + slice.toDebugString());
      LOG.debug('slice.keys : ' + (slice.keys().join(',')));
      slice.each(function(pair){
        window.LOG.debug('key : ' + Object.toJSON(pair.key));
        window.LOG.debug('value : ' + pair.value.toDebugString());
      });
      delta['mode']  = wave.getState().get('mode') || 'review';
      delta['count'] = this.count.toString();
      delta['bid']   = value.toString();
      if (move) { delta['move']   = move; }
      delta['turn']  = (slice.get('board').turn ? 't' : 'f');
      delta['board'] = slice.get('board').toDelta();
      delta['next']  = slice.get('nextMoves').toDelta();
      delta['prev']  = slice.get('prevMoves').toDelta();
      LOG.debug('delta : ' + Object.toJSON(delta));
    } else {
      LOG.fatal('cannot get slice');
    }
    LOG.goOut();
    return delta;
  },
	/**
	 * makeAndSendReviewDelta(bid, move)
	 */
	// 入力されたbidのboard情報を取得し、sliceをdeltaに置き換える
	// 入力 : bid 数値 表示したい局面のbid
	//          ただし、これはnullでも可。
	//          そのときは画面上のbid入力エリアの値を使う
	//          それもない場合は初期値である１を使用する。
	//        move CSA形式文字列 表示したい局面に至る指し手
	//          つまり、ユーザが指した手をStateに載せてサーバに伝えたい
        // 出力 : 作成されたdelta オブジェクト
  makeAndSendReviewDelta: function makeAndSendReviewDelta(bid, move){ // GameController
    var delta = {};
    LOG.getInto('GameController#makeAndSendReviewDelta');
    this.count++;
    LOG.debug('bid : ' + bid);
    LOG.debug('typeof bid : ' + typeof bid);
    var value = bid || $('inputText').value || 1;
    LOG.debug('value : ' + value);
    var slice = dataStore.slices.get(value);
    if(!slice){
      LOG.debug('was not found in slices key, so try getMsg.');
      LOG.debug('slices key is : ' + dataStore.slices.keys().join(','));
      dataStore.getMsg(value, 1, 3, 7, 'full', false);
      slice = dataStore.slices.get(value);
    }
    LOG.debug('slice : ' + slice.toDebugString());
    LOG.debug('slice.keys : ' + (slice.keys().join(',')));
    if(slice){
      LOG.debug('slices[' + value + '] : ' + slice.toDebugString());
      LOG.debug('slice.keys : ' + (slice.keys().join(',')));
      slice.each(function(pair){
        window.LOG.debug2('key : ' + Object.toJSON(pair.key));
        window.LOG.debug2('value : ' + pair.value.toDebugString());
      });
      delta['mode']  = wave.getState().get('mode') || 'review';
      delta['count'] = this.count.toString();
      delta['bid']   = value.toString();
      if (move) { delta['move']   = move; }
      delta['turn']  = (slice.get('board').turn ? 't' : 'f');
      delta['board'] = slice.get('board').toDelta();
      delta['next']  = slice.get('nextMoves').toDelta();
      delta['prev']  = slice.get('prevMoves').toDelta();
      LOG.debug('delta : ' + JSON.stringify(delta));
    } else {
      LOG.fatal('cannot get slice');
    }
    LOG.goOut();
    wave.getState().submitDelta(delta);
  },
	/**
	 * sendDelta()
	 */
  sendDelta: function sendDelta(delta){ // GameController
    LOG.getInto('GameController#sendDelta');
    // 送信
    LOG.warn('<div style="color:#FF0000">sending delta : </div>' + Log.dumpObject(delta));
    LOG.goOut();
    wave.getState().submitDelta(delta);
  },
	/**
	 * providePlayer()
	 */
  providePlayer: function providePlayer() { // GameController
    LOG.getInto('GameController#providePlayer');
    this.game.getPlayer(this.playerInTurn());
    LOG.goOut();
  },
	/**
	 * playerInTurn()
	 */
        // 現在の手番のplayer objectを返す
  playerInTurn: function playerInTurn() { // GameController
    LOG.getInto('GameController#playerInTurn');
    //if (this.getTurn())
    if (this.game.board.turn)
      ret = this.blackplayers[0];
    else
      ret = this.whiteplayers[0];
    LOG.goOut();
    return ret;
  },
	/**
	 * makeGameAct()
	 */
  makeGameAct: function makeGameAct() { // GameController
    LOG.getInto();
    this.nextTurn();
    LOG.goOut();
    return null;
  },
	/**
	 * receiveResult()
	 */
  receiveResult: function receiveResult() { // GameController
    LOG.getInto();
    if(this.checkFinish()){
      this.sendDelta();
    }
    LOG.goOut();
    return null;
  },
	/**
	 * receiveAction(actionContents)
	 */
  // ユーザのアクションがここに通知される
  //   (具体的には、gameのPieceがonDropの中でこの関数を呼び出す)
  // 入力 : 配列 actionContents : [piece, fromObj, toCell]
  receiveAction: function receiveAction(actionContents) { // GameController
    LOG.getInto('GameController#receiveAction');
    switch(this.game.respondValidity(actionContents)){
      case 'needConfirm':
        this.confirmActionByUser(actionContents);
        break;
      case 'mustPromote':
        actionContents[0].promote();
        this.game.doAction(actionContents, true);
        break;
      case 'badAction':
        this.noticeBadActionToUser();
        break;
      default:
        this.game.doAction(actionContents, false);
        break;
    }
    LOG.goOut();
    return;
  },
	/**
	 * confirmActionByUser(actionContents)
	 */
        // action内容をユーザに提示し、ユーザからそれでよいかどうか確認をとる
        // 成り・不成りを確認することを想定
  confirmActionByUser: function confirmActionByUser(actionContents) { // GameController
    LOG.getInto('GameController#confirmActionByUser');
    this.game.makeConfirmActionElement();
    this.game.confirmActionByUser(actionContents);
    LOG.goOut();
  },
	/**
	 * getResponseToConfirmActionByUser()
	 */
        // ユーザに対し表示した確認用要素のクリックイベントはこの関数を呼び出す
  getResponseToConfirmActionByUser: function getResponseToConfirmActionByUser(event) {
    LOG.getInto('GameController#getResponseToConfirmActionByUser');
      // この関数にはactionContentsがbindされているので、
      // thisはこの中ではactionContentsを指す
    var actionContents = this;
    var promote_flag = null;
    LOG.debug('actionContents[0] (動かした駒のPieceオブジェクト): ' + actionContents[0].toDebugString());

    LOG.debug('event.element(ユーザがクリックした要素のid) : ' + event.element().id);

    switch (event.element().id) {
      case 'yesElement':
        LOG.debug('yesElement was clicked.');
        promote_flag = true;
        window.gameController.game.promotePiece(actionContents).call(actionContents[0]);
/*
  ここは、以下の意味。 動かした駒が成るということ。
        var f = window.gameController.game.promotePiece(actionContents);
        LOG.debug('got function? -- type is  ' + typeof f);
        f.call(actionContents[0]);
        LOG.debug('function called.');
*/
      break;
      case 'noElement':
        promote_flag = false;
        LOG.debug('noElement was clicked.');
      break;
    }
    window.gameController.game.doAction(actionContents, promote_flag);
    $('promoteOrNot').stopObserving();
    $('promoteOrNot').hide();
    LOG.goOut();
  },
	/**
	 * noticeBadActionToUser()
	 */
        // action内容がゲームから不正といわれたときに、ユーザにそれを知らせる
  noticeBadActionToUser: function noticeBadActionToUser(actionContents) { // GameController
    LOG.getInto('GameController#noticeBadActionToUser');
    LOG.goOut();
  },
	/**
	 * determineTop()
	 */
  determineTop: function determineTop() { // GameController
    LOG.getInto('GameController#determineTop');
     // 先手(player1)がbottomのとき0, top = 1 なら先手がtop
     // はじめからtop が１になるのはplayer2がviewerのときだけ
     // あとはviewerが反転ボタンで指定したとき
    if (this.top_by_viewer === 0 || this.top_by_viewer === 1){
       this.top = this.top_by_viewer;
       LOG.debug('top is set to ' + this.top + ' because top_by_viewer is ' + this.top_by_viewer);
    } else {
      this.top = 0;  // by default
      if (this.player2 && this.player2.isViewer){
        this.top = 1;
        LOG.debug('top is set to 1 because ' + this.player2.name + ' is viewer');
      }
    }
    LOG.debug('leaving determineTop with gameController.top : ' + this.top);
    LOG.goOut();
  },
	/**
	 * reviewButtonPressed(name)
	 */
        // 機能：　reviewボタン押下に対し反応しreviewモードでの対局を開始する
        //         受け取ったnameから先手、後手の名前を生成して
	//         this.playersに格納する(どちらも同じ名前になる)
        // 入力： name 文字列 playerの名前 (waveの@以下を含むIDなど。)
        // 出力： なし
  reviewButtonPressed: function reviewButtonPressed(name) { // GameController
    var delta = {};
    LOG.getInto('GameController#reviewButtonPressed');
    LOG.debug('arguments : ' + name);

    // nameをwave.viewerにセットする。これはnowaveならではの処理。
    // waveで使用するときはコメントアウトすること。
    wave.setViewer(name);
    LOG.debug('wave.getViewer().getId() : ' + wave.getViewer().getId());
    LOG.debug('wave.getViewer().getDisplayName() : ' + wave.getViewer().getDisplayName());
    // ここまで。

    // playerの名前を設定
    wave.getState().put('blacks', name);
    wave.getState().put('whites', name);
    wave.getState().put('players', name + ',' + name);
    // このとき、ブラウザクライアントではbid = 1に対応するsectionを持つべき
    wave.getState().put('status', 'review');
    this.mode = 'playing';
    // 2人ぶんをpush
    this.players.push(wave.getViewer().getId());
    this.players.push(wave.getViewer().getId());
    LOG.debug('players: ' + this.players.join(','));
    this.player1 = new Player('player1', name, true);
    this.player2 = new Player('player2', name, true);
    // reviewモードにおいてはtopは強制的に0にする
    this.top_by_viewer = 0;
    var delta = this.addPlayersToDelta();
    delta['status'] = 'review';
    delta['mode'] = this.mode;
    delta['count']   = 0;
    delta['bid']   = 1;
    delta['turn'] = 't';
    delta['board'] = '1,t,' + this.game.board.initialString + ',,';
    delta['next']  = dataStore.slices.get(1).get('nextMoves').toDelta();
    delta['prev']  = dataStore.slices.get(1).get('prevMoves').toDelta();
    LOG.debug('sending delta : ' + Log.dumpObject(delta));

    // 局面指定GPS対局ボタンを用意する
    this.menu.addGpsPlayButton();
    LOG.goOut();
    // 以下を呼べば、acceptStateに飛んでしまう
    wave.getState().submitDelta(delta);
  },
	/**
	 * askGpsButtonPressed()
	 */
        // 機能：　askGpsボタン押下に対し反応しGPSとの対局を開始する
	//         
        // 入力： 
        // 出力： なし
  askGpsButtonPressed: function askGpsButtonPressed(name) { // GameController
    var delta = this.makeReviewDelta();
    var currentPlayer = wave.getState().get('players').split(',')[0];
    LOG.getInto('GameController#askGpsButtonPressed');

    // playerの名前を設定
    // 現在の手番をGPSに担当させたいのだから
    if(this.game.board.turn) {
      wave.getState().put('blacks', 'gps');
    } else {
      wave.getState().put('whites', 'gps');
    }
    // これで手番の希望を載せたことになる
    // stateのplayersの値も合わせて変更する
    if(this.game.board.turn) {
      wave.getState().put('players', 'gps@googlewave.com,'+currentPlayer);
    } else {
      wave.getState().put('players', currentPlayer+',gps@googlewave.com');
    }
    // player objectはここでクリアしておけば、stateが降ってきたあとに改めて作成される
    this.player1 = null;
    this.player2 = null;
    // statusをgpstとする。tは局面指定を意味するものとする
    delta['status'] = 'gpst';
    // その他の情報は現在の画面を構成している情報なのだから、現在のstate
    // に載っているままでよい
    LOG.debug('arguments : ' + name);
    LOG.debug('sending delta : ' + Log.dumpObject(delta));
    this.menu.addToryoButton();
    LOG.goOut();
    // 以下を呼べば、acceptStateに飛んでしまう
    wave.getState().submitDelta(delta);
  },
	/**
	 * jumpButtonPressed()
	 */
        // 機能：　jumpボタン押下に対し反応し指定bidの局面へ移動する
	//         
        // 入力： なし。ただし画面のinputTextの値を入力のように扱う
        // 出力： なし
	// 副作用: dataStore.currentBidを画面のinputTextの値にする
  jumpButtonPressed: function jumpButtonPressed() { // GameController
    LOG.getInto('GameController#jumpButtonPressed');
    var delta = {};
    var bid = parseInt($('inputText').value);
    dataStore.currentBid = bid;
    this.refreshBoard(bid);
    this.game.toggleDraggable();
    LOG.goOut();
  },
	/**
	 * toryoButtonPressed()
	 */
        // 機能：　toryoボタン押下に対し反応しGPSとの対局を開始する
	//         
        // 入力： 
        // 出力： なし
  toryoButtonPressed: function toryoButtonPressed() { // GameController
    var delta = {};
    LOG.getInto('GameController#toryoButtonPressed');

    // playerの名前を設定
    // 投了後は検討モードに移行させるので先後のplayerの名前を同じにする
    if(wave.getState().get('blacks') == 'gps') {
      wave.getState().put('blacks', wave.getState().get('whites'));
    } else {
      wave.getState().put('whites', wave.getState().get('blacks'));
    }
    delta['status'] = 'toryo';
    // その他の情報は現在の画面を構成している情報なのだから、現在のstate
    // に載っているままでよい
    LOG.debug('arguments : ' + name);
    LOG.debug('sending delta : ' + Log.dumpObject(delta));
    this.menu.addGpsPlayButton();
    LOG.goOut();
    // 以下を呼べば、acceptStateに飛んでしまう
    wave.getState().submitDelta(delta);
  },
	/**
	 * gpsPlayButtonPressed(name)
	 */
        // 機能：　gpsPlayボタン押下に対し反応しGPSとの対局を開始する
        //         受け取ったnameをthis.playersに格納する
        // 入力： name 文字列 playerの名前 (waveの@以下を含むIDなど。)
        // 出力： なし
  gpsPlayButtonPressed: function gpsPlayButtonPressed(name) { // GameController
    var delta = {};
    LOG.getInto('GameController#gpsPlayButtonPressed');

    // nameをwave.viewerにセットする。これはnowaveならではの処理。
    // waveで使用するときはコメントアウトすること。
    wave.setViewer(name);
    LOG.debug('wave.getViewer().getId() : ' + wave.getViewer().getId());
    LOG.debug('wave.getViewer().getDisplayName() : ' + wave.getViewer().getDisplayName());
    // ここまで。

    // 先後の希望を処理
/*
    if(sente_kibou){
      wave.getState().put('blacks', name);
      wave.getState().put('whites', 'gps');
    } else {
      wave.getState().put('whites', name);
      wave.getState().put('blacks', 'gps');
    }
*/
    // playerの名前を設定 とりあえず暫定として
      wave.getState().put('blacks', name);
      wave.getState().put('whites', 'gps');
      wave.getState().put('players', name + ',gps');
     // これで手番の希望を載せたことになる
    // gps対局を希望するDeltaを作成してsendDelta
     // このとき、ブラウザクライアントではbid = 1に対応するsectionを持つべき
    //delta = makeReviewDelta(1);
     // statusをgpss
      wave.getState().put('status', 'gpss');
      this.mode = 'playing';
      delta['status'] = 'gpss';
      delta['mode'] = this.mode;
      delta['bid'] = 1;
    LOG.debug('arguments : ' + name);
    LOG.debug('sending delta : ' + Log.dumpObject(delta));
    LOG.goOut();
    // 以下を呼べば、acceptStateに飛んでしまう
    wave.getState().submitDelta(delta);
  },
	/**
	 * joinButtonPressed(name)
	 */
        // 機能：　joinボタン押下に対し反応し再びjoinボタン押下待ち状態に戻る
        //         受け取ったnameをthis.playersに格納する
        //         this.playersの人数が２人になったら次の段階(振り駒)へ進む
        // 入力： name 文字列 playerの名前 (waveの@以下を含むIDなど。)
        // 出力： なし
  joinButtonPressed: function joinButtonPressed(name) { // GameController
    LOG.getInto('GameController#joinButtonPressed');
    LOG.debug('arguments : ' + name);
    // nameをwave.viewerにセットする。これはnowaveならではの処理。
    // waveで使用するときはコメントアウトすること。
    wave.setViewer(name);
    LOG.debug('wave.getViewer().getId() : ' + wave.getViewer().getId());
    LOG.debug('wave.getViewer().getDisplayName() : ' + wave.getViewer().getDisplayName());
    // ここまで。

    if (wave.getState().get('players')) this.players = wave.getState().get('players').split(',');
    if (wave.getState().get('mode')) this.mode = wave.getState().get('mode');
    LOG.debug('this.players : ' + this.players.length + ' : ' + this.players.join(', '));
    LOG.debug('this.mode : ' + this.mode);
    var deltakey = null; 
    var delta = {};
    if (this.mode) {
      switch (this.mode){
        case  'noPlayers':
          LOG.debug('noPlayers: first player added');
          this.players.push(name);
          this.message(t('waiting'));
          deltakey = 'players';
          this.mode = 'onePlayer';
          delta[deltakey] = wave.getViewer().getId();
          delta['mode'] = this.mode;
          break;
        case 'onePlayer':
          LOG.debug('onePlayer: second player added');
          this.players.push(wave.getViewer().getId());
          LOG.debug('players: ' + this.players.join(','));
          delta = this.setPlayersOrder();
          LOG.debug('returned delta : ' + Log.dumpObject(delta));
          if($('join-button')){ $('join-button').hide(); }
          // 先後が決まったので、画面の将棋盤の向きをそれに合わせる。
          //this.adjustDirection();          
          this.mode = 'playing';
          break;
      }
    } else {
        LOG.debug('mode not found: first player added');
        this.players.push(wave.getViewer().getId());
        this.message(t('waiting'));
        deltakey = 'players';
        this.mode = 'onePlayer';
        delta[deltakey] = wave.getViewer().getId();
        delta['mode'] = this.mode;
    }
    //this.controlPanel.update(this.mode);
    LOG.debug('sending delta : ' + Log.dumpObject(delta));
    LOG.goOut();
    // 以下を呼べば、acceptStateに飛んでしまう
    wave.getState().submitDelta(delta);
  },
	/**
	 * adjustDirection()
	 */
	// 機能 : 後手が見ている画面なら、盤の１段目を下方にする
  adjustDirection: function adjustDirection() { // GameController
    LOG.getInto('GameController#adjustDirection');
    LOG.debug('player2.name : ' + this.player2.name);
    LOG.debug('viewer name : ' + wave.getViewer().getDisplayName());
    if(this.player2.name == wave.getViewer().getId()){
      this.game.reverse(1);
    }
    LOG.goOut();
  },
	/**
	 * setPlayersOrder()
	 */
        // 前提： 2人のプレイヤーがいる（this.players.length == 2)
        // 機能： 2つのPlayerオブジェクトを生成し、ランダムに2人のプレイヤーに割り当てる
        //        this.blackplayers, this.whiteplayersをセットする
        // 返値 : stateに載せる情報としてdeltaを作成し返す
        //        deltaに載せる項目は、playerとturn
  setPlayersOrder: function setPlayersOrder() { // GameController
    var viewer = wave.getViewer().getId();
    LOG.getInto('GameController#setPlayersOrder');
    LOG.debug('viewer : ' + viewer);
    
    if(Math.random() < 0.5){ 
      this.player1 = new Player('player1', this.players[0], this.players[0]==viewer || this.players[0]==wave.getViewer().getDisplayName());
      this.player2 = new Player('player2', this.players[1], this.players[1]==viewer || this.players[1]==wave.getViewer().getDisplayName());
    } else {
      this.player1 = new Player('player1', this.players[1], this.players[1]==viewer || this.players[1]==wave.getViewer().getDisplayName());
      this.player2 = new Player('player2', this.players[0], this.players[0]==viewer || this.players[0]==wave.getViewer().getDisplayName());
    }
    var delta = this.addPlayersToDelta();
    delta['mode']  = 'playing';
    delta['count']   = 0;
    delta['bid']   = 1;
    delta['turn'] = 't';
    delta['board'] = '1,t,' + this.game.board.initialString + ',,';
    LOG.debug('slices: ');
    LOG.debug(JSON.stringify(dataStore.slices));
    delta['next']  = dataStore.slices.get(1).get('nextMoves').toDelta();
    delta['prev']  = dataStore.slices.get(1).get('prevMoves').toDelta();
    LOG.debug('leaving with delta : ' + Log.dumpObject(delta));
    LOG.goOut();
    return delta;
  },
	/**
	 * addPlayersToDelta()
	 */
        // 機能： Player情報をstateに送るための差分をdeltaにセットする
        // 返値 : stateに載せる情報としてdeltaを作成し返す
  addPlayersToDelta: function addPlayersToDelta() { // GameController
    var delta = {};
    LOG.getInto('GameController#addPlayersToDelta');
    
    LOG.debug('player1 : ' + this.player1.toString());
    LOG.debug('player2 : ' + this.player2.toString());

    delta['players'] = this.players.join(',');
    this.blackplayers.push(this.player1);
    delta['blacks'] = this.blackplayers.pluck('name').join(',');
    LOG.debug('blackplayers : ' + this.blackplayers.pluck('name').join('<br>'));
    this.whiteplayers.push(this.player2);
    delta['whites'] = this.whiteplayers.pluck('name').join(',');
    LOG.debug('whiteplayers : ' + this.whiteplayers.pluck('name').join('<br>'));
    delta['mode'] = 'playing';
    if (this.playerSetting == 'review') delta['mode'] = 'review';
    LOG.debug('leaving with : ' + Log.dumpObject(delta));
    LOG.goOut();
    return delta;
  },
	/**
	 * createPlayer(bs, ws)
	 */
        // 前提： 複数人のプレイヤーがいて、先手bs, 後手psとして受け取る
        // 機能： 2つのPlayerオブジェクトを生成
        //        this.blackplayers, this.whiteplayersをセットする
        // 返値 : stateに載せる情報としてdeltaを作成し返す
  createPlayer: function createPlayer(bs, ws) { // GameController
    LOG.getInto('GameController#createPlayer');
    var delta = {};
    var viewer = wave.getViewer().getId();
    var viewerDisplayName = wave.getViewer().getDisplayName();
    var b = bs.split(',')[0];
    var w = ws.split(',')[0];
    LOG.debug('viewer : ' + viewer);
    LOG.debug('viewerDisplayName : ' + viewerDisplayName);
    LOG.debug('b : ' + b + ',  w : ' + w);
    // Player オブジェクトを生成
    this.player1 = new Player('player1', b, b==viewer || b==viewerDisplayName);
    this.player2 = new Player('player2', w, w==viewer || w==viewerDisplayName);
    LOG.debug('player1 : ' + this.player1.toString());
    LOG.debug('player2 : ' + this.player2.toString());
    // blackplayers, whiteplayersの各配列におく
    this.blackplayers.push(this.player1);
    LOG.debug('blackplayers : ' + this.blackplayers.pluck('name').join('<br>'));
    this.whiteplayers.push(this.player2);
    LOG.debug('whiteplayers : ' + this.whiteplayers.pluck('name').join('<br>'));
    // state 用にdeltaに登録
    delta['blacks'] = this.blackplayers.pluck('name').join(',');
    delta['whites'] = this.whiteplayers.pluck('name').join(',');
    delta['mode'] = 'playing';
    // playersにも登録しておく（途中から受け取ったユーザのために）
    if (!this.players.include(b)) this.players.push(b);
    if (!this.players.include(w)) this.players.push(w);
    LOG.goOut();
    return delta;
  },
	/**
	 * message(message)
	 */
  message: function message(message) { // GameController
    LOG.getInto('GameController#message');
    if (!this.messageElm) {
      this.messageElm = $('message-body');
    }
    if (this.messageElm) {
      this.messageElm.innerHTML = message;
    }
    LOG.debug(message);
    LOG.goOut();
  },
	/**
	 * clearMessage()
	 */
  clearMessage: function clearMessage() {
    this.message('');
  },
	/**
	 * nextTurn()
	 */
  nextTurn: function nextTurn() { // GameController
    LOG.getInto('GameController#nextTurn');
    this.controlPanel.update('playing');
    this.clearMessage();
    LOG.goOut();
  },
	/**
	 * readTurnFromState(state)
	 */
	// 機能 stateから新しいturnを読み取り返す。このturn値が次のstateが
	//      降ってくるまでのゲーム全体のturn値の基礎となる。
	//      stateにturn情報がない場合はtrueを返す
	// 入力 state
	// 出力 turn 論理値 stateから読み取る
  readTurnFromState: function readTurnFromState(state) { // GameController
    LOG.getInto('GameController#readTurnFromState');
    var ret = state.get('turn');
    LOG.debug('state[turn] : ' + ret);
    if (!ret){
      LOG.fatal('cannot get read turn from state!, so, returning true.');
      LOG.goOut();
      return true;
/*  この処理は無くしたい。
      ret = state.get('board');
      LOG.debug('state[board] : ' + Object.toJSON(ret));
      if(ret){
        ret = ret.evalJSON().turn;
        //ret = ret['turn'];
        LOG.debug('state[board][turn] : ' + Object.toJSON(ret));
      } else {
        ret = true;
      }
*/
    }
    switch(ret){
      case 't':
      case 'true':  ret = true;
        break;
      case 'f':
      case 'false': ret = false;
        break;
      default:
        LOG.fatal('wrong value read as turn from state!: ' + JSON.stringify(ret));
        break;
    }
    LOG.debug('returning : ' + JSON.stringify(ret));
    LOG.goOut();
    return ret;
  },
	/**
	 * getTurn()
	 */
  getTurn: function getTurn() { // GameController
    // turnは論理値。countが偶数ならtrueで先手番、奇数ならfalseで後手番。
    LOG.getInto('GameController#getTurn',Log.DEBUG2);
    //var ret = (this.count % 2 == 0);
    //var ret = this.game.board.turn;
    var ret = (wave.state.get('turn') == 't');
    //LOG.debug2('count is ' + this.count + ', so returning with : ' + ret);
    LOG.debug('現在のturn : ' + ret);
    LOG.goOut(Log.DEBUG2);
    return ret;
  },
	/**
	 * thisTurnPlayer()
	 */
  thisTurnPlayer: function thisTurnPlayer() { // GameController
    LOG.getInto('GameController#thisTurnPlayer',Log.DEBUG2);
    var ret = this.getTurn() ? this.player1 : this.player2;
    LOG.debug('現在の手番のplayer : ' + ret);
    LOG.goOut(Log.DEBUG2);
    return ret;
  },
	/**
	 * isViewersTurn()
	 */
        // 現在、viewerのturnならtrueを返す
  isViewersTurn: function isViewersTurn() { // GameController
    LOG.getInto('GameController#isViewersTurn',Log.DEBUG2);
    var ret = this.thisTurnPlayer().isViewer;
    LOG.debug('現在はviewerのturnか？: ' + ret);
    LOG.goOut(Log.DEBUG2);
    return ret;
  },
	/**
	 * reportActEnds(player, movingPieceType,moveTo, capturedPieceType)
	 */
  reportActEnds: function reportActEnds(player, movingPieceType, moveTo, capturedPieceType) { // GameController
    var winner = null;
    LOG.getInto('GameController#reportActEnds');
    LOG.debug('player: ' + player.name);
    LOG.debug('movingPieceType: ' + movingPieceType);
    LOG.debug('moveTo: ' + moveTo.inspect());
    LOG.debug('capturedPieceType: ' + capturedPieceType);
    if (winner = this.game.checkFinish(player, movingPieceType, moveTo, capturedPieceType))
      this.finish(winner);
    else
      this.sendDelta(this.makeDelta('continue'));
    LOG.goOut();
  },
	/**
	 * finish()
	 */
  finish: function finish(winner) { // GameController
    LOG.getInto('GameController#finish');
    this.message(winner.shortName() + t('win'));
    this.sendDelta(this.makeDelta('finish', winner));
    LOG.goOut();
  },
	/**
	 * pieceSelect(str)
	 */
        // 入力 : str 文字列 駒の表現種類をあらわす文字列
	//        Options window のpiece-selectリストで選択された値
	//        例: img:CSA1, chr:serif
        // 出力 : なし
        // 機能 : 駒の表現方法を指定されたものに変更する
  pieceSelect: function pieceSelect(str) { // GameController
    LOG.getInto('GameController#pieceSelect'); 
    LOG.debug('str : ' + Object.toJSON(str));
    var ary = str.split(':');
    var imgOrTxt = ary[0];
    var name = ary[1];
    if (imgOrTxt == 'img') {
      this.options.isImg = true;
      this.options.isTxt = false;
      $$('.piece').each(function(e){
        e.addClassName('isImg');
        e.removeClassName('isTxt');
      });
    } else {
      this.options.isImg = false;
      this.options.isTxt = true;
      $$('.piece').each(function(e){
        e.addClassName('isTxt');
        e.removeClassName('isImg');
      });
    }
    LOG.goOut();
  },
	/**
	 * toString()
	 */
  toString: function toString() { // Game
    var ret = '';
/*
    var json = this.toJSON();
    for (var key in json) {
      ret += key + ' : ' + json[key] + '\n';
    }
    return ret;
*/
    return 'dummy';
  },
	/**
	 * toHTML()
	 */
  toHTML: function toHTML() {
    var ret = '<table>';
    var json = this.toJSON();
    for (var key in json) {
      ret += '<tr><td>' + key + '</td><td>' + json[key] + '</td></tr>\n';
    }
    ret += '</table>';
    return ret;
  },
	/**
	 * getViewer()
	 */
  getViewer: function getViewer(){ // GameController
    LOG.getInto('GameController#getViewer');
    if(wave){
      if(wave.getViewer()){
        this.viewer = wave.getViewer().getId();
      } else {
        LOG.fatal('wave.getViewer is null');
        alert('wave.getViewer is null');
      }
    } else {
      LOG.fatal('wave is null');
      alert('wave is null');
    }

    LOG.debug('viewer: ' + this.viewer);
    LOG.goOut();
  },
	/**
	 * prepareFromState(state)
	 */
  prepareFromState: function prepareFromState(state) { // GameController
    LOG.getInto('GameController#prepareFromState');
    this.controlPanel.update('playing');
    this.mainRoutine();
    LOG.warn('leaving Game#prepareFromState');
    LOG.goOut();
  },
	/**
	 * getPlayersFromState(state)
	 */
  getPlayersFromState: function getPlayersFromState(state) { // GameController
    var ps, p, bs, ws;
    LOG.getInto('GameController#getPlayersFromState');
    switch(this.mode){
      case 'onePlayer':
        if (ps = state.get('players')){
          LOG.debug('players : ' + ps);
          this.players = ps.split(',');
          LOG.debug('this.players : ' + this.players)
        } else {
          LOG.fatal('players not found in state');
        }
            break;
      case 'preparePlayers':
        if (ps = state.get('players')){
          LOG.debug('players : ' + ps);
          this.players = ps.split(',');
          LOG.debug('this.players : ' + this.players)
          if(!this.player1){
            this.setPlayersOrder();
            if(this.isViewersTurn()) this.game.initialDraggable(this.viewersTurn());
          }
        } else {
          LOG.fatal('players not found in state');
        }
            break;
      case 'playing':
      case 'over':
        bs = state.get('blacks');  ws = state.get('whites');
        if (bs && ws){
          LOG.debug('blacks : ' + bs + ',  ' + 'whites : ' + ws);
          if(!this.player1){
            this.createPlayer(bs, ws);
          }
        } else {
          LOG.fatal('blacks and whites are not found in state');
        }
            break;
      default:
    }
    LOG.goOut();
  },
	/**
	 * viewersTurn()
	 */
        // viewerが先手なら'black'を返し
        //         後手なら'white'を返す
        // viewerが先手でも後手でもなければfalseを返す
  viewersTurn: function viewersTurn(){ // GameController
    LOG.getInto('GameController#viewersTurn');
    var ret = false;
    var viewer = wave.getViewer().getId();
    switch(viewer){
      case this.player1.name:
        ret = 'black';
        break;
      case this.player2.name:
        ret = 'white';
        break;
      default:
        ret = false;
        break;
     } 
    LOG.debug('returning : ' + ret);
    LOG.goOut();
    return ret;
  },
   
	/**
	 * debug_dump()
	 */
  debug_dump: function debug_dump(){ // GameController
    LOG.getInto({ "background":"#ff88aa","font-size":"12px" });
    LOG.warn('debug_dump enterd', {'indent':2});
    try{
      var state = wave.getState();
    } catch(e){
      LOG.error('cannot get state : ' + e);
    }
    if(state)
      LOG.warn(state.toString());
    else
      LOG.error('state is null');
    var obj = {};
    //obj['all pieces']    = this.allPieces().length;
    obj['player1']	 = (this.player1 ? this.player1.toDebugString():null);
    obj['player2']	 = (this.player2 ? this.player2.toDebugString():null);
//    obj['playingViewer'] = (this.playingViewer ? this.playingViewer.toDebugString():null);
    obj['top']		 = this.top;
    //obj['board']	 = this.board.toDebugString();
    //obj['board']	 = this.board.toString();
    //obj['blackStand']	 = this.blackStand.toString();
    //obj['whiteStand']	 = this.whiteStand.toString();
    //obj['Cell']	 = Cell.all.invoke('toDebugString').join('<br>');
    //obj['PieceOnBoard']	 = '<br>' + this.board.cells.flatten().findAll(function(c){ return c.piece != null; }).invoke('toDebugString').join('<br>');
    //obj['PieceOnBlackStand']	 = '<br>' + this.blackStand.elm.childElements().pluck('obj').invoke('toDebugString').join('<br>');
    //obj['PieceOnWhiteStand']	 = '<br>' + this.whiteStand.elm.childElements().pluck('obj').invoke('toDebugString').join('<br>');
    obj['Droppables']	= Droppables.toDebugString();
    obj['Draggables']	= Draggables.toDebugString();
    for(var p in obj){
      LOG.warn(p + ' : ' + obj[p]);
    }
    LOG.warn('leaving debug_dump', {'indent':-2});
    LOG.goOut();
  }
});
