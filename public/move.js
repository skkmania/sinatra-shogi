//  move.js
//   2010/05/08

var CSApiece = { m : "NY", b : "KA", r : "HI", h : "UM", s : "GI",
                 t : "NG", l : "KY", n : "KE", p : "FU", q : "TO",
                 k : "OU", d : "RY", o : "NK", g : "KI" }
var CSApiecePromoted = { l : "NY", b : "UM", s : "NG", p : "TO", r : "RY", n : "NK" }

var Move = Class.create({
//  move  : ssddpb の6文字からなる。ssとddは数字2字。動きの前後の位置
//          pは動く前の駒の種類。アルファベット1文字。先後の区別を大文字、小文字でつける。bは成り不成を表すアルファベット1文字。tは成り、fは不成り。
//  move を漢字表現にする。pが大文字なら▲をつけ、小文字なら△をつける。
//  (ToDo: 成れるのに成らなかった場合、不成とつけたい。)
//   例: 3334Pf -> ▲3四歩(33)
//       5657pt -> △5七歩成(56)

  bid: null,
  mid: null,
  from: null,
  to: null,
  piece: null,
  promote: null,
  nxt_bid: null,
  toStr: null,

  initialize : function initialize(str){ // Move
    this.LOG = LOG;
    LOG.getInto('Move#initialize', Log.DEBUG2);
    if (str && str.length == 6){
      this.from    = parseInt(str.slice(0,2));
      this.to      = parseInt(str.slice(2,4));
      this.piece   = str.slice(4,5);
      this.promote = str.slice(-1) == 't' ? true : false;
      this.toStr   = str;
    }
    LOG.goOut(Log.DEBUG2);
    return this;
  },

  // DBから取得したデータのオブジェクトを読み、とりいれる。
  fromObj : function fromObj_Move(h){ // Move
    this.bid     = (Object.isNumber(h.bid) ?  h.bid : parseInt(h.bid));
    this.mid     = (Object.isNumber(h.mid) ?  h.mid : parseInt(h.mid));
    this.from    = (Object.isNumber(h.m_from) ?  h.m_from : parseInt(h.m_from));
    this.to      = (Object.isNumber(h.m_to) ?  h.m_to : parseInt(h.m_to));
    this.piece   = h.piece;
    this.promote = (h.promote === true) ? true :
                   ((h.promote === false) ? false : (h.promote == 't'));
    this.nxt_bid = (Object.isNumber(h.nxt_bid) ?  h.nxt_bid : parseInt(h.nxt_bid));
    return this;
  },

  // get_nxtMoves.rhtmlが返すハッシュをとりいれる。
  fromHash : function fromHash_Move(h){ // Move
    this.bid     = parseInt(h.bid);
    this.mid     = parseInt(h.mid);
    this.from    = parseInt(h.m_from);
    this.to      = parseInt(h.m_to);
    this.piece   = h.piece;
    this.promote = (h.promote == 't');
    this.nxt_bid  = parseInt(h.nxt_bid);
    return this;
  },

  // moves テーブルのレコードを配列にしたものを受け取ってその値をとりいれる
  fromRecord : function fromRecord_Move(ary){ // Move
    this.bid     = parseInt(ary[0]);
    this.mid     = parseInt(ary[1]);
    this.from    = parseInt(ary[2]);
    this.to      = parseInt(ary[3]);
    this.piece   = ary[4];
    this.promote = (ary[5] == 't');
    this.nxt_bid  = parseInt(ary[6]);
    return this;
  },

  isBlack : function() { // Move
    return this.piece == this.piece.toUpperCase();
  },

  toKanji : function(){
    // 洋数字は半角
    var sankaku = (this.isBlack()) ?  '▲' : '△' ;
    var pro = this.promote ? '成' : '';
    if (typeof this.to == "String"){
      var to_x   = this.to[0]-0;
      var to_y   = this.to[1]-0;
      var from_x = this.from[0]-0;
      var from_y = this.from[1]-0;
    } else {
      var to_x   = Math.floor(this.to / 10);
      var to_y   = this.to - 10*to_x;
      var from_x = Math.floor(this.from / 10);
      var from_y = this.from - 10*from_x;
    }
    return sankaku + to_x + '0一二三四五六七八九'[to_y] + Chr2Kanji[this.piece.toLowerCase()] + pro + '(' + this.from + ')';
  },
	/*
	 * toDebugString()
	 */
  toDebugString : function toDebugString(){ // Move
    var ret;
    ret =  'bid : ' + this.bid;
    ret += 'mid : ' + this.mid;
    ret += ', piece : ' + this.piece;
    ret += ', from : ' + this.from;
    ret += ', to : ' + this.to;
    ret += ', promote : ' + this.promote;
    ret += ', nxt_bid : ' + this.nxt_bid;
    return ret;
  },
	/*
	 * toMinimalString()
	 */
	// 駒の動きの最小表現、from,to,piece,promoteだけからなる６文字
  toMinimalString : function toMinimalString(){ // Move
    var ret;
    ret =  '' + this.from;
    ret += this.to;
    ret += this.piece;
    ret += (this.promote ? 't' : 'f');
    return ret;
  },
	/*
	 * minimalEqual(move)
	 */
	// 駒の動きの最小表現であるfrom,to,piece,promoteだけを比較する
	// 入力 : Moveオブジェクト move  他の指し手
	// 出力 : 論理値　moveと自身が最小レベルで等しければtrue
	//                そうでなければfalse
  minimalEqual : function minimalEqual(move){ // Move
    return (this.from    == move.from
         && this.to      == move.to
         && this.piece   == move.piece
         && this.promote == move.promote);
  },
	/*
	 * toLinkElement(kid, cnt)
	 */
  toLinkElement : function toLinkElement(kid, cnt) { // Move
    var ret = new Element('a',{ href:'/book/' + kid + '/' + cnt });
    ret =  this.bid + ',' + this.mid;
    ret += ',' + this.from + ',' + this.to;
    ret += ',' + this.piece;
    ret += ',' + (this.promote ? 't' : 'f');
    ret += ',' + this.nxt_bid;
    return ret;
  },
	/*
	 * toCSA()
	 */
	// 自身のCSA形式の文字列を返す
	// 入力 : なし
	// 出力 : 文字列 
  toCSA : function toCSA(){ // Move
    var ret = '';
    ret = (this.piece.toUpperCase() == this.piece) ? '+' : '-';
    if (this.from == 0) {
      ret += '00';
    } else {
      ret += this.from;
    }
    ret += this.to;
    ret += this.csaPiece();
    return ret;
  },
	/*
	 * csaPiece()
	 */
	// 自身のpieceのCSA形式の文字列を返す
	// 入力 : なし
	// 出力 : 2文字の文字列 : FU, KI, など
  csaPiece : function csaPiece(){ // Move
    if (this.promote){
      return CSApiecePromoted[this.piece.toLowerCase()];
    } else {
      return CSApiece[this.piece.toLowerCase()];
    }
  },
	/*
	 * toDelta()
	 */
  toDelta : function toDelta(){ // Move
    var ret;
    ret =  this.bid + ',' + this.mid;
    ret += ',' + this.from + ',' + this.to;
    ret += ',' + this.piece;
    ret += ',' + (this.promote ? 't' : 'f');
    ret += ',' + this.nxt_bid;
    return ret;
  },
	/*
	 * fromDelta()
	 */
  fromDelta : function fromDelta(str){ // Move
    var ary = str.split(',');
    this.bid     = (ary[0] == 'null' ? null : parseInt(ary[0]));
    this.mid     = (ary[1] == 'null' ? null : parseInt(ary[1]));
    this.from    = parseInt(ary[2]);
    this.to      = parseInt(ary[3]);
    this.piece   = ary[4];
    this.promote = (ary[5] == 't');
    this.nxt_bid = (ary[6] == 'null' ? null : parseInt(ary[6]));
    return this;
  },
	/*
	 * legalCheck()
	 */
  legalCheck : function legalCheck(){ // Move
    LOG.getInto();
    if (typeof this.to == "String"){
      var to_x = this.to[0]-0;
      var to_y = this.to[1]-0;
      var from_x = this.from[0]-0;
      var from_y = this.from[1]-0;
    } else {
      var to_x = Math.floor(this.to / 10);
      var to_y = this.to - 10*to_x;
      var from_x = Math.floor(this.from / 10);
      var from_y = this.from - 10*from_x;
    }
    LOG.debug('legalcheck@Move');
    LOG.debug('legal check this move : ' + Object.toJSON(this));
    switch(this.piece){
      case 'p':
        return (from_x == to_x) && (to_y - from_y == 1);
	break;
      case 'P':
        return (from_x == to_x) && (from_y - to_y == 1);
	break;
      case 'l':
        return (from_x == to_x) && (to_y - from_y > 0);
	break;
      case 'L':
        return (from_x == to_x) && (to_y - from_y < 0);
	break;
      case 'n':
        return (Math.abs(from_x - to_x) == 1) && (to_y - from_y == 2);
	break;
      case 'N':
        return (Math.abs(from_x - to_x) == 1) && (from_y - to_y == 2);
	break;
      case 's':
        return (from_x == to_x) && (to_y - from_y == 1) ||
               (Math.abs(from_x - to_x) == 1) && (Math.abs(from_y - to_y) == 1);
	break;
      case 'S':
        return (from_x == to_x) && (from_y - to_y == 1) ||
               (Math.abs(from_x - to_x) == 1) && (Math.abs(from_y - to_y) == 1);
	break;
      case 'g': case 'q': case 'm': case 'o': case 't':
        return ((from_x == to_x) && Math.abs(to_y - from_y) == 1) ||
	       ((Math.abs(from_x - to_x) == 1) && (from_y == to_y)) ||
	       ((to_y - from_y == 1) && (Math.abs(from_x - to_x) == 1));
	break;
      case 'G': case 'Q': case 'M': case 'O': case 'T':
        return ((from_x == to_x) && Math.abs(to_y - from_y) == 1) ||
	       ((Math.abs(from_x - to_x) == 1) && (from_y == to_y)) ||
	       ((from_y - to_y == 1) && (Math.abs(from_x - to_x) == 1));
	break;
      case 'b': case 'B':
        return Math.abs(from_x - to_x) == Math.abs(from_y - to_y);
	break;
      case 'h': case 'H':
        return Math.abs(from_x - to_x) == Math.abs(from_y - to_y) ||
               ((from_x == to_x) && Math.abs(to_y - from_y) == 1) ||
	       ((Math.abs(from_x - to_x) == 1) && (from_y == to_y));
	break;
      case 'r': case 'R':
        return (from_x == to_x) || (from_y == to_y);
	break;
      case 'd': case 'D':
        return (from_x == to_x) || (from_y == to_y) ||
               ((Math.abs(from_x - to_x) == 1) && (Math.abs(from_y - to_y) == 1));
	break;
      case 'k': case 'K':
        return (Math.abs(from_x - to_x) < 2) && (Math.abs(from_y - to_y) < 2);
	break;
      default:
        break;
    } // switch
    LOG.goOut();
  } // function legalCheck
});


