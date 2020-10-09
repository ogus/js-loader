var JsLoader = (function (window, document) {
  'use strict';

  var count = 0;
  var callback = null;
  var cache = {};

  function load(data) {
    parse("", data);
    return this;
  }

  function then(f) {
    if(typeof f == 'function'){
      callback = f;
    }
  }

  function require(src) {
    if (!cache[src]) {
      fetch(src, {async: false});
    }
    return cache[src];
  }

  function parse(src, data) {
    if (typeof data == 'string') {
      fetch(src + data);
    }
    else if (Array.isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        parse(src, data[i]);
      }
    }
    else if (typeof data == 'object') {
      var keys = Object.keys(data);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i] == '?') {
          fetch(src, data[keys[i]]);
        }
        else if (keys[i] == '.') {
          parse(src, data[keys[i]]);
        }
        else {
          parse(src + keys[i], data[keys[i]]);
        }
      }
    }
  }

  function fetch(srcIn, config) {
    config =  config || {};
    var src = srcIn + (config['src'] || '');
    var id = config['id'] || src;
    if (!cache[id]) {
      var script = newScript(src, config);
      attach(script);
      if(config['cache'] !== false) {
        cache[id] = script;
      }
    }
  }

  function attach(script) {
    count++;
    var loading = true;
    script.onload = script.onreadystatechange = function () {
      if (loading && (!script.readyState || script.readyState === 'loaded' || script.readyState === "complete")) {
        count--
        loading = false;
        script.onload = script.onreadystatechange = null;
        if(count === 0 && (typeof callback == 'function')) {
          callback();
        }
      }
    }
    document.head.appendChild(script);
  }

  function newScript(src, config) {
    var s = src.split(".");
    if (s[s.length-1] != "js") {
      src += ".js";
    }
    var script = document.createElement("script");
    script.src = src;
    script.type = config['type'] || "text/javascript";
    script.async = !!config['async'];
    return script;
  }

  return  {
    load: load,
    then: then,
    require: require
  };
})(window, window.document);
