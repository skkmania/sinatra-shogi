M17n = {
  locale: 'en',
  className: 't',
  resources: {
    ja: {
      sente: '先手: ',
      gote: '後手: ',
      waiting: '参加者受付中',
      player: 'プ-レイヤー',
      message: 'メッセジ',
      others_captured: '相手の持ち駒',
      my_captured: '自分の持ち駒',
      captured: '持ち駒',
      reverse: '反転',
      join: '参加する',
      cannot_get_own_piece: '自分の駒を取ることはできません',
      not_your_turn: 'あなたの手番ではありません',
      already_occupied: '駒のある場所には打てません',
      not_allowed: 'そんな動きはできません',
      cannot_capture_yourown_piece: '自分の駒は取れません',
      click_join_button: '参加ボタンを押してください',
      win: 'さんの勝ちです'
    },
    en: {
      sente: 'Black: ',
      gote: 'White: ',
      waiting: 'Waiting',
      player: 'Players',
      message: 'Message',
      others_captured: 'Other\'s Capturings',
      my_captured: 'My Capturings',
      reverse: 'Reverse',
      join: 'Join',
      cannot_get_own_piece: 'Cannot get yourown piece',
      not_your_turn: 'Not your turn',
      already_occupied: 'Already occupied',
      not_allowed: 'Not allowed',
      cannot_capture_yourown_piece: 'Cannot capture yourown piece',
      click_join_button: 'Click Join button',
      win: ' Win!!'
    }
  },
  translate: function(key) {
    var resource = M17n.resources[M17n.locale];
    if (resource) {
      return resource[key];
    }
    else {
      return key;
    }
  },
  insertTranslate: function(key) {
    document.write(M17n.translate(key));
  },
  setLocale: function(locale) {
    if (locale == 'ja' || locale == 'en') {
      document.cookie = 'locale=' + locale;
    }
  }
}

t = M17n.translate;
it = M17n.insertTranslate;

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
        if (classnames[i] == 't') {
          found = true;
          break;
        }
      }
      if (found) {
        element.innerHTML = M17n.translate(element.innerHTML);
      }
      var children = node.childNodes;
      for (var i = 0; i < children.length; i++) {
        transformAll(children[i]);
      }
    }
  }

  function setLocale() {
    var locale = null;
    if (document.cookie) {
      locale = document.cookie.split('=')[1];
      if (locale != 'ja' && locale != 'en') locale = null; 
    }
    if (!locale) locale = navigator.language.substr(0, 2);
    if (locale && (locale == 'ja' || locale == 'en')) M17n.locale = locale;
  }

  addEventListener(window, 'load', function(e) {transformAll()});
  setLocale();
})();
