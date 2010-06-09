//
// log4pipe_test_common_functions
//
//  log4pipeを使うテストhtmlにて共通に呼び出す
//
  var elem = null;
  var HOST = 'http://skkmania.sakura.ne.jp/animal-shogi/';
  var TestCounter = 0;

  function getContainerId(){
    return 'cont' + TestCounter;
  }
  function getTitle(){
    return 'popup' + TestCounter;
  }
  function getDefaultOptions(){
    return  { 'container': getContainerId(), 'title': getTitle(), 'host' : HOST }
     // ここでControl.Windowのcontainerのidを、アンカーのidと同じにしているのは
     // 一見、奇妙だが、Control.Windowの生成時の仕様に基づいている。
     // それは、containerとしてアンカーを受けとるとそのhrefをcontainerの要素のIDにするというものである。つまり、ここでcontainerとして渡すものがそのままwindowのidになるわけではない。
  }

  function makeLogObj(testname, options){
    var opt = Object.extend(getDefaultOptions(), options );
    opt['container'] = getContainerId();

    // log window を表示するためのリンクアンカーをページに追加
    var href = '#logger' + TestCounter;
    elem = new Element('a',{'id':getContainerId(), 'href':href, 'title':'log'});
    elem.insert(testname + ' ' + TestCounter);
    $('links_pool').appendChild(elem);

    // Logオブジェクトを生成
    var ret = new Log(Log.DEBUG, 'popup', opt);
    // どのようなオプションで生成したのかを表示
    ret.debug('this log window is created under this options : ');
    ret.debug(Log.dumpObject(opt));

    return ret;
  }
