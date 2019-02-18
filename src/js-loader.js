var JsLoader = (function (window, document) {
  'use strict';

  var cache = {};
  var promises = [];

  /**
  * Public function to load the javascript files
  * @param {String|Array|Object} data Data to load
  */
  function load(data) {
    _parse("", data);
    return Promise.all(promises);
  }

  /**
  * Public function to request a javascript files.
  * If the file has not been loaded in the cache, return the cached value,
  * otherwise fetch the script synchronously
  * @param {String} key Path or ID of the requested file
  */
  function require(key) {
    if (cache[key]) {
      return Promise.resolve(cache[key]);
    }
    else {
      return Promise.resolve(_fetch(key, {async: false}));
    }
  }

  /**
  * Private function that recursively loads the data.
  * @param path Path to the current data, progressively concatenated
  * @param data Data to load (recursive concatenation of all path)
  */
  function _parse(path, data) {
    if (typeof(data) === "string") {
      promises.push(_fetch(path + data));
    }
    else if (Array.isArray(data)) {
      for (var d of data) {
        _parse(path, d);
      }
    }
    else if (typeof(data) === "object") {
      for (var k of Object.keys(data)) {
        if (k === "?") {
          promises.push(_fetch(path, data[k]));
        }
        else if (k === ".") {
          _parse(path, data[k]);
        }
        else {
          _parse(path+k, data[k]); // append path before loading child data
        }
      }
    }
  }

  /**
  * Fetch the script described by its path and configuration,
  * and set a new promise to detect the load completion
  * @param path Full path to the JS file
  * @param config Object describing the fetch configuration
  */
  function _fetch(path, config) {
    config = config || {};
    let url = path + String(config["src"] || "");
    let id = config["id"] || url;
    if (cache[id]) {
      return cache[id];
    }
    let promise = _append(document.head, _script(url, config));
    if(config.cache !== false) {
      cache[id] = promise;
    }
    return promise;
  }

  /**
  * Append a script to a DOM element, and return a Promise for completion
  * @param element DOM element where the script will be attached
  * @param script Js script that will be loaded
  */
  function _append(element, script) {
    return new Promise(function(resolve, reject) {
      let loading = true;
      script.onerror = reject;
      script.onload = script.onreadystatechange = function () {
        if (loading && (!script.readyState || script.readyState === "loaded" || script.readyState === "complete")) {
          loading = false;
          script.onload = script.onreadystatechange = null;
          resolve(script);
        }
      }
      element.appendChild(script);
    });
  }

  /**
  * Create a script element from configuration
  * @param url Script url
  * @param config Script configuration
  */
  function _script(url, config) {
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
