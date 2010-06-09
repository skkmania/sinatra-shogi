M17N = {
  locale: 'en',
  className: 't',
  resources: {
    ja: {
      sente: '先手: ',
      gote: '後手: ',
      count: '手数: ',
      waiting: '参加者受付中',
      player: 'プレイヤー',
      message: 'メッセージ',
      others_captured: '相手の持ち駒',
      my_captured: '自分の持ち駒',
      captured: '持ち駒',
      reverse: '反転',
      promote: '成？',
      dump: 'デバッグ情報',
      run_test: 'テスト実行',
      join: '参加する',
      help: 'ルール説明',
      cannot_get_own_piece: '自分の駒を取ることはできません',
      not_your_turn: 'あなたの手番ではありません',
      already_occupied: '駒のある場所には打てません',
      not_allowed: 'そんな動きはできません',
      cannot_capture_yourown_piece: '自分の駒は取れません',
      cannot_play_with_same_person: '同じ人との対局はできません',
      click_join_button: '参加ボタンを押してください',
      already_over: '勝負はついています。',
      win: 'さんの勝ちです'
    },
    en: {
      sente: 'Black: ',
      gote: 'White: ',
      count: 'count: ',
      waiting: 'Waiting',
      player: 'Players',
      message: 'Message',
      others_captured: 'Other\'s Capturings',
      my_captured: 'My Capturings',
      captured: 'Captured',
      reverse: 'reverse',
      promote: 'promote?',
      dump: 'debug dump',
      run_test: 'run Test',
      join: 'Join',
      help: 'Help',
      cannot_get_own_piece: 'Cannot get yourown piece',
      not_your_turn: 'Not your turn',
      already_occupied: 'Already occupied',
      not_allowed: 'Not allowed',
      cannot_capture_yourown_piece: 'Cannot capture yourown piece',
      cannot_play_with_same_person: 'Cannot play with the same person',
      click_join_button: 'Click Join button',
      already_over: 'Already over,',
      win: ' Win!!'
    }
  },
  translate: function(key) {
    var resource = M17N.resources[M17N.locale];
    if (resource) {
      return resource[key];
    }
    else {
      return key;
    }
  },
  insertTranslate: function(key) {
    document.write(M17N.translate(key));
  },
  setLocale: function(locale) {
    if (M17N.acceptableLocale(locale)) {
      document.cookie = 'locale=' + locale;
      return locale;
    }
    else {
      return null;
    }
  },
  locales: function() {
    var ret = [];
    for (var key in M17N.resources) {
      ret.push(key);
    }
    return ret;
  },
  acceptableLocale: function(locale) {
    var locales = M17N.locales();
    var ret = false;
    for (var i = 0; locales.length; i++) {
      if (locales[i] == locale) {
        ret = true;
        break;
      }
    }
    return ret;
  }
}

t = M17N.translate;
it = M17N.insertTranslate;

(function() {
  function addEventListener(element, event, handler) {
    if (element.addEventListener) {
      element.addEventListener(event, handler, true);
    }
    else if (elelemnt.attachEvent) {
      element.attacheEvent('on' + event, handler);
    }
    else {
      throw 'This browser is not supported';
    }
  }

  function transformAll(element) {
    var node = element || document.body; 
    if (node && node.nodeType == 1) { // element
      var classnames = node.className.split(' ');
      var found = false;
      for (var i = 0; i < classnames.length; i++) {
        if (classnames[i] == M17N.className) {
          found = true;
          break;
        }
      }
      if (found) {
        element.innerHTML = M17N.translate(element.innerHTML);
      }
      var children = node.childNodes;
      for (var i = 0; i < children.length; i++) {
        transformAll(children[i]);
      }
    }
  }

  function setDefaultLocale() {
    var locale = null;
    if (document.cookie) {
      locale = document.cookie.split('=')[1];
      if (!M17N.acceptableLocale(locale)) locale = null; 
    }
    if (!locale) locale = navigator.language.substr(0, 2);
    if (M17N.acceptableLocale(locale)) M17N.locale = locale;
  }

  addEventListener(window, 'load', function(e) {setDefaultLocale(); transformAll()});
})();
