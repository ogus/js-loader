var JsLoader = (function (window, document) {
  'use strict';

  var cache = {};
  var promises = [];

  function load(data) {
    parse("", data);
    return Promise.all(promises);
  }

  function require(key) {
    if (cache[key]) {
      return Promise.resolve(cache[key]);
    }
    else {
      return Promise.resolve(fetch(key, {async: false}));
    }
  }

  function parse(src, data) {
    if (typeof data == 'string') {
      promises.push(fetch(src + data));
    }
    else if (Array.isArray(data)) {
      for (let child of data) {
        parse(src, child);
      }
    }
    else if (typeof(data) === "object") {
      for (let k of Object.keys(data)) {
        if (k == '?') {
          promises.push(fetch(path, data[k]));
        }
        else if (k == '.') {
          parse(path, data[k]);
        }
        else {
          parse(path + k, data[k]);
        }
      }
    }
  }

  function fetch(srcIn, config) {
    config = config || {};
    let src = srcIn + (config['src'] || '');
    let id = config['id'] || src;
    if (cache[id]) {
      return cache[id];
    }
    let promise = append(newScript(src, config));
    if(config['cache'] !== false) {
      cache[id] = promise;
    }
    return promise;
  }

  function append(element, script) {
    return new Promise(function(resolve, reject) {
      let loading = true;
      script.onerror = reject;
      script.onload = script.onreadystatechange = function () {
        if (loading && (!script.readyState || script.readyState == 'loaded' || script.readyState == 'complete')) {
          loading = false;
          script.onload = script.onreadystatechange = null;
          resolve(script);
        }
      }
      document.head.appendChild(script);
    });
  }

  function newScript(url, config) {
    let s = url.split(".");
    if (s[s.length-1] != "js") {
      url += ".js";
    }
    let script = document.createElement("script");
    script.src = url;
    script.type = config['type'] || "text/javascript";
    script.async = !!config['async'];
    return script;
  }

  return  {
    load: load,
    require: require
  };
})(window, window.document);