// 指し手の集合 
// Hashの子クラス
//   key   : 指し手のmid。このmidはNumberでなければならない。
//   value : Move オブジェクト
var Moves = Class.create(Hash, {

	/*
	 * initialize(name)
	 */
        // 入力 文字列 name  自身がnextMovesなのか、prevMovesなのかを保持
  initialize : function($super, name){ // Moves
    this.LOG = LOG;
    LOG.getInto('Moves#initialize', Log.DEBUG2);
    $super();
    this.name = name;
    this.initArea();
    LOG.goOut(Log.DEBUG2);
  },
	/*
	 * initArea()
	 */
  initArea : function initArea() { // Moves
    LOG.getInto('Moves#initArea', Log.DEBUG2);
    this.area = areas[this.name];
    if (this.area.notInited) {
      this.initOnClick();
      this.area.window.open();
    }
    LOG.goOut(Log.DEBUG2);
  },
	/*
	 * initOnClick()
	 */
  initOnClick : function initOnClick(){ // Moves
    LOG.getInto('Moves#initOnClick');
    this.area.notInited = false;
    LOG.goOut();
    this.area.window_contents.observe('click',
      function(evt){ 
        this.LOG.getInto('Moves#initOnClick#observe');
        this.LOG.debug('id of clicked element : ' + evt.findElement('li').id);
        var mid = parseInt(evt.findElement('li').id.match(/\d+/)[0]);
        this.LOG.debug('mid of clicked element : ' + mid);
        var inner = evt.findElement('li').innerHTML;
        this.areaClicked(mid, inner);
        this.LOG.goOut();
      }.bind(this)
    );
  },
	/*
	 * areaClicked(target, inner)
	 */
	// クリックされた要素の情報をもとに必要な処理を行う
	// 入力 : target 数値 li要素のプロパティからとった数字
	//        inner  クリックされた要素のinnnerHTML
  areaClicked : function areaClicked(target, inner){ // Moves
    LOG.getInto('Moves#areaClicked');
    switch(this.name) {
      case 'nextMoves' :
	// この場合、targetによりクリックされた要素のmidが渡されてくる
        var move = dataStore.currentSlice().get('nextMoves').get(target);
        LOG.debug('bid found : ' + move.nxt_bid);
        window.gameController.makeAndSendReviewDelta(move.nxt_bid, move.toCSA());
        break;
      case 'prevMoves' :
        // この場合は、クリックされた要素の文字列を、各Moveオブジェクトと比べて、一致するもののbidを返す
        LOG.debug('clicked innerHTML is : ' + inner);
        var movePair = dataStore.currentSlice().get('prevMoves').find(
          function(pair){
             this.LOG.debug('value.toKanji : ' + pair.value.toKanji());
             return pair.value.toKanji() == inner;
           }.bind(this));
        if (movePair) {
          var moveObj = movePair.value;
        } else {
          LOG.fatal('Moves#areaClicked: clicked move pair was not found in currentSlice');
          LOG.fatal('currentSlice : ' + JSON.stringify(dataStore.currentSlice()));
          break;
        }
        if(moveObj) {
          var bid = moveObj.bid;
        } else {
          LOG.fatal('Moves#areaClicked: clicked move was not found');
          break;
        }
        if(bid) {
          LOG.debug('bid found : ' + bid);
          window.gameController.makeAndSendReviewDelta(bid);
        } else {
          LOG.fatal('Moves#areaClicked: bid was not found in move Object');
          break;
        }
        break;
      default :
        break;
    }
    LOG.goOut();
  },
	/*
	 * show()
	 */
	// 自身のwindowに内容を表示する
  show : function show(){ // Moves
    LOG.getInto('Moves#show');
    var ret = '';
    var str = '<ul>';
    var container = areaSettings[this.name]['container'];
    
    str += this.inject(ret, function(acc, pair){
      ret = acc +
            '<li id="' + container + pair.value.mid + '">' +
             pair.value.toKanji() +
            '</li>';
      return ret;
    });
    str += '</ul>';
    LOG.debug('str : ' + str);
    this.area.window_contents.update(str);
    LOG.goOut();
  },
	/*
	 * search(m)
	 */
	// 盤上で生成した指し手が、指し手候補にふくまれているかどうか調べるために使う関数
	// 比較はminimalEqualによる
	// 入力 : Moveオブジェクト
	// 出力 : Moveオブジェクトまたはfalse
	//        みつかったときはそのmove
	//        みつからないときはfalse
  search : function(m){ // Moves
    LOG.getInto('Moves#search');
    var res = this.find(function(pair){
      this.LOG.debug2('key : ' + pair.key);
      this.LOG.debug2('value : ' + pair.value.toDebugString());
      return pair.value.minimalEqual(m);
    }.bind(this));
    if (res) {
      LOG.debug2('returning : ' + res.value.toDelta());
      LOG.goOut();
      return res.value;
    } else {
      LOG.goOut();
      return false;
    }
  },
	/*
	 * toDebugString()
	 */
        // 自身のもつ全てのMoveオブジェクトのtoDebugStringを
        // : でつなげた文字列をかえす
        // 自身が空の場合、空文字列をかえす
  toDebugString : function toDebugString(){ // Moves
    LOG.getInto('Moves#toDebugString', Log.DEBUG2);
    var res = this.values().invoke('toDebugString').join(':');
    LOG.debug2('returning : ' + res);
    LOG.goOut(Log.DEBUG2);
    return res;
  },
	/*
	 * toDelta()
	 */
        // 自身のもつ全てのMoveオブジェクトのtoDeltaを
        // : でつなげた文字列をかえす
        // 自身が空の場合、空文字列をかえす
  toDelta : function toDelta(){ // Moves
    LOG.getInto('Moves#toDelta', Log.DEBUG2);
    var res = this.values().invoke('toDelta').join(':');
    LOG.debug2('returning : ' + res);
    LOG.goOut(Log.DEBUG2);
    return res;
  },
	/*
	 * fromDelta()
	 */
	// Moves#toDeltaの出力した文字列を自身に追加的に読み込む
	// ただし、midがないmoveは読み込まない
	// 読み込むmoveのmidが既存の場合、新しいmoveで上書きされる
  fromDelta : function fromDelta(str){ // Moves
    LOG.getInto('Moves#fromDelta', Log.DEBUG2);
    if(!str){
      LOG.fatal('Fatal ERROR! argument str is invalid');
      LOG.goOut(Log.DEBUG2);
      return this;
    }
    if(str.length == 0){
      LOG.debug2('nothing to do because argument str size is 0');
      LOG.goOut(Log.DEBUG2);
      return this;
    }
    var ary = str.split(':');
    ary.each(function(e, index){
      var m = new Move();
      m.fromDelta(e);
      this.LOG.debug('m : ' + m.toDelta());
      if (Object.isNumber(m.mid)){
        if (this.name == 'nextMoves'){
          this.set(m.mid, m);
        } else {
          this.set(index, m);
        }
        this.LOG.debug2('m was set to Moves : ' + m.toDelta());
      } else {
        LOG.fatal('Fatal ERROR! Moves#fromDelta : mid of move is not Number!');
      }
    }.bind(this));
    if (ary.size() != this.size()){
      LOG.fatal('Fatal ERROR! Moves#fromDelta : some moves were missed!');
      alert('Fatal ERROR! Moves#fromDelta : some moves were missed!');
    }
    LOG.goOut(Log.DEBUG2);
    return this;
  },

	/*
	 * fromDB()
	 */
	// DBからのresponseであるjsのobjectの配列を自身に追加的に読み込む
        // そのとき、Moveオブジェクトを生成しそれに変換してからとりこむ
	// ただし、midがないmoveは読み込まない
	// 読み込むmoveのmidが既存の場合、新しいmoveで上書きされる
	// 入力 : 配列 要素はjsのオブジェクト
	// 出力 : 自身
  fromDB : function fromDB(ary){ // Moves
    LOG.getInto('Moves#fromDB', Log.DEBUG2);
    ary.each(function(e){
      var m = (new Move()).fromObj(e);
      if (Object.isNumber(m.mid)) this.set(m.mid, m);
    }.bind(this));
    LOG.debug('Moves became : ' + this.toDelta());
    LOG.goOut(Log.DEBUG2);
    return this;
  },

	/*
	 * fromDbForce()
	 */
	// DBからのresponseであるjsのobjectの配列を自身に追加的に読み込む
        // そのとき、Moveオブジェクトを生成しそれに変換してからとりこむ
	// ただし、midがないmoveは読み込まない
	// 読み込むmoveのmidが既存でも、新しいmoveが追加される
	// prevMovesの作成のために用意されたメソッド
	// keyがmidではないことに注意
	// 入力 : 配列 要素はjsのオブジェクト
	// 出力 : 自身
  fromDbForce : function fromDbForce(ary){ // Moves
    LOG.getInto('Moves#fromDbForce', Log.DEBUG2);
    ary.each(function(e, index){
      var m = (new Move()).fromObj(e);
      if (Object.isNumber(m.mid)) this.set(index, m);
    }.bind(this));
    LOG.debug('Moves became : ' + this.toDelta());
    LOG.goOut(Log.DEBUG2);
    return this;
  },

  // movesをmidの順に並べる
  sortByMid : function sortByMid_Moves(){
    this.moves.sort(function(a, b){ return a.mid - b.mid; });
  },

  // 数字の配列をうけとり、midがその順番に並ぶようにmovesを並べ替える。
  // 例: 現在movesのmoveたちのmidが小さい順に0,1,2,3と並んでいるとする。
  //    [3,0,2,1]という配列をうけとるとmovesのmoveたちのmidも3,0,2,1と並ぶ。
  // 用途:pointの高い順にmoveを並べかえる、などの要望に対して、
  //    並べ替えられたmovePointsからmidの配列をうけとり
  //    その順にmovesも並べる、など。
  sortByArray : function sortByArray_Moves(ary){
    // 受け取るArrayはmidを過不足なくならべたものでなければならない
    
  }
      
});
//
//
//  指し手へのコメント(bid,mid,ユーザごと）
var MoveComment = Class.create({

  initialize : function(bid, mid, mcomment, userid, uname){
    this.bid = bid;
    this.mid = mid;
    this.mcomment = mcomment;
    this.userid = userid;
    this.uname = uname;
  },

});

