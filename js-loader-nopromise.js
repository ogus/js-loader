var JsLoader = window.JsLoader = (function (window, document) {
  "use strict";

  var script_count = 0;
  var callback = null;
  var cache = {};

  function load(data) {
    _load("", data);
    return this;  // return this for chained call with 'then()'
  }

  function then(f) {
    if(typeof(f) == "function"){
      callback = f;
    }
  }

  function require(key) {
    if(typeof(key) !== "string") {
      return;
    }

    if (cache[key]) {
      return cache[key];
    }
    else {
      _fetch("", {
        src: key,
        async: false
      });
      return cache[key];
    }
  }


  function _load(path, data) {
    if (typeof(data) === "string") {
      _fetch(path+data);
    }
    else if (Array.isArray(data)) {
      for (var d of data) {
        _load(path, d);
      }
    }
    else if (typeof(data) === "object") {
      if (data.hasOwnProperty("?")) {
        _fetch(path, data);
      }
      else {
        for (var k of Object.keys(data)) {
          if (k === ".") {
            _load(path, data[k]);
          }
          else {
            _load(path+k, data[k]);
          }
        }
      }

    }
  }

  function _fetch(root, config) {
    if(!config) {
      config = { src: "" };
    }

    if (config.hasOwnProperty("src")) {
      config._url = root + String(config.src);
      let id = config["?"] || config._url;

      if (cache[id]) {
        console.log("Required script already in cache");
        return cache[id];
      }

      let script = _script(config);
      _append(script, document.head);

      if(config["?"] || config.cache !== false) {
        cache[id] = script;
      }
    }
  }

  function _append(script, el) {
    script_count++;
    let loading = true;

    script.onload = script.onreadystatechange = function () {
      if (loading && (!script.readyState || script.readyState === "loaded" || script.readyState === "complete")) {
        loading = false;
        script.onload = script.onreadystatechange = null;

        script_count--
        if(_ready()) {
          _callback();
        }
      }
    }

    el.appendChild(script);
  }

  function _script(config) {
    let s = config._url.split(".");
    if (s[s.length-1] != "js") {
      config._url += ".js";
    }

    let script = document.createElement("script");
    script.type = config.type || "text/javascript";
    script.async = !!config.async;
    script.src = config._url;

    return script;
  }

  function _callback() {
    if(typeof(callback) == "function"){
      callback();
    }
  }

  function _ready () {
    return script_count === 0;
  }

  return  {
    load: load,
    then: then,
    require: require
  };

})(window, window.document);
