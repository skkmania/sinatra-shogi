// -*- coding: utf-8 -*-
// vim: set expandtab ts=2 :
WS_URL = "ws://sq-gps:8081";

          function debug(message) {
                  html = "<p><span class='time'>"+new Date()+"</span>"+message+"</p>"
                  if ($('debug')){ $('debug').insert(html); }
          }

gadgets = {};
gadgets.util = {
  addEventListener: function(element, event, handler) {
    if (element.addEventListener) {
      element.addEventListener(event, handler, true);
    }
    else if (elelemnt.attachEvent) {
      element.attacheEvent('on' + event, handler);
    }
    else {
      throw 'This browser is not supported';
    }
  },

  registerOnLoadHandler: function(handler) {
    gadgets.util.addEventListener(window, 'load', handler);
  }
};

function Wave(opt) {
  this.initialize(opt);
};
Wave.prototype = {
  initialize: function(opt) {
    if (!opt) opt = {};
    this.host = opt.host;
    this.mode = opt.mode;
    this.participants = opt.participants;
    //this.state = opt.state || {};
    this.time = opt.time;
    this.viewer = opt.viewer;
    this.isInWaveContainer = opt.isInWaveContainer || false;
    this.ws = new WebSocket(WS_URL);
  },
  getHost: function() {
    return this.host;
  },
  getMode: function() {
    return this.mode;
  },
  getParticipantById: function(id) {
    for (var i = 0; i < this.participants.length; i++) {
      if (this.participants[i].getId() == id) {
        return this.participants[i];
      }
    }
    return null;
  },
  getParticipants: function() {
    return this.participants;
  },
  getState: function() {
    if (!this.state) this.state = new wave.State();
    return this.state;
  },
  getTime: function() {
    return this.time;
  },
  getViewer: function() {
    return this.viewer;
  },
  // ¤³¤ì¤Ïnowave¤Ê¤é¤Ç¤Ï¤Î½èÍý¡£
  setViewer: function(name) {
    LOG.getInto('wave.setViewer');
    this.viewer = new wave.Participant(name);
    LOG.goOut();
    return this.viewer;
  },
  isInWaveContainer: function() {
    return this.isInWaveContainer;
  },
/*
  log: function(message) {
  },
*/
  setModeCallback: function(callback, optContext) {
    this.modeCallback = callback;
  },
  setParticipantCallback: function(callback, optContext) {
    this.participantCallback = callback;
  },
  setStateCallback: function(callback, optContext) {
    this.stateCallback = callback;
  }
};
wave = new Wave();
if(LOG) LOG.debug("connecting to "+WS_URL+"...");
wave.ws.onopen = function() {
  if(LOG) LOG.getInto('wave.ws.onopen');
  if(LOG) LOG.debug("ws onopen : connected.");

  wave.ws.send("status|sync");
  if(LOG) LOG.debug("ws onopen : sent sync request.");
  if(LOG) LOG.goOut();
}

wave.ws.onclose = function() {
  LOG.debug("disconnected...");
}

wave.ws.onerror = function(msg) {
  LOG.debug("failed to connect"+msg);
}

wave.ws.onmessage = function(event) {
  LOG.getInto("wave.ws.onmessage");
  LOG.debug("message received: "+event.data);
  wave.getState().fromString(event.data);
  if (wave.stateCallback) {
    var status = wave.getState().get('status');
    // stateのstatusによる処理が終わったらstatusはnormalに戻す?
    // wave.getState().put('status','normal');
    switch(status){
      case "sync" :
        LOG.debug("sync reply arrived : " + event.data);
        switch(wave.getState().get('mode')){
          case 'playing':
            // ¤¹¤Ç¤Ëplayer¤¬·è¤Þ¤Ã¤Æ¤¤¤ë'playing'¤Ê¤é¡¢
            // ¤³¤Î¥¯¥é¥¤¥¢¥ó¥È¤Ï´ÑÀï¼Ô¤Ê¤Î¤ÇID¤Ï¼«Æ°¤Ë¤Õ¤Ã¤Æ¤·¤Þ¤¦¡£
            wave.setViewer();
            // ¤½¤·¤Æ´ÑÀï¼Ô¤Ê¤é¤Ðjoin Button¤ÏÉ¬Í×¤Ê¤¯
            $('join-button').hide();
            // ²èÌÌ¤Î½é´ü²½¤ØÈô¤ó¤Ç¤è¤¤¡£
            window.gameController.acceptState();
            break;
          case "onePlayer":
            // ¤Ò¤È¤ê¤Îplayer¤¬·è¤Þ¤Ã¤Æ¤¤¤ë'onePlayer'¤Ê¤é¡¢
            // join Button¤òÉ½¼¨¤·¤¿¤Þ¤Þ¡¢ControlPanel¤Î¥¢¥Ã¥×¥Ç¡¼¥È¤Î
            // ¤¿¤á¤Ë¡¢State¤Î¥³¡¼¥ë¥Ð¥Ã¥¯¤ò¸Æ¤Ö¡£
            window.gameController.acceptState();
            break;
          default:
            break;
        }
        wave.getState().put('status','normal');
        break;
      case "reset" :
        LOG.debug("reset state message : " + event.data);
        wave.getState().clear();
        break;
      case "gpss" :
        // 初期盤面を用意(NextMovesも表示する)
        wave.stateCallback(wave.getState());
        wave.getState().put('status','gpsc');
        // そしてユーザからの入力待ち
        break;
      case "gpsc" :
        wave.stateCallback(wave.getState());
        break;
      case "msg:" :
        break;
      default :
        wave.stateCallback(wave.getState());
        break;
    }
  }
  LOG.goOut();
}