//
//  指し手へのコメントの集合(bidごとにmoveCommentを集めたもの)
var MoveComments = Class.create({

  bid : null,
  moveComments : [],

  setBid : function(bid){ this.bid = bid; },

  clearMoveComments : function(){
    this.bid = null;
    this.moveComments.clear();
  },

  update : function(bid){
  }

});

//  ユーザ(userid)の盤面(bid)へのコメント(bcomment)
var PersonalBoardComment = Class.create({

  initialize : function(bid, userid, bcomment){
    this.bid = bid;
    this.userid = userid;
    this.bcomment = bcomment;
  },
});

//
//  personalBoardCommentの集合
var BoardComments = Class.create({
  bid : null,
  boardComments : []
});


//
//  持ち駒
var HandPieces = Class.create({

  turn: null,  //  true -> black,  false -> white
  pieces: null,

  initialize : function(t, str){
    debug_msg('initialize@HandPieces','start');
    // dw_arg(arguments);
    this.turn = t;
    this.pieces = str2hash(str);
    dw('turn: ' + this.turn + ', ---   pieces : ' + Object.toJSON(this.pieces), 2);
    debug_msg('initialize@HandPieces','end');
  },

  clearPieces : function(){
    this.turn = null;
    this.pieces = null;
  },

  legalCheck : function(){
    debug_msg('legalCheck@HandPieces','start');
    var turn = this.turn;
    var result = true;
    this.pieces.each(function(pair){
    dw('pair : ' + Object.toJSON(pair),2); 
    dw('pair.key.toUpperCase() : ' + Object.toJSON(pair.key.toUpperCase()),2); 
    dw('turn : ' + turn, 2);
      result = turn ? pair.key == pair.key.toUpperCase() :
                      pair.key == pair.key.toLowerCase();
      dw(result,3);
      if (!result) throw $break;
    });
    debug_msg('legalCheck@HandPieces','end');
    return result;
  },

  toStr : function(){
    var hStr = '';
    this.pieces.each(function(pair){
      pair.value.times(function(){ hStr = hStr + pair.key; });
    });
    return hStr;
  },

  add : function(piece){
    if (this.turn){
      if (piece >= 'i') piece = String.fromCharCode(piece.charCodeAt(0) - 8);
      piece = String.toUpperCase(piece);
    } else {
      if (piece >= 'I' && piece < 'a') piece = String.fromCharCode(piece.charCodeAt(0) - 8);
      piece = String.toLowerCase(piece);
    }
    if (this.pieces.keys().include(piece)){
      this.pieces.set(piece, this.pieces.get(piece) + 1);
    } else {
      this.pieces.set(piece, 1);
    }
    hand.updatePieceStand(this.turn);
  },

  remove : function(piece){
    if (this.pieces.keys().include(piece)){
      this.pieces.set(piece, this.pieces.get(piece) - 1);
      if (this.pieces.get(piece) == 0) this.pieces.unset(piece);
      return true;
      $(this.sPlace).update('');
      this.displayStand();
      
    } else {
      alert('error: model.js in remove of Stand Class. Not exists piece is required to be removed.');
    }
  }
});  // end of class HandPieces

