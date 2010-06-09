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
  nxtBid: null,
  toStr: null,

  initialize : function(str){
    if (str && str.length == 6){
      this.from = str.slice(0,2);
      this.to = str.slice(2,4);
      this.piece = str.slice(4,5);
      this.promote = str.slice(-1) == 't' ? true : false;
      this.toStr = str;
    }
  },

  // DBから取得したデータのオブジェクトを読み、とりいれる。
  fromObj : function fromObj_Moves(h){
    this.bid = h.bid;
    this.mid = h.mid;
    this.from = h.m_from;
    this.to = h.m_to;
    this.piece = h.piece;
    this.promote = h.promote;
    this.nxtBid = h.nxt_bid;
    return this;
  },

  // get_nxtMoves.rhtmlが返すハッシュをとりいれる。
  fromHash : function fromHash_Moves(h){
    this.bid = parseInt(h.bid);
    this.mid = parseInt(h.mid);
    this.from = parseInt(h.m_from);
    this.to = parseInt(h.m_to);
    this.piece = h.piece;
    this.promote = (h.promote == 't');
    this.nxtBid = parseInt(h.nxt_bid);
    return this;
  },

  // moves テーブルのレコードを配列にしたものを受け取ってその値をとりいれる
  fromRecord : function fromRecord_Moves(ary){
    this.bid = ary[0];
    this.mid = ary[1];
    this.from = ary[2];
    this.to = ary[3];
    this.piece = ary[4];
    this.promote = (ary[5] == 't');
    this.nxtBid = ary[6];
    return this;
  },

  isBlack : function() {
    return this.piece == this.piece.toUpperCase();
  },

  toKanji : function(){
    var sankaku = (this.isBlack()) ?  '▲' : '△' ;
    var pro = this.promote ? '成' : '';
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
    return sankaku + to_x + '0一二三四五六七八九'[to_y] + Chr2Kanji[this.piece.toLowerCase()] + pro + '(' + this.from + ')';
  },

  legalCheck : function(){
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
    dw('legalcheck@Move', 3);
    dw('legal check this move : ' + Object.toJSON(this), 3);
    switch(this.piece){
      case 'a':
        return (from_x == to_x) && (to_y - from_y == 1);
	break;
      case 'A':
        return (from_x == to_x) && (from_y - to_y == 1);
	break;
      case 'b':
        return (from_x == to_x) && (to_y - from_y > 0);
	break;
      case 'B':
        return (from_x == to_x) && (to_y - from_y < 0);
	break;
      case 'c':
        return (Math.abs(from_x - to_x) == 1) && (to_y - from_y == 2);
	break;
      case 'C':
        return (Math.abs(from_x - to_x) == 1) && (from_y - to_y == 2);
	break;
      case 'd':
        return (from_x == to_x) && (to_y - from_y == 1) ||
               (Math.abs(from_x - to_x) == 1) && (Math.abs(from_y - to_y) == 1);
	break;
      case 'D':
        return (from_x == to_x) && (from_y - to_y == 1) ||
               (Math.abs(from_x - to_x) == 1) && (Math.abs(from_y - to_y) == 1);
	break;
      case 'e': case 'i': case 'j': case 'k': case 'l': case 'm':
        return ((from_x == to_x) && Math.abs(to_y - from_y) == 1) ||
	       ((Math.abs(from_x - to_x) == 1) && (from_y == to_y)) ||
	       ((to_y - from_y == 1) && (Math.abs(from_x - to_x) == 1));
	break;
      case 'E': case 'I': case 'J': case 'K': case 'L': case 'M':
        return ((from_x == to_x) && Math.abs(to_y - from_y) == 1) ||
	       ((Math.abs(from_x - to_x) == 1) && (from_y == to_y)) ||
	       ((from_y - to_y == 1) && (Math.abs(from_x - to_x) == 1));
	break;
      case 'f': case 'F':
        return Math.abs(from_x - to_x) == Math.abs(from_y - to_y);
	break;
      case 'n': case 'N':
        return Math.abs(from_x - to_x) == Math.abs(from_y - to_y) ||
               ((from_x == to_x) && Math.abs(to_y - from_y) == 1) ||
	       ((Math.abs(from_x - to_x) == 1) && (from_y == to_y));
	break;
      case 'g': case 'G':
        return (from_x == to_x) || (from_y == to_y);
	break;
      case 'o': case 'O':
        return (from_x == to_x) || (from_y == to_y) ||
               ((Math.abs(from_x - to_x) == 1) && (Math.abs(from_y - to_y) == 1));
	break;
      case 'h': case 'H':
        return (Math.abs(from_x - to_x) < 2) && (Math.abs(from_y - to_y) < 2);
	break;
      default:
        break;
    } // switch
  } // function
});


// 指し手の集合 

var Moves = Class.create({

  bid  : null,
  pn   : null,  // prev or next : true -> next,  false -> prev.
  moves: null,  // moves は配列であり、その添字はmidに等しくなければいけない

  initialize : function(p, m){
    this.pn    = p;
    this.moves = m;
  },

  setBid : function(bid){ this.bid = bid; },

  clearMoves : function(){
    this.bid = null;
    this.pn  = null;
    this.moves.clear(); },

  // 指し手を渡すと、その指し手のmidを調べて返す
  // 盤上で生成した指し手が、指し手候補にふくまれているかどうか調べるために使う関数
  // みつからなければ、-1を返す
  index : function(m){
    debug_msg('index@Moves','start');
    dw_arg(arguments);
    dw('index@Moves : this.moves -> ' + Object.toJSON(this.moves), 3);
    var res = -1;
    this.moves.each(function(e){
      if ( parseInt(m.from) == e.from && parseInt(m.to) == e.to
        && m.piece == e.piece && m.promote == e.promote){
          res = e.mid;
      }
    });
    dw('index@Moves : returning -> ' + res, 3);
    debug_msg('index@Moves','end');
    return res;
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
  index : function(m){
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

