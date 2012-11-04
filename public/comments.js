//  comments.js
//   2010/11/29
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

  initialize : function initialize(){},

  initArea : function initArea() {
    // nextMoveComment用のエリア
 //   this.area = new Area(this, 'nextMoveComments', 'NextMoveComments',{position:[1010,100], width:180, height:400});
 //   this.area.initOnClick();
  },

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
/*
 *  BoardComment
 */
//
//  userがつけた盤面へのコメントを保持しておくためのオブジェクト
(function(global){
  global.BoardComment = function BoardComment() {
    this.initialize();
  }
  BoardComment.prototype = {
    initialize : function(){
    },
  
    // DBから取得したデータのオブジェクトを読み、とりいれる。
    fromObj : function fromObj(h){ // BoardComment
      this.bid		= h.bid;
      this.uid		= h.userid;
      this.bcomment	= h.bcomment;
      return this;
    },
	/*
	 * toDebugString()
	 */
    toDebugString : function toDebugString(){ // BoardComment
      var ret;
      ret =  'bid : ' + this.bid;
      ret += 'uid : ' + this.uid;
      ret += ', comment : ' + this.bcomment;
      return ret;
    },
  	/*
  	 * fromDelta()
  	 */
    fromDelta : function fromDelta(str){ // BoardComment
      var ary = str.split(',');
      this.bid		= parseInt(ary[0]);
      this.uid		= parseInt(ary[1]);
      this.bcomment	= ary[2];
      return this;
    },
  	/*
  	 * toDelta()
  	 */
    toDelta : function toDelta(){ // BoardComment
      var ret;
      ret =  this.bid + ',' + this.uid;
      ret += ',' + this.bcomment
      return ret;
    },
	/*
	 * show()
	 */
	// 自身のwindowに内容を表示する
    show : function show(){ // BoardComment
      LOG.getInto('BoardComment#show', Log.DEBUG2);
      $('boardPointSlider').value = this.bcomment;
      $('boardPointSlider').next().textContent = this.bcomment;
      LOG.goOut(Log.DEBUG2);
    }
  }; // end of prototype of BoardComment
})(window);


//
//  盤面へのコメントを表示するエリア
(function(global){
  function BoardComments() {
    this.initialize();
  }
  BoardComments.prototype = {
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
    this.totalArea = new Element('div',{id:'totalBoardComments'});
    this.totalArea.style.fontSize = bs + 'px';
    this.slider = new Element('input',{id:'boardPointSlider',type:'range', name:'boardPointSlider'});
    this.slider.min   = -5;
    this.slider.max   =  5;
    this.slider.value =  0;
    this.slider.style.width = bs*9 + 'px';

    this.form = new Element('form');
    this.output = new Element('output');
    this.output.onforminput = 'value = boardPointSlider.value';

    this.personalArea = new Element('div',{id:'personalBoardComments'});
    this.personalArea.style.fontSize = bs + 'px';
    this.area.window_contents.insert(this.totalArea);
    this.form.insert(this.slider);
    this.form.insert(this.output);
    this.area.window_contents.insert(this.form);
    this.area.window_contents.insert(this.personalArea);
    this.area.window.open();
  }
}; // end of prototype of BoardComments
    global.boardPoint = new BoardComments(1, 0, 0);
})(window);

