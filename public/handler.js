//  handler.js
//   2010/11/10

var Handler = Class.create({

  initialize : function initialize(controller) {
    this.controller = controller;
    this.LOG = LOG;
    LOG.getInto('Handler#initialize');
    // 以下の３つのプロパティは、保持するキャッシュの肥大化を防ぐ目的で導入
    // 例えば１局の将棋の指し手を次々に読み込んでいけば、そのたびにキャッシュにデータが増える。
    // なので、中盤になったら序盤のデータは捨ててもいいだろう、と判断する
    // しかしこのソフトではある局面が序盤か中盤かはわからない
    // そこで具体的には、データを読み込んだ時系列に頼ることにする。
    // 
    this.max_cache = 200;    // キャッシュするbidの最大個数のしきい値。
    this.age = 0;            // キャッシュの年齢。 updateDataのたびに１増える。
    this.age_hash = $H();    // bid : age のハッシュ。各bidのageを記憶しておく。
    this.data_name = $w('bids board nextMoves prevMoves movePointsByUser movePointsAverage moveComments boardPointByUser boardPointAverage boardComments');

    this.target_store = 0;  // nxts or pres をクリックしたときのtargetを保管する。now loadingになったときに復活するために使う。
    LOG.debug('areas are being initialized');
    // 前の手のエリア
    this.prevArea = new Area(this, 'pres', 'prevMoves',{position:[10,100], width:120, height:300});
    this.prevArea.initOnClick();
    this.prevArea.window.open();
    //this.prevArea.show(); ここでははやすぎ。まだ初期情報がとれていない。
    // 盤面のエリア
    this.boardArea = new Area(this, 'boardArea', 'Board',{position:[160,100], width:520, height:440});
    this.boardArea.window.open();
    this.boardArea.layoutContents();
    // 次の手のエリア
    this.nextArea = new Area(this, 'nxts', 'nextMoves',{position:[690,100], width:120, height:400});
    this.nextArea.initOnClick();
    this.nextArea.window.open();
    //this.nextArea.show();
    // nextMovePoint用のエリア
    this.nextMovePointArea = new Area(this, 'nextMovePoint', 'NextMovePoint',{position:[850,100], width:130, height:400});
    this.nextMovePointArea.initOnClick();
    // nextMoveComment用のエリア
    this.nextMoveCommentArea = new Area(this, 'nextMoveComment', 'NextMoveComment',{position:[1010,100], width:180, height:400});
    this.nextMoveCommentArea.initOnClick();
    // boardPoint用のエリア
    this.boardPointArea = new Area(this, 'boardPoint', 'BoardPoint',{position:[10,450], width:120, height:100});
    this.boardPointArea.initOnClick();
    // boardComment用のエリア
    this.boardCommentArea = new Area(this, 'boardComment', 'BoardComment',{position:[10,580], width:700, height:100});
    this.boardCommentArea.initOnClick();
    // 棋譜読み込み用のエリア
    this.readBookArea = new Area(this, 'readBook', 'ReadBook',{position:[850,580], width:200, height:380});
    this.readBookArea.initOnClick();
    this.book = new Book(this);
    this.book.showBookForm();
    this.book.showInputBox();
    // dataStoreのdebug dump用のエリア
    this.dataArea = new Area(this, 'data', 'dataStore',{position:[10,680], width:830, height:270});
    LOG.debug('areas were initialized');
    this.gUid = 1;
    this.gRange = 'only';
  // range は 'only' か 'full'の２値をとる。
  //   'only' : levelで指定した深さに相当するデータのみ取得せよ、という意味になる。
  //   'full' : 0からlevelまですべての深さに相当するデータを取得せよ、という意味。
    this.gLevel = 3;				// Bidをとるときの探索の深さ
    this.gCycle = 0;
  // cycle は garbage collectionの目安
    this.maxgCycle = 5;
//    this.mask = 1023;
    this.mask = 7;
    this.gMask = this.mask;
   //        mask : どのデータを取得するかを示す２進数の10進表現
   // データの選択肢は下の9つ。下位ビットから順に、
   //    bids
   //    board
   //    nextMoves
   //    prevMoves
   //    movePointsByUser  
   //    movePointsAverage 
   //    moveComments      
   //    boardPointByUser  
   //    boardPointAverage 
   //    boardComments     
   //    ただし、bids, boardは必須。つまりmaskは最低3になる。
    this.masked_data_name = $A();

    LOG.goOut();
  },


	/**
	 * makeDeltaFromSlice(bid, slice)
	 */
	// 入力されたsliceからdeltaを生成し返す
	// 入力 : bid 数値 表示したい局面のbid
	//  ただし、これはnullでも可。そのときは画面のテキスト入力画面の値を使う
	//      : slice  オブジェクト
          // 例：
          //  {"prevMoves": [{"promote": "f", "m_to": "96",
	//                    "piece": "P", "bid": "1", "mid": 5,
	//                    "m_from": "97", "nxt_bid": 73630}],
	//     "nextMoves": [],
	//     "board"    : [{"white": "", "black": "", "bid": "1",
	//                    "board": "lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxxPxSnrpxxxPBNlxpxxPxxL", "turn": "f"}]}
        // 出力 : 作成されたdelta オブジェクト
  makeDeltaFromSlice: function makeDeltaFromSlice(bid, slice){ // Handler
    var delta = {};
    LOG.getInto();
      delta['mode']  = 'review';
      delta['bid']   = Object.toJSON(bid);
      delta['turn']  = (bid % 2 == 0) ? 'f':'t';
      delta['board'] = Object.toJSON(slice.board);
      delta['next']  = Object.toJSON(slice.nextMoves);
      delta['prev']  = Object.toJSON(slice.prevMoves);
/*
      delta['bid']   = bid;
      delta['board'] = slice.board;
      delta['next']  = slice.nextMoves;
      delta['prev']  = slice.prevMoves;
*/
      LOG.debug('delta : ' + Object.toJSON(delta));
    LOG.goOut();
    return delta;
  },
	/**
	 * makeReviewDelta(bid)
	 */
	// 入力されたbidのboard情報を取得し、sliceをdeltaに置き換える
	// 入力 : bid 数値 表示したい局面のbid
	//  ただし、これはnullでも可。そのときは画面上のbid入力エリアの値を使う
        // 出力 : 作成されたdelta オブジェクト
  makeReviewDelta: function makeReviewDelta(bid){ // Handler
    var delta = {};
    LOG.getInto('Handler#makeReviewDelta');
    this.controller.count++;
    LOG.debug('bid : ' + bid);
    LOG.debug('typeof bid : ' + typeof bid);
    var value = bid || $('inputText').value;
    //var value = bid.toString() || $('inputText').value;
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
    //slice = $H(slice);
    //if(slice && !slice.constructor) slice = $H(slice);
    //LOG.debug('slice constructor 2 : ' + Object.toJSON(slice.constructor));
    if(slice){
      LOG.debug('slices[' + value + '] : ' + slice.toDebugString());
      LOG.debug('slice.keys : ' + (slice.keys().join(',')));
      slice.each(function(pair){
        this.LOG.debug('key : ' + Object.toJSON(pair.key));
        this.LOG.debug('value : ' + pair.value.toDebugString());
      }.bind(this));
      delta['mode']  = wave.getState().get('mode') || 'review';
      delta['count'] = this.controller.count.toString();
      delta['bid']   = value.toString();
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
	 * refreshBoard
	 */
	// 入力されたbidのboard情報を取得し、盤面を書き換える。
	// 入力 : bid 数値 表示したい局面のbid
	//  ただし、これはnullでも可。そのときは画面のテキスト入力画面の値を使う
  refreshBoard: function refreshBoard(bid){ // Handler
    LOG.getInto('Handler#refreshBoard');
    LOG.debug('bid : ' + bid);
    var boardObj, nextMoves, prevMoves;

    if(bid) $('inputText').value = bid;
    var value = $('inputText').value;
    LOG.debug('value : ' + value);
    LOG.debug('typeof value : ' + typeof value);
    var slice = dataStore.slices.get(value);
    LOG.debug('slice['+value+'] : ' + Object.toJSON(slice));
    if(!slice){
      LOG.debug('was not found in slices key, so try getMsg.');
      dataStore.getMsg(value, 1, 3, 7, 'full', false);
      slice = dataStore.slices.get(value);
    }
    if(slice){
      window.gameController.game.boardReadFromDB();
      window.gameController.game.board.show();
      this.prevArea.show();
      this.nextArea.show();
    } else {
      LOG.fatal('cannot get slice');
    }
    LOG.goOut();
  },
	/*
	 * areaClicked(place, target, inner)
	 */
	// クリックされた要素の情報をもとに必要な処理を行う
	// 入力 : place  このエリアのコンテナの名前。どのエリアがクリックされた
	//        target 数値 li要素のプロパティからとった数字
	//        inner  クリックされた要素のinnnerHTML
  areaClicked : function areaClicked(place, target, inner){ // Handler
    LOG.getInto('Handler#areaClicked');
    LOG.debug('place -> ' + Object.toJSON(place) + ',  target -> ' + Object.toJSON(target));
    switch(place) {
      case 'nxts' :
	// この場合、targetによりクリックされた要素のmidが渡されてくる
        var bid = dataStore.currentSlice().get('nextMoves').get(target).nxt_bid;
        LOG.debug('bid found : ' + bid);
        window.gameController.sendDelta( this.makeReviewDelta(bid) );
        break;
      case 'pres' :
        // この場合は、クリックされた要素の文字列を、各Moveオブジェクトと比べて、一致するもののbidを返す
        LOG.getInto('clicked innerHTML is : ' + inner);
        var bid = dataStore.currentSlice().get('prevMoves').find(
          function(pair){
             this.LOG.debug('value.toKanji : ' + pair.value.toKanji());
             return pair.value.toKanji() == inner;
           }.bind(this)).value.bid;
        if(bid) {
          LOG.debug('bid found : ' + bid);
          window.gameController.sendDelta( this.makeReviewDelta(bid) );
        } else {
          LOG.fatal('clicked move was not found');
        }
        break;
      case 'readBook' :
        LOG.getInto('clicked innerHTML is : ' + inner);
        window.gameController.sendDelta( this.makeReviewDelta(target) );
        break;
      default :
        break;
    }
    LOG.goOut();
  },

  updateData : function updateData(target, uid, range, async){ // Handler
      LOG.getInto(); 
      LOG.debug('target: ' + arguments[0]);
      LOG.debug('uid: ' + arguments[1]);
      LOG.debug('range: ' + arguments[2]);
      LOG.debug('async: ' + arguments[3]);
      LOG.goOut();
      dataStore.getMsg(target, uid, this.gLevel, this.mask, range, async);
  },

  set_data_by_bid : function set_data_by_bid(target, responseJSON){
      var bids_ary;
      LOG.getInto();
      LOG.debug('contents of responseJSON follows:');
/*
      masked_data_name.each(function(e){
        LOG.debug('name : ' + e);
        if(responseJSON[e]) LOG.debug('responseJSON['+e+'] : ' + responseJSON[e]);
        else LOG.debug('responseJSON['+e+'] not exist');
      });
*/
      var data_hash = responseJSON;
      //var data_hash = $H();
      this.age += 1;
      LOG.debug('responseJSONをハッシュdata_hashに格納する');
      // DBから文字列としてうけたものを、JSONオブジェクトとして評価する
/*
      masked_data_name.each(function(e){
	data_hash.set(e, responseJSON[e]);
      });
*/
      LOG.debug('data_hash をJSONオブジェクトとして表示してみる');
      LOG.debug(Object.toJSON(data_hash), 3);
      LOG.debug('データをbidごとに再構成する');
      LOG.debug('まずdata_hash[bids]からbidを抽出する');
//      LOG.debug('data_hash[bids]は文字列で、カンマ区切りのオブジェクトの配列という形。');
//      LOG.debug('したがって、まずsplitし、個々の要素をevalすればobjectの配列となる。');
/*
      try {
        bids_ary = eval(data_hash.get('bids'));
        LOG.debug('data_hash[bids] size : ' + bids_ary.size());
      }
      catch (exception){
        alert(exception);
      }
      bids_ary.each(function(e){
        LOG.debug(e);
      });
      LOG.debug('eval bids_ary[0] : ' + Object.toJSON(eval(bids_ary[0])));
      LOG.debug('bids_ary -> ' + Object.toJSON(bids_ary));
*/
      //bids_ary = bids_ary.map(function(e){ return eval(e); }).pluck('bid');
      bids_ary = data_hash['bids'].pluck('bid');
      LOG.debug('bids_ary -> ' + Object.toJSON(bids_ary));
        // そのbidごとに、data_hashから抽出したハッシュを登録する
      bids_ary.each(function(bid){
        LOG.debug('bid : ' + bid);
        data_by_bid.set(bid, extract_from_data_hash_by_bid(bid, data_hash));
        LOG.debug('data_by_bid -> ' + Object.toJSON(data_by_bid));
        // ageも追加
        age_hash.set(bid, this.age);
      });
      // 再構成したデータのtargetぶんを表示してみる。
      LOG.debug('updateData : target -> ' + Object.toJSON(target), 3);
      LOG.debug('updateData : data_by_bid.get[target] -> ' + Object.toJSON(data_by_bid.get(target)), 3);
      // age_hash を表示
      LOG.debug('updateData : age_hash -> ' + Object.toJSON(age_hash), 3);
      // garbage collect
      var ages = age_hash.values().sortBy(function(e){ return parseInt(e); }).uniq();
      LOG.debug('updateData : ages -> ' + Object.toJSON(ages), 3);
      while(ages.size() > gLevel*2 ){
        age_hash.findAll(function(e){ return e[1] == ages[0]; }).each(function(b){
          data_by_bid.unset(b.key);
          age_hash.unset(b.key);
        });
        ages.shift();
      } 
      LOG.debug('updateData : ages after gc -> ' + Object.toJSON(ages), 3);
      LOG.debug('updateData : age_hash after gc -> ' + Object.toJSON(age_hash), 3);
      LOG.goOut();
  },
  
  updateDisplay : function updateDisplay(target){ // Handler
    LOG.getInto();
    this.prevArea.display(target);
    this.selfArea.display(target);
    this.dataArea.display(target);
    this.nextArea.display(target);
    $('size').update(dataStore.slices.size());
    LOG.debug('size was updated.');
    var ages = this.age_hash.values().sort().uniq();
    LOG.debug('ages : ' + Object.toJSON(ages));
    var bids_per_age = $H();
    ages.each(function(age){
      bids_per_age.set(age, age_hash.findAll(function(e){ return e[1] == age; }));
    });
    var agestr = bids_per_age.inject('',function(str, e){
       str += (e.key + ':' + e.value.size() + ':'+ e.value.invoke("first").sortBy(function(e){return parseInt(e);}).join(",") + '<br>');
       return str;
    });
    $('age').update(agestr);
    LOG.goOut();
  },

  cs_gc : function cs_garbageCollect(){
    LOG.getInto();
    LOG.debug('values : ' + Object.toJSON(cs.values()),3); 
    var minCycle = cs.values().map(function(e){ return e[2]; }).min();
    LOG.debug('minCycle : ' + minCycle);
    cs.each(function(pair){
      //LOG.debug('pair : ' + Object.toJSON(pair),3);
      if ( pair.value[2] <= minCycle + 2 ) cs.unset(pair.key);
    });
    LOG.goOut();
  }
});
//-----------------------------------------------------------------
//  main
//-----------------------------------------------------------------

function data_by_bid_to_table(target){
  var retstr = '<table style="font-size: 9pt" class="data_by_bid">';
  if (arguments.size == 0){
	  data_by_bid.each(function(parent){
	    retstr += '<tr>';
	    $H(parent.value).each(function(pair){
	      retstr += ('<td>' + Object.toJSON(pair.value) + '</td>');
	    });
	    retstr += '</tr>';
	  });
  } else {
	    retstr += '<tr>';
	    data_by_bid.get(target).each(function(pair){
	      retstr += ('<td>' + Object.toJSON(pair.value) + '</td>');
	    });
	    retstr += '</tr>';
  }
  retstr += '</table>';
  return retstr;
}

function extract_from_data_hash_by_bid(target,data_hash){
  LOG.getInto();
  var ret_hash = $H();
  $H(data_hash).each(function(pair){
    LOG.debug('key : ' + Object.toJSON(pair.key));
    LOG.debug('value : ' + Object.toJSON(pair.value));
    var v =  pair.value.findAll(function(obj){
	       return obj.bid == target;
	     });
    LOG.debug('v : ' + Object.toJSON(v));
    ret_hash.set(pair.key,v);
  });
  LOG.debug('ret_hash : ' + Object.toJSON(ret_hash));
  LOG.goOut();
  return ret_hash;
}
