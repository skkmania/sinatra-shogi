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
//  盤面へのポイントを表示するエリア
(function(global){
  function BoardPoint() {
    this.initialize();
  }
  BoardPoint.prototype = {
  initialize : function(bid, total, personal){
    this.bid = bid;
    this.total = total;
    this.personal = personal;
    this.initArea();
  },

  initArea : function initArea() {
    // boardPoint用のエリア
    var bs = globalOptions.boardSize || 40;
    this.area = areas['boardPoint'];
    this.totalArea = new Element('div',{id:'totalBoardPoint'});
    this.totalArea.style.fontSize = bs + 'px';
    this.slider = new Element('input',{id:'boardPointSlider',type:'range', name:'boardPointSlider'});
    this.slider.min   = -5;
    this.slider.max   =  5;
    this.slider.value =  0;
    this.slider.style.width = bs*9 + 'px';

    this.form = new Element('form');
    this.output = new Element('output');
    this.output.onforminput = 'value = boardPointSlider.value';

    this.personalArea = new Element('div',{id:'personalBoardPoint'});
    this.personalArea.style.fontSize = bs + 'px';
    this.area.window_contents.insert(this.totalArea);
    this.form.insert(this.slider);
    this.form.insert(this.output);
    this.area.window_contents.insert(this.form);
    this.area.window_contents.insert(this.personalArea);
    this.area.window.open();
  }
}; // end of prototype of BoardPoint
    global.boardPoint = new BoardPoint(1, 0, 0);
})(window);

/*
 *  BoardPointByUser
 */
//
//  userがつけた盤面へのポイントを保持しておくためのオブジェクト
(function(global){
  global.BoardPointByUser = function BoardPointByUser() {
    this.initialize();
  }
  BoardPointByUser.prototype = {
    initialize : function(){
    },
  
    // DBから取得したデータのオブジェクトを読み、とりいれる。
    fromObj : function fromObj(h){ // BoardPointByUser
      this.bid		= h.bid;
      this.uid		= h.userid;
      this.pbpoint	= h.pbpoint;
      return this;
    },
	/*
	 * toDebugString()
	 */
    toDebugString : function toDebugString(){ // BoardPointByUser
      var ret;
      ret =  'bid : ' + this.bid;
      ret += 'uid : ' + this.uid;
      ret += ', personal : ' + this.pbpoint;
      return ret;
    },
  	/*
  	 * fromDelta()
  	 */
    fromDelta : function fromDelta(str){ // BoardPointByUser
      var ary = str.split(',');
      this.bid		= parseInt(ary[0]);
      this.uid		= parseInt(ary[1]);
      this.pbpoint	= parseInt(ary[2]);
      return this;
    },
  	/*
  	 * toDelta()
  	 */
    toDelta : function toDelta(){ // BoardPointByUser
      var ret;
      ret =  this.bid + ',' + this.uid;
      ret += ',' + this.pbpoint
      return ret;
    },
	/*
	 * show()
	 */
	// 自身のwindowに内容を表示する
    show : function show(){ // BoardPointByUser
      LOG.getInto('BoardPointByUser#show', Log.DEBUG2);
      $('boardPointSlider').value = this.pbpoint;
      $('boardPointSlider').next().textContent = this.pbpoint;
      LOG.goOut(Log.DEBUG2);
    }
  }; // end of prototype of BoardPointByUser
})(window);

/*
 *  BoardPointAverage
 */
//
//  盤面へのポイントの全体平均を保持しておくためのオブジェクト
(function(global){
  global.BoardPointAverage = function BoardPointAverage(obj) {
    return this.initialize(obj);
  }
  BoardPointAverage.prototype = {
    initialize : function(obj){
      if(obj){
        this.bid	= obj.bid;
        this.bpoint	= obj.bpoint;
      }
      return this;
    },
  
    // DBから取得したデータのオブジェクトを読み、とりいれる。
    fromObj : function fromObj(h){ // BoardPointAverage
      this.bid		= h.bid;
      this.bpoint	= h.bpoint;
      return this;
    },
	/*
	 * toDebugString()
	 */
    toDebugString : function toDebugString(){ // BoardPointAverage
      var ret;
      ret =  'bid : ' + this.bid;
      ret += ', avg : ' + this.bpoint;
      //ret += ', avg : ' + this.bpoint.toFixed(2);
      return ret;
    },
  	/*
  	 * fromDelta()
  	 */
    fromDelta : function fromDelta(str){ // BoardPointAverage
      var ary = str.split(',');
      this.bid		= parseInt(ary[0]);
      //this.bpoint	= parseFloat(ary[1]);
      this.bpoint	= ary[1];
      return this;
    },
  	/*
  	 * toDelta()
  	 */
    toDelta : function toDelta(){ // BoardPointAverage
      var ret;
      ret =  this.bid;
      //ret += ',' + this.bpoint.toFixed(2);
      ret += ',' + this.bpoint;
      return ret;
    },
	/*
	 * show()
	 */
	// 自身のwindowに内容を表示する
    show : function show(){ // BoardPointAverage
      LOG.getInto('BoardPointAverage#show', Log.DEBUG2);
      $('totalBoardPoint').textContent = this.bpoint;
      LOG.goOut(Log.DEBUG2);
    }
  }; // end of prototype of BoardPointAverage
})(window);