wave.Callback = function(callback, optContext) {
  this.initialize(callback, optContext);
};
wave.Callback.prototype = {
  initialize: function(callback, optContext) {
    this.callback = callback;
  },
  invoke: function(varArgs) {
    this.callback(varArgs);
  }
};

wave.Mode = {UNKNOWN: 0, VIEW:1, EDIT:2, DIFF_ON_OPEN:3, PLAYBACK:4};

wave.Participant = function(name) {
  this.initialize(name);
};
wave.Participant.prototype = {
  initialize: function(name) {
    this.displayName = name || 'name' + Math.floor(Math.random() * 100);
    this.id = this.displayName + '@googlewave.com';
    this.thumbnailUrl = '';
  },
  getDisplayName: function() {
    return this.displayName;
  },
  getId: function() {
    return this.id;
  },
  getThumbnailUrl: function() {
    return this.thumbnailUrl;
  }
};

wave.State = function() {
  this.initialize();
};
wave.State.prototype = {
  initialize: function() {
    this.state = {};
  },
  get: function(key, optDefault) {
    return this.state[key] || optDefault;
  },
  put: function(key, value) {
    this.state[key] = value;
  },
  getKeys: function() {
    var keys = [];
    for (var k in this.state) keys.push(k);
    return keys;
  },
  reset: function() {
    this.state = {};
    wave.ws.send('status|reset');
  },
  clear: function() {
    this.state = {};
  },
  merge: function(delta) {
    LOG.getInto("wave.State.merge");
    for (var key in delta) {
      this.state[key] = delta[key];
    }
    LOG.debug("state changed. >> " + this.toDebugString());
    LOG.goOut();
  },
  submitDelta: function(delta) {
    LOG.getInto("wave.State.submitDelta");
    if (wave.stateCallback) {
      this.merge(delta);
      LOG.debug('sending : ' + this.toString());
      wave.ws.send(this.toString());
    }
    LOG.goOut();
  },
  submitValue: function(key, value) {
    LOG.getInto("wave.State.submitValue");
    this.state[key] = value;
    LOG.debug("state changed. >> " + this.toDebugString());
    if (wave.stateCallback) {
      LOG.debug('sending : ' + this.toString());
      wave.ws.send(state);
    }
    LOG.goOut();
  },
  toString: function() {
    LOG.getInto("wave.State.toString");
    var ret = '';
    for (var key in this.state) {
      if(key){
        if(this.state[key]){
          ret += key + '|' + this.state[key] + '!!';
        } else {
          ret += key + '|' + '!!';
        }
      } else {
        LOG.debug("undefined value for key: " + key);
      }
    }
    // ºÇ¸å¤Î!!¤ÏÍ¾·×¤Ê¤Î¤Ç¼è¤ê½ü¤¤¤ÆÊÖ¤¹
    ret = ret.slice(0,-2);
    LOG.debug("returning : " + ret);
    LOG.goOut();
    return ret;
  },
  fromString: function(str) {
    LOG.getInto("wave.State.fromString");
    LOG.debug("str : " + str);
    str.split("!!").forEach(function(e){
      var a = e.split("|");
      this.state[a[0]] = a[1];
    }.bind(this));
    LOG.debug("state changed. >> " + this.toDebugString());
    LOG.goOut();
    return this.state;
  },
  toDebugString: function() {
    LOG.getInto("wave.State.toDebugString");
    var ret = "{\n";
    for (var key in this.state) {
      if(key) ret += key + ' | ' + this.state[key] + "\n";
    }
    ret += '}';
    LOG.goOut();
    return ret;
  },
  toDebugHtml: function() {
    LOG.getInto("wave.State.toDebugHtml");
    var ret = "<table>";
    for (var key in this.state) {
      if(key){
        ret += '<tr>';
        ret += '<td>' + key + '</td>';
        ret += '<td>' + this.state[key] + '</td>';
        ret += '</tr>';
      }
    }
    ret += '</table>';
    LOG.goOut();
    return ret;
  },
  sync: function(){
    try{
      if (wave.stateCallback) {
        if (wave.ws) {
          wave.ws.send("status|sync");
        } else {
          throw("wave.ws seems not defined.");
        }
      } else {
        throw("wave.stateCallback seems not defined.");
      }
    }
    catch(e){
      if(LOG) LOG.debug("sync fail : " + e);
    }
  }
};

wave.util = {};
wave.util.printJson = function(obj, optPretty, optTabs) {
};

//wave.viewer = new wave.Participant();
