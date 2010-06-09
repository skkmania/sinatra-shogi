/**
 * common functions
 */
Draggables.toDebugString = function() {
  return '<br>' + this.drags.pluck('element').pluck('obj').invoke('toDebugString').join('<br>');
}

Droppables.toDebugString = function() {
  return '<br>' + this.drops.invoke('toDebugString').join('<br>');
}

Array.prototype.subtract = function(ary){
  // 配列から配列を引き算する。破壊的。
  $A(ary).each(function(c){
    var idx = $A(this).indexOf(c);
    if(idx >= 0) this.splice(idx,1);
  }.bind(this));
}

String.prototype.subtract = function(str){
  // 文字列から文字列を引き算する
  // 自分自身から与えられた文字列を引いた値を返す。
  // コピーを返すので元の値は変化しない
  var ret = $A(this);
  ret.subtract($A(str));
  return ret.join('');
}

function arrange(state){
  var str = state.toString();
  var pattern = /\w: '.*'\,/;
  var ret = str.replace(/\n/g, "<br>");
  return '<div style="color: #FF0000">' + ret + '</div>';
}

Number.prototype.toKanji = function(){
  var stock = ['','一','二','三', '四','五', '六','七', '八','九'];
  return stock[this];
}

