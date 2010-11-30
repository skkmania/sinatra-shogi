//  points.js
//   2010/11/29
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

  initArea : function initArea() {
    // nextMovePoint用のエリア
  //  this.area = new Area(this, 'nextMovePoints', 'NextMovePoints',{position:[850,100], width:130, height:400});
    this.area.initOnClick();
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

  initArea : function initArea() {
    // boardPoint用のエリア
//    this.area = new Area(this, 'boardPoint', 'BoardPoint',{position:[10,450], width:120, height:100});
//    this.area.initOnClick();
  }
});
