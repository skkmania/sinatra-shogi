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
// 一時退避
    //this.book = new Book(this);
    //this.book.showBookForm();
    //this.book.showInputBox();
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
      case 'readBook' :
        LOG.getInto('clicked innerHTML is : ' + inner);
        window.gameController.sendDelta( this.makeReviewDelta(target) );
        break;
      default :
        break;
    }
    LOG.goOut();
  },
/*
  set_data_by_bid : function set_data_by_bid(target, responseJSON){
      var bids_ary;
      LOG.getInto();
      LOG.debug('contents of responseJSON follows:');
      masked_data_name.each(function(e){
        LOG.debug('name : ' + e);
        if(responseJSON[e]) LOG.debug('responseJSON['+e+'] : ' + responseJSON[e]);
        else LOG.debug('responseJSON['+e+'] not exist');
      });
      var data_hash = responseJSON;
      //var data_hash = $H();
      this.age += 1;
      LOG.debug('responseJSONをハッシュdata_hashに格納する');
      // DBから文字列としてうけたものを、JSONオブジェクトとして評価する
      masked_data_name.each(function(e){
	data_hash.set(e, responseJSON[e]);
      });
      LOG.debug('data_hash をJSONオブジェクトとして表示してみる');
      LOG.debug(Object.toJSON(data_hash), 3);
      LOG.debug('データをbidごとに再構成する');
      LOG.debug('まずdata_hash[bids]からbidを抽出する');
//      LOG.debug('data_hash[bids]は文字列で、カンマ区切りのオブジェクトの配列という形。');
//      LOG.debug('したがって、まずsplitし、個々の要素をevalすればobjectの配列となる。');
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
*/  
// 使われていないなあ。調査の上、削除かどうか決めること
/*
  updateDisplay : function updateDisplay(target){ // Handler
    LOG.getInto();
    this.prevArea.display(target);
    this.selfArea.display(target);
    dataStore.area.display(target);
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
*/
});
//-----------------------------------------------------------------
//  main
//-----------------------------------------------------------------
/*
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
*/
