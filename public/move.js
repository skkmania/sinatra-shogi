//  move.js
//   2010/05/08

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

  initialize : function initialize(log, str){ // Move
    this.log = log;
    this.log.getInto();
    if (str && str.length == 6){
      this.from    = parseInt(str.slice(0,2));
      this.to      = parseInt(str.slice(2,4));
      this.piece   = str.slice(4,5);
      this.promote = str.slice(-1) == 't' ? true : false;
      this.toStr   = str;
    }
    this.log.goOut();
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
    this.bid     = ary[0];
    this.mid     = ary[1];
    this.from    = ary[2];
    this.to      = ary[3];
    this.piece   = ary[4];
    this.promote = (ary[5] == 't');
    this.nxt_bid  = ary[6];
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
    this.log.getInto();
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
    this.log.debug('legalcheck@Move');
    this.log.debug('legal check this move : ' + Object.toJSON(this));
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
    this.log.goOut();
  } // function legalCheck
});


// 指し手の集合 
// Hashの子クラス
// 指し手のmidをkeyとする。このmidはNumberでなければならない。
var Moves = Class.create(Hash, {

  initialize : function($super, log){ // Moves
    this.log = log;
    this.log.getInto('Moves#initialize');
    $super();
    this.log.goOut();
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
    this.log.getInto('Moves#search');
    var res = this.find(function(pair){
      // this.log.debug('key : ' + pair.key);
      // this.log.debug('value : ' + Object.toJSON(pair.value));
      return pair.value.minimalEqual(m);
    }.bind(this));
    // this.log.debug('returning : ' + res.value.toDelta());
    this.log.goOut();
    if (res)
      return res.value;
    else
      return false;
  },

	/*
	 * toDelta()
	 */
  toDelta : function toDelta(){ // Moves
    this.log.getInto('Moves#toDelta');
    this.log.debug('values : ' + Object.toJSON(this.values()));
    var res = this.values().invoke('toDelta').join(':');
    this.log.debug('returning : ' + res);
    this.log.goOut();
    return res;
  },
	/*
	 * fromDelta()
	 */
	// Moves#toDeltaの出力した文字列を自身に追加的に読み込む
	// ただし、midがないmoveは読み込まない
	// 読み込むmoveのmidが既存の場合、新しいmoveで上書きされる
  fromDelta : function fromDelta(str){ // Moves
    this.log.getInto('Moves#fromDelta');
    if(!str || str.length == 0){
      this.log.debug('nothing to do because argument str is invalid');
      this.log.goOut();
      return this;
    }
    var ary = str.split(':');
    ary.each(function(e){
      var m = new Move(this.log);
      m.fromDelta(e);
      this.log.debug('m : ' + m.toDelta());
      if (Object.isNumber(m.mid)){
        this.set(m.mid, m);
        this.log.debug('m was set to Moves : ' + m.toDelta());
      }
    }.bind(this));
    this.log.goOut();
    return this;
  },

	/*
	 * fromDB()
	 */
	// DBからのresponseであるjsのobjectの配列を自身に読み込む
        // そのとき、Moveオブジェクトを生成しそれに変換してからとりこむ
	// ただし、midがないmoveは読み込まない
	// 読み込むmoveのmidが既存の場合、新しいmoveで上書きされる
	// 入力 : 配列 要素はjsのオブジェクト
	// 出力 : 自身
  fromDB : function fromDB(ary){ // Moves
    this.log.getInto('Moves#fromDB');
    ary.each(function(e){
      var m = (new Move(this.log)).fromObj(e);
      if (Object.isNumber(m.mid)) this.set(m.mid, m);
    }.bind(this));
    this.log.debug('Moves became : ' + this.toDelta());
    this.log.goOut();
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

/*
 * MovePoint クラス
 */
// 指し手の評価値 
//  各ユーザが持つ値と、その総和とがある。
var MovePoint = Class.create({

  initialize : function(bid, mid, total, personal){
    this.bid = bid;
    this.mid = mid;
    this.total = total;
    this.personal = personal;
  },

  clearMovePoint : function(){
    this.bid = null;
    this.mid = null;
    this.total = null;
    this.personal = null;
  },

  // json 形式から情報をとりこむ
  fromJSON : function(json){
    this.bid = json.bid;
    this.mid = json.mid;
    this.total = json.total;
    this.personal = json.personal;
  }
});

/*
 * MovePoints クラス
 */
// 指し手の評価値の集合 
var MovePoints = Class.create({

  initialize : function initialize(bid){
    this.bid = bid;
    this.movePoints = [];
    this.personalMovePoints = [];
  },

  setBid : function(bid){ this.bid = bid; },

  clearMovePoints : function(){
    this.bid = null;
    this.movePoints.clear();
  },

  // 指し手を渡すと、それが配列の第何要素かを調べて返す
  index : function(m){ // MovePoints
    debug_msg('index@MovePoints','start');
    dw_arg(arguments);
    var ar = this.movePoints.map(function(e){ return e.toStr; });
    var res = ar.indexOf(m.toStr);
    dw('index@MovePoints : ar -> ' + Object.toJSON(ar) + '   returning -> ' + res, 2);
    debug_msg('index@MovePoints','end');
    return res;
  },

  updatePersonalMovePoints : function updatePersonalMovePoints_MovePoints(index, direction){
    dw_func('start'); dw_arg(arguments);
    direction == 'up' ? this.personalMovePoints[index]++ : this.personalMovePoints[index]--;
    if (this.personalMovePoints[index] > 9){
      this.personalMovePoints[index] = 9;
      alert('Personal Move Point must be smaller than 9.');
    } else if (this.personalMovePoints[index] < -9){
      this.personalMovePoints[index] = -9;
      alert('Personal Move Point must be larger than -9.');
    }
    dw_func('end');
  },

  // moveを受け取り、自分の要素とする
  // 盤面で新しい指し手が登録されたときにその手の点数を初期化するときに使う
  accept : function accept_MovePoints(move){
    var mp = new MovePoint(move.bid, move.mid, 0, 0);
    this.movePoints.push(mp);
  },

	// DBから取得したmovePointsの数 < nxtMovesの数
	// ならば、だれも採点していないmoveがあるということなので0点として追加しておく
	// nxtMovesもmovePointsもmidの小さい順に配列に格納されている前提のコードである
	// midの間が抜けていることもあるから丁寧に合わせないとだめ
  addZeroPoints : function addZeroPoints_MovePoints(){
    var len = this.movePoints.length;
    var nmMids = nxtMoves.moves.pluck('mid');
    var thisMids = this.movePoints.pluck('mid');
    nmMids.each(function(i){
      if(!thisMids.include(i)){
	var mp = new MovePoint(board.bid, i, 0, 0);
	movePoints.movePoints.push(mp);
      }
    });
  },

  // movePointsをkeyの小さい順にしたがって並べ替える。keyにはmovePointの属性名を指定できる
  sort : function sort_MovePoints(key){
    this.movePoints.sort(function(a, b){ return a[key] - b[key]; });
  }
      
});

//
//  盤面へのポイント
var BoardPoint = Class.create({

  initialize : function(bid, total, personal){
    this.bid = bid;
    this.total = total;
    this.personal = personal;
  },
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

