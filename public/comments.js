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
    this.area = new Area(this, 'nextMoveComments', 'NextMoveComments',{position:[1010,100], width:180, height:400});
    this.area.initOnClick();
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

//
//  personalBoardCommentの集合
var BoardComments = Class.create({
  bid : null,
  boardComments : []
  initialize : function initialize(){},

  initArea : function initArea() {
    // boardComment用のエリア
    this.area = new Area(this, 'boardComment', 'BoardComment',{position:[10,580], width:700, height:100});
    this.area.initOnClick();
  },
});
