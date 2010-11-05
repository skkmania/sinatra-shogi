// vim: set expandtab ts=2 :
 WS_URL = "ws://ubu-pg84:8081";
        //WS_URL = "ws://localhost:8081";

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
    this.state = opt.state;
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
if(wave.log) wave.log.debug("connecting to "+WS_URL+"...");
wave.ws.onopen = function() {
  wave.log.debug("connected.");

  //text = "first message from client";
  //wave.ws.send(text);
  //wave.log.debug("message sent: "+text);
}

wave.ws.onclose = function() {
  wave.log.debug("disconnected...");
}

wave.ws.onerror = function(msg) {
  wave.log.debug("failed to connect："+msg);
}

wave.ws.onmessage = function(event) {
  wave.log.debug("message received: "+event.data);
  if ($("message")){ $("message").insert("<p>"+event.data+"</p>"); }
  if (wave.stateCallback) {
    wave.state.fromString(event.data);
    wave.stateCallback(wave.state);
  }
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

wave.Participant = function() {
  this.initialize();
};
wave.Participant.prototype = {
  initialize: function() {
    this.displayName = 'name' + Math.floor(Math.random() * 100);
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
  },
  submitDelta: function(state) {
    if (wave.stateCallback) {
      this.state = state;
      wave.ws.send(this.toString());
    }
  },
  submitValue: function(key, value) {
    this.state[key] = value;
    if (wave.stateCallback) {
      wave.ws.send(state);
    }
  },
  toString: function() {
    var ret = '';
    for (var key in this.state) {
      ret += key + '|' + this.state[key] + '!!';
    }
    return ret;
  },
  fromString: function(str) {
    str.split("!!").forEach(function(e){
      var a = e.split("|");
      this.state[a[0]] = a[1];
    }.bind(this));
    return this.state;
  }
};

wave.util = {};
wave.util.printJson = function(obj, optPretty, optTabs) {
};

wave.viewer = new wave.Participant();
