/**
 * ShogiGame
 */
ShogiGame = Class.create({
	/**
	 * initialize(settings, log)
	 */
  initialize: function initialize(settings, gameController) { // ShogiGame
// for test only
window.gameController = gameController;
window.gameController.game = this;

    this.controller = gameController;
    this.log = gameController.log;
    this.log.getInto('ShogiGame#initialize');
    this.log.warn('start ShogiGame log');
    this.width = 10;  // 0 is dummy
    this.height = 10;
    this.settings = settings;
    this.container = $(settings.containerId);
    this.container.style.width = this.width * 35 + 'px';
    this.board = new Board(this.container, this);
    this.log.warn('Board created.');
    this.blackStand = new Stand('black-stand', this);
    this.whiteStand = new Stand('white-stand', this);
    this.log.warn('Stands created.');
    this.makeConfirmActionElement();
    this.log.warn('leaving ShogiGame#initialize',{'indent':-1, 'date':true,3:{'color':'green'}});
    this.log.goOut();
    // this.debug_dump();
  },
	/**
	 * findMove(actionContents)
	 */ 
        // 入力 : 配列 actionContents 駒の動きをあらわした配列
	// 出力 : 論理値
        // 機能 : 入力の動きがnextMovesの中にあるか探し
	//        無ければfalseを返す
	//        あればそのmoveのnxt_bidをtargetとしてsendDeltaする
  findMove: function findMove(actionContents) { // ShogiGame
    this.log.getInto('ShogiGame#findMove');
    var chr = actionContents[0].chr;
    var from = actionContents[1].type == 'stand' ? 0 :
                 actionContents[1].x * 10 + actionContents[1].y;
    var to = actionContents[2].x * 10 + actionContents[2].y;
    var promote = actionContents[0].promote_type ? false : true;
    if(actionContents[0].type == 'Gold' || 
       actionContents[0].type == 'King')
      promote = false;  
    this.log.debug('chr : ' + chr + ', from : ' + from + ', to : ' + to + ', promote : ' + promote);
    var ret = this.controller.handler.nextMoves.find(function(e){
      return (e.piece == chr) && (e.m_from == from) &&
             (e.m_to == to) && (e.promote == promote);
    });
    this.log.debug('ret : ' + Object.toJSON(ret));
    this.log.goOut();
    if(ret){
      this.controller.sendDelta( this.controller.handler.makeReviewDelta(ret.nxt_bid) );
    } else
      return false;
  },
	/**
	 * respondValidity(actionContents)
	 */ 
        // GameControllerからactionの正当性を問われる
        // 
  respondValidity: function respondValidity(actionContents) { // ShogiGame
    this.log.getInto('ShogiGame#respondValidity');
    var ret = moveValidate(actionContents);
    this.log.goOut();
    return ret;
  },
	/**
	 * getPlayer(player)
	 */ 
  getPlayer: function getPlayer(player) { // ShogiGame
    this.log.getInto('ShogiGame#getPlayer');
    this.log.debug('player : ' + player.toDebugString());
    this.player = player;
    this.log.goOut();
  },
	/**
	 * setStandPosition()
	 */ 
  setStandPosition: function setStandPosition() { // ShogiGame
    this.log.getInto('ShogiGame#setStandPosition');
    $('container').style.width = 180 + (this.width)*30 + 'px';
    if(this.controller.top !== 1){
      $('bottom-stand').appendChild(this.blackStand.elm);
      $('top-stand').appendChild(this.whiteStand.elm);
      this.log.debug('blackStand is set to bottom beacuse top is ' + this.controller.top);
    } else {
      $('bottom-stand').appendChild(this.whiteStand.elm);
      $('top-stand').appendChild(this.blackStand.elm);
      this.log.debug('blackStand is set to top beacuse top is ' + this.controller.top);
    }
    $('bottom-stand').style.height = (this.height - 1)*30 + 'px';
    $('bottom-stand').style.margin = (this.height - 3)*30 + 'px 10px 0px 0px';
    $('top-stand').style.height = (this.height - 1)*30 + 'px';
    $('shogi').style.height = 30 + (this.height)*30 + 'px';
    $('shogi').style.width = 80 + (this.width)*30 + 'px';
    this.log.goOut();
  },
	/**
	 * show()
	 */
  show: function show() { // ShogiGame
    this.log.warn('game.show');
    //this.board.show();
  },
	/**
	 * reverse()
	 */
  reverse: function reverse() { // ShogiGame
    this.controller.log.getInto('ShogiGame#reverse');
    var tmp = null;
    this.controller.top = (this.controller.top === 0 ? 1 : 0);
    this.controller.top_by_viewer = this.controller.top;
    this.controller.message('top became ' + this.controller.top);
    this.controller.controlPanel.reverse();
    this.board.reverse();
    this.board.adjust();
    if($('top-stand') && $('bottom-stand')){
      if(this.controller.top == 0){
        tmp = $('top-stand').removeChild($('white-stand'));
        tmp = $('bottom-stand').replaceChild($('black-stand'),tmp);
        $('top-stand').appendChild(tmp);
      } else {
        tmp = $('top-stand').removeChild($('black-stand'));
        tmp = $('bottom-stand').replaceChild($('white-stand'),tmp);
        $('top-stand').appendChild(tmp);
      }

      tmp = $$('#top-stand img', '#bottom-stand img');
      if(tmp.size() > 0){
        tmp.invoke('toggleClassName', 'top');
        tmp.invoke('toggleClassName', 'bottom');
      }
    }
    this.controller.log.goOut();
  },
	/**
	 * toString()
	 */
  toString: function toString() { // ShogiGame
/*
    var ret = '';
    var json = this.toJSON();
    for (var key in json) {
      ret += key + ' : ' + json[key] + '\n';
    }
    return ret;
*/
    return 'ShogiGame';
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
	 * askPlayersEnough(players)
	 */
  askPlayersEnough: function askPlayersEnough(players){ // Game
    this.log.getInto('ShogiGame#askPlayersEnough');
    this.log.debug('contents of players : ' + players.join(','));
    var ret = (players.length > 1);
    this.log.goOut();
    return ret;
  },
        /**
         * allPieces()
         */
  allPieces: function allPieces() { // ShogiGame
    return $A(this.board.cells.flatten().pluck('piece'), this.blackStand.pieces, this.whiteStand.pieces).flatten().compact();
  },
	/**
	 * boardReadFromDB(boardObj)
	 */
	// DBから受け取ったボード情報オブジェクトを読み込む
  boardReadFromDB: function boardReadFromDB(boardObj) { // ShogiGame
    this.log.getInto('Game#boardReadFromDB: ');
    this.board.read(boardObj['board'] || this.board.initialString);
    this.blackStand.read(boardObj['black'] || this.blackStand.initialString);
    this.whiteStand.read(boardObj['white'] || this.whiteStand.initialString);
    this.log.goOut();
  },
	/**
	 * boardReadFromState(state)
	 */
  boardReadFromState: function boardReadFromState(state) { // ShogiGame
    this.log.getInto('Game#boardReadFromState: ');
    this.board.read(state.get('board', this.board.initialString));
    this.blackStand.read(state.get('bstand', this.blackStand.initialString));
    this.whiteStand.read(state.get('wstand', this.whiteStand.initialString));
    this.log.goOut();
  },
	/**
	 * initialDraggable(turn)
	 */
        // turnには'black','white',falseのいずれかが渡る。
        // falseならなにもしない
        // 'black'なら先手のコマにdraggableをつける
        // 'white'なら後手のコマにdraggableをつける
  initialDraggable: function initialDraggable(turn){ // ShogiGame
    var viewersPiece;
    this.log.getInto('ShogiGame#initialDraggable');
    if(!turn){
      this.log.debug('return withoud adding draggable');
      this.log.goOut();
      return;
    }
    if(turn == 'black'){
      viewersPiece = this.allPieces().findAll(function(e){ return e.chr == e.chr.toUpperCase(); });
    } else {
      viewersPiece = this.allPieces().findAll(function(e){ return e.chr == e.chr.toLowerCase(); });
    }
    this.log.debug('viewersPiece # : ' + viewersPiece.length);
    viewersPiece.invoke('addDraggable','initially added draggable');
    viewersPiece.each(function(e, index){
      this.log.debug(index + ' : drag -> ' + e.drag.toString());
    }.bind(this));
    this.log.goOut();
  },
	/**
	 * toggleDraggable()
	 */
  toggleDraggable: function toggleDraggable(){ // ShogiGame
    this.log.getInto('ShogiGame#toggleDraggable');
    this.log.debug('Draggables.drags #: ' + Draggables.drags.length);
       // dragsの中身をログに書き出してみる
    if(Draggables.drags.length > 0){
      this.log.debug('contents of Draggables.drags :');
      Draggables.drags.each(function(e){
        var str = e.element && e.element.obj ? e.element.obj.toDebugString() : e.toString();
        this.log.debug(str);
      }.bind(this));
    }
    this.log.debug(' -- contents of Draggables.drags ends -- ');

    // 本処理
    this.log.warn('processing pieces of board.cells');
    this.board.cells.flatten().pluck('piece').compact().invoke('toggleDraggable');
    this.log.warn('processing blackStand');
    this.blackStand.pieces.invoke('toggleDraggable');
    this.log.warn('processing whiteStand');
    this.whiteStand.pieces.invoke('toggleDraggable');

       // 確認のため再度dragsの中身をログに書き出してみる
    if(Draggables.drags.length > 0){
      this.log.debug('again, contents of Draggables.drags :');
      this.log.debug('Draggables.drags #: ' + Draggables.drags.length);
      Draggables.drags.each(function(e){
        var str = e.element && e.element.obj ? e.element.obj.chr : e.toString();
        this.log.debug(str);
      }.bind(this));
    }
    this.log.goOut();
  },
	/**
	 * proceedAsItis(actionContents)
	 */
  proceedAsItis: function proceedAsItis(actionContents) { // ShogiGame
    this.log.getInto('ShogiGame#proceedAsItis');
    var ret = actionContents[0].proceed;
    this.log.goOut();
    return ret;
  },
	/**
	 * promotePiece(actionContents)
	 */
  promotePiece: function promotePiece(actionContents) { // ShogiGame
    var log = window.gameController.log;
    log.getInto('ShogiGame#promotePiece');
    //log.debug('actionContents : ' + Log.dumpObject(actionContents));
    log.debug('actionContents[0] : ' + actionContents[0].toDebugString());
    var ret = actionContents[0].promote;
    log.goOut();
    return ret;
  },
	/**
	 * makeConfirmActionElement()
	 */
  makeConfirmActionElement: function makeConfirmActionElement() { // ShogiGame
    this.log.getInto('ShogiGame#makeConfirmActionElement');
    // userがクリックする要素を作成
/*
    this.confirmActionElement = new Element('div',{id:'promoteOrNot', className:'confirmAction' });
    this.yesElement = new Element('div',{id:'yesElement'});
    this.noElement = new Element('div',{id:'noElement'});
    this.confirmActionElement.appendChild(this.yesElement);
    this.confirmActionElement.appendChild(this.noElement);
    this.confirmActionElement.style.display = 'block';
*/
    this.confirmActionElement = $('promoteOrNot');
    this.yesElement = $('yesElement');
    this.noElement = $('noElement');
    this.log.goOut();
  },
  	/**
	 * confirmActionByUser(actionContents)
	 */
        // action内容をユーザに提示し、ユーザからそれでよいかどうか確認をとる
        // 成り・不成りを確認することを想定
  confirmActionByUser: function confirmActionByUser(actionContents) { // ShogiGame
    this.log.getInto('ShogiGame#confirmActionByUser');
    // userがクリックする要素を監視開始
    this.confirmActionElement.observe('click',this.controller.getResponseToConfirmActionByUser.bindAsEventListener(actionContents));
    //this.yesElement.observe('click', this.promotePiece(actionContents));
    //this.noElement.observe('click', this.proceedAsItis(actionContents));
    // userがクリックする要素を表示
    //actionContents[2].elm.appendChild(this.confirmActionElement);
    //actionContents[2].elm.hide();
    this.confirmActionElement.show();
    //alert('cell top : ' +  actionContents[2].elm.style.top);
    //alert('cell left : ' +  actionContents[2].elm.style.left);
    this.confirmActionElement.style.left = actionContents[2].elm.cumulativeOffset()[0];
    this.confirmActionElement.style.top = actionContents[2].elm.cumulativeOffset()[1];
    this.confirmActionElement.style.position='absolute';
    this.confirmActionElement.style.zIndex=1000;
    this.confirmActionElement.style.width=100;
    this.confirmActionElement.style.hight=100;
    this.log.goOut();
  },
	/**
	 * doAction(actionContents)
	 */
	// 入力 : 配列 actionContents : [piece, fromObj, toCell]
	// 成るというactionの場合、pieceは成った状態でここにくる
  doAction: function doAction(actionContents) { // ShogiGame
    var piece = actionContents[0];
    var fromObj = actionContents[1];
    var toCell = actionContents[2];
    var capturedPieceType = null;
    var movingPieceType = piece.type;
    var moveTo = [toCell.x, toCell.y];
    this.log.getInto('ShogiGame#doAction');
    this.log.debug('piece : ' + piece.toDebugString());
    this.log.debug('fromObj : ' + fromObj.toDebugString());
    this.log.debug('toCell : ' + toCell.toDebugString());

    // この動きがすでにnextMovesのなかにあるならばその動作をすればよい。
    this.findMove(actionContents);

    if (toCell.piece){
      this.log.warn('piece moving and capturing. : ');
      this.log.debug('draggable.obj is : ' + piece.toDebugString());
      this.log.debug('toCell.piece is : ' + toCell.piece.toDebugString());
      capturedPieceType = toCell.piece.type;
      toCell.piece.gotoOpponentsStand();
    } else {
      this.log.warn('piece moving without capturing.');
    }
    if(fromObj.type == 'cell'){
      fromObj.piece.sitOnto(toCell);
      fromObj.piece = null;
    } else if(fromObj.type == 'stand'){
      fromObj.removeByObj(piece);
      piece.sitOnto(toCell);
    }

    this.controller.reportActEnds(this.controller.playerInTurn(), movingPieceType, moveTo, capturedPieceType);
    
    this.log.goOut();
  },
	/**
	 * doActionWithPromote(actionContents)
	 */
  doActionWithPromote: function doActionWithPromote(actionContents) { // ShogiGame
    var piece = actionContents[0];
    var fromObj = actionContents[1];
    var toCell = actionContents[2];
    var capturedPieceType = null;
    var movingPieceType = piece.type;
    var moveTo = [toCell.x, toCell.y];
    this.log.getInto('ShogiGame#doActionWithPromote');
    this.log.debug('piece : ' + piece.toDebugString());
    this.log.debug('fromObj : ' + fromObj.toDebugString());
    this.log.debug('toCell : ' + toCell.toDebugString());
    if (toCell.piece){
      this.log.warn('piece moving and capturing. : ');
      this.log.debug('draggable.obj is : ' + piece.toDebugString());
      this.log.debug('toCell.piece is : ' + toCell.piece.toDebugString());
      capturedPieceType = toCell.piece.type;
      toCell.piece.gotoOpponentsStand();
    } else {
      this.log.warn('piece moving without capturing.');
    }
    if(fromObj.type == 'cell'){
      fromObj.piece.sitOnto(toCell);
      fromObj.piece = null;
    } else if(fromObj.type == 'stand'){
      fromObj.removeByObj(piece);
      piece.sitOnto(toCell);
    }

    this.controller.reportActEnds(this.controller.playerInTurn(), movingPieceType, moveTo, capturedPieceType);
    
    this.log.goOut();
  },
	/**
	 * mateCheck(moveTo)
	 */
        // 現在の盤面で指した直後の、つまり手番の
        // ライオンが詰んでいるかどうか判定する
        // 入力値：ライオンの位置
        // 返り値：詰んでいればtrue, いなければfalse
  mateCheck: function mateCheck(moveTo){ // ShogiGame
    this.log.getInto('ShogiGame#mateCheck');
    this.log.debug('lion at ' + moveTo.inspect() + ' is mated?');
    var ret = false;
    // 対象のライオンの位置
    var x = parseInt(moveTo[0]);
    var y = parseInt(moveTo[1]);
    var cell, piece;
    // 敵の駒(手番でない駒) の利きにいるかどうか
      // x,yの周囲のマスに敵のコマがいたら
      // その駒の利きにx,yが含まれるか
    for(var i = -1; i < 2; i++){
      for(var j = -1; j < 2; j++){
        cell = this.board.getCell(x+i,y+j);
        if(cell){
          piece = this.board.getCell(x+i,y+j).piece;
          if(piece){
            this.log.debug('i,j,piece : ' + i + ', ' + j + ', ' + piece.toDebugString());
            if((!piece.isTurn()) && (ret = piece.canMoveTo(x,y))){
              this.log.debug('this piece can move to : ' + x + ', ' + y );
              this.log.debug('so, the lion is mated');
              break;
            }
          }
        }
      }
      if(ret) break;
    }
    this.log.debug('leaving with : ' + ret);
    this.log.goOut();
    return ret;
  },
	/**
	 * checkFinish()
	 */
        // 指し手についての情報をうけとり、それを指したplayerが勝ったかどうか判定する
        // 返り値：どちらかが勝ちだったら勝ったplayerのオブジェクトを返す 
        //         勝負がついていなければnullを返す
  checkFinish: function checkFinish(player, movingPieceType, moveTo, capturedPieceType){ // ShogiGame
    this.log.getInto('ShogiGame#checkFinish');
    var opponent_player = (player.name == this.controller.player1.name) ? this.controller.player2 : this.controller.player1;
    this.log.debug('opponent_player : ' + opponent_player.toDebugString());
    var ret = null;
    // ライオンが詰んでいるかどうか
    // var mated = (movingPieceType == 'lion') ? this.mateCheck(moveTo) : false;
    // 相手のライオンを捕獲したかどうか
    var getLion = (capturedPieceType == 'lion');
    // ライオンが動いたかどうか
    var isLion = (movingPieceType == 'lion');
    // 最奥に到達したかどうか
    var reachEnd = (this.controller.getTurn() && (moveTo[1] == 1)) || (!this.controller.getTurn() && (moveTo[1] == 9));
    // 勝利判定
    if (getLion){
      ret = player;
    } else {
      if (isLion && reachEnd){
        if(this.mateCheck(moveTo)){
          ret = opponent_player;
        } else {
          ret = player;
        } 
      }
    }
    this.log.warn('checkFinish leaving with : ' + ret);
    this.log.goOut();
    return ret;
  },
	/**
	 * debug_dump()
	 */
  debug_dump: function debug_dump(){ //ShogiGame
    this.log.getInto('ShogiGame#debug_dump', { "background":"#ff88aa","font-size":"12px" });
    this.log.setLevel(Log.ERROR);
    try{
      var state = wave.getState();
    } catch(e){
      this.log.error('cannot get state : ' + e);
    }
    if(state)
      this.log.warn(state.toString());
    else
      this.log.error('state is null');
    var obj = {};
    obj['all pieces']    = this.allPieces().length;
    obj['player1']	 = (this.player1 ? this.player1.toDebugString():null);
    obj['player2']	 = (this.player2 ? this.player2.toDebugString():null);
    obj['top']		 = this.controller.top;
    //obj['board']	 = this.board.toDebugString();
    obj['board']	 = this.board.toString();
    obj['blackStand']	 = this.blackStand.toString();
    obj['whiteStand']	 = this.whiteStand.toString();
    //obj['Cell']	 = Cell.all.invoke('toDebugString').join('<br>');
    //obj['PieceOnBoard']	 = '<br>' + this.board.cells.flatten().findAll(function(c){ return c.piece != null; }).pluck('piece').invoke('toDebugString').join('<br>');
    //obj['PieceOnBlackStand']	 = '<br>' + this.blackStand.elm.childElements().pluck('obj').invoke('toDebugString').join('<br>');
    //obj['PieceOnWhiteStand']	 = '<br>' + this.whiteStand.elm.childElements().pluck('obj').invoke('toDebugString').join('<br>');
    //obj['Droppables']	= Droppables.toDebugString();
    //obj['Draggables']	= Draggables.toDebugString();
    for(var p in obj){
      this.log.error(p + ' : ' + obj[p]);
    }
    this.log.setLevel(Log.DEBUG);
    this.log.debug('leaving debug_dump');
    this.log.goOut();
  }
});

/**
 * common functions
 */
	/**
	 * moveValidate(actionContents)
	 */
        // actionの正当性を判断して返す
        // actionContents : [piece, fromObj, toCell]
        // 返り値 :'needConfirm' ユーザconfirmを求める手だという意味 
        // 返り値 :'mustPromote' ルール上、成らなければいけない手だという意味 
        // 返り値 :'badAction' ルールにそわない手だという意味 
        // 返り値 :'normal' ルールにそい、そのまま進めてよい手だという意味 
function moveValidate(actionContents){
  window.gameController.log.getInto('ShogiGame#moveValidate');
  var piece = actionContents[0];
  var fromCell = actionContents[1];
  var toCell = actionContents[2];
  var ret = 'normal';
  window.gameController.log.debug('piece : ' + piece.toDebugString());
  window.gameController.log.debug('fromCell : ' + fromCell.toDebugString());
  window.gameController.log.debug('toCell : ' + toCell.toDebugString());

  for(;;){

    // 自分の手番の駒の上に進もうとしていないかCheck
    if (toCell.piece) {
      if (piece.isBlack() == toCell.piece.isBlack()){
        window.gameController.log.debug('piece.isBlack() : ' + piece.isBlack());
        window.gameController.log.debug('toCell.piece : ' + toCell.piece.toDebugString());
        window.gameController.log.debug('toCell.piece.isBlack() : ' + toCell.piece.isBlack());
        window.gameController.message(t('cannot_capture_yourown_piece')); ret = 'badAction';
        break;
      }
    }
    window.gameController.game.log.debug('own capturing check passed.');

    // 持ち駒を駒の上に打とうとしていないかCheck
    if((fromCell.type == 'stand') && toCell.piece) {
      window.gameController.message(t('already_occupied')); ret = 'badAction';
      break;
    }
    window.gameController.game.log.debug('put piece on filled cell check passed.');

    // Piece#canMoveのなかで処理しているのは、
      // 二歩を打とうとしていないか
      // 駒を飛び越えて指そうとしていないか
      // 駒の動きがルールに沿っているか
    if (!piece.canMove(fromCell, toCell)) {
      window.gameController.message(t('not_allowed')); ret = 'badAction';
      break;
    }
    window.gameController.log.debug('illegal move check passed.');

    // 成ろうとしているかCheck
    if (fromCell.type == 'cell'){
      ret = promoteCheck(actionContents);
      if (ret) break;
      else ret = 'normal';
    }
    window.gameController.log.debug('this move does not require promotion.');
    break;
  }
  window.gameController.log.debug('returning with : ' + ret);
  window.gameController.log.goOut();
  return ret;
}

	/**
	 * promoteCheck(actionContents)
	 */
        // 成ることができるコマの動き方なら
        // 返り値 :'needConfirm' ユーザconfirmを求める手だという意味 
        // 返り値 :'mustPromote' ルール上、成らなければいけない手だという意味 
        // そうでないならfalseを返す
function promoteCheck(actionContents){
  window.gameController.log.getInto('promoteCheck');
  var ret = false;
  var piece = actionContents[0];
  var player = piece.isBlack() ? window.gameController.player1 : window.gameController.player2;
  var fromCell = actionContents[1];
  var toCell = actionContents[2];
  window.gameController.log.debug('piece type : ' + piece.type);
  window.gameController.log.debug('fromCell : ' + fromCell.toDebugString());
  window.gameController.log.debug('toCell : ' + toCell.toDebugString());
  for(var i=0;i<1;i++){
    // 王様or金ならpromoteできないのでfalse
    if (piece.type == 'King' || piece.type == 'Gold'){
      window.gameController.log.debug('ret is set to false because piece type is ' + piece.type);
      ret = false;
      break;
    }
    // すでにpromoteしている駒ならpromoteできないのでfalse
    window.gameController.log.debug('すでにpromoteしている駒ならpromoteできないのでfalseをcheck : ' + piece.unpromote_type);
    if (piece.unpromote_type){
      window.gameController.log.debug('ret is set to false because piece has unpromote_type : ' + piece.unpromote_type);
      ret = false;
      break;
    }
    // 歩ならば１段目へ進むときは必ず成る
    window.gameController.log.debug('歩ならば１段目へ進むときは必ず成るかcheck');
    if (piece.type == 'Pawn' && toCell.isOpponentArea(player, 1)){
      window.gameController.log.debug('ret is set to mustPromote because Pawn is going to first line');
      ret = 'mustPromote';
      break;
    }
    // 香ならば１段目へ進むときは必ず成る
    window.gameController.log.debug('香ならば１段目へ進むときは必ず成るかcheck');
    if (piece.type == 'Lance' && toCell.isOpponentArea(player, 1)){
      window.gameController.log.debug('ret is set to mustPromote because Lance is going to first line');
      ret = 'mustPromote';
      break;
    }
    // 桂ならば2 or 1段目へ進むときは必ず成る
    window.gameController.log.debug('桂ならば１,２段目へ進むときは必ず成るかcheck');
    if (piece.type == 'kNight' && toCell.isOpponentArea(player, 2)){
      window.gameController.log.debug('ret is set to mustPromote because kNight is going to first or second line');
      ret = 'mustPromote';
      break;
    }
    // 敵陣へ動く場合は成ることができる
    window.gameController.log.debug('敵陣へ動く場合は成ることができるかCheck');
    if (toCell.isOpponentArea(player)){
      window.gameController.log.debug('ret is set to needConfirm because piece is going to OpponentArea');
      ret = 'needConfirm';
      break;
    }
    // 敵陣から動く場合は成ることができる
    window.gameController.log.debug('敵陣から動く場合は成ることができるかCheck');
    if (fromCell.isOpponentArea(player)){
      window.gameController.log.debug('ret is set to needConfirm because piece is going from OpponentArea');
      ret = 'needConfirm';
      break;
    }
    break;
  } 
  window.gameController.log.debug('returning with : ' + ret);
  window.gameController.log.goOut();
  return ret;
}
