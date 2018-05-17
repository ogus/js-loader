var JsLoader = window.JsLoader = (function (window, document) {
  'use strict';

  var cache = {};
  var promise_list = [];

  /**
  * Public function to load the javascript files
  * @param data The data to load (a String, or an Array, or an Object, or any combinations of those)
  * @param func The callback to apply
  */
  function load(data, func) {
    _load("", data);
    return Promise.all(promise_list);
  }

  /**
  * Public function to request a javascript files.
  * If the file has not been loaded in the cache, return the cached value,
  * otherwise fetch the script synchronously
  * @param key The full path or the ID of the requested file
  */
  function require(key) {
    if(typeof(key) !== "string") {
      return;
    }

    if (cache[key]) {
      return Promise.resolve(cache[key]);
    }
    else {
      return Promise.resolve(
        _fetch("", {
          src: key,
          async: false
        })
      );
    }
  }

  /**
  * Private functon that recursively loads the data.
  * @param path The path the current data, progressively concatenated
  * @param func The data to load (recursive concatenation of all path)
  */
  function _load(path, data) {
    if (typeof(data) === "string") {
      promise_list.push( _fetch(path+data) );   // fetch data
    }
    else if (Array.isArray(data)) {
      for (var d of data) {
        _load(path, d);
      }
    }
    else if (typeof(data) === "object") {
      if (data.hasOwnProperty("?")) {
        promise_list.push( _fetch(path, data) );  // fetch data with config
      }
      else {
        for (var k of Object.keys(data)) {
          if (k === ".") {
            _load(path, data[k]);   // get data in currently defined path
          }
          else {
            _load(path+k, data[k]); // append path before loading child data
          }
        }
      }
    }
  }

  /**
  * Fetch the script described by its path and configuration,
  * and set a new promise to detect the load completion
  * @param root The full path to the js file
  * @param config The object describing the fetch configuration
  */
  function _fetch(root, config) {
    if(!config) {
      config = { src: "" };   // Set default fetch config
    }

    if (config.hasOwnProperty("src")) {
      config._url = root + String(config.src);
      let id = config["?"] || config._url;

      if (cache[id]) {
        return cache[id];
      }

      let promise = _append(_script(config), document.head);

      if(config["?"] || config.cache !== false) {
        cache[id] = promise;
      }

      return promise;
    }
  }

  /**
  * Append a script to a DOM element, and return a Promise for completion
  * @param script The script to add
  * @param el The document element on which the script will be attached
  */
  function _append(script, el) {
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

      el.appendChild(script);
    });
  }

  /**
  * Create a script element from a configuration
  * @param config The script configuration
  */
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

  return  {
    load: load,
    require: require
  };

})(window, window.document);

// https://github.com/MiguelCastillo/load-js/blob/master/src/load-js.js
