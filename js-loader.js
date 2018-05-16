var JsLoader = window.JsLoader = (function (window, document) {
  'use strict';

  var cache = {};
  var promise_list = [];

  /**
  * Public function to load the javascript files
  * @param data The data to load (a String, or an Array, or an Object, or any combinations of those)
  * @param func The callback to apply
  */
  function load (data, func) {
    _load("", data);
    return Promise.all(promise_list);
  }

  /**
  * Private functon that recursively loads the data.
  * @param path The path the current data, progressively concatenated
  * @param func The data to load (recursive concatenation of all path)
  */
  function _load (path, data) {
    if (typeof(data) === "string") {
      _fetch(path+data);  // fetch data
    }
    else if (Array.isArray(data)) {
      for (var d of data) {
        _load(path, d);
      }
    }
    else if (typeof(data) === "object") {
      let keys = Object.keys(data);

      for (var k of keys) {
        if (k === ".") {
          _load(path, data[k]);   // get data in currently defined path
        }
        else if (k === "?") {
          _fetch(path, data[k]);  // fetch data with config
        }
        else {
          _load(path+k, data[k]); // append path before loading child data
        }
      }
    }
  }

  function _fetch (root, config) {
    if(!config) {
      config = { src: "" };   // Set default fetch config
    }

    if (config.hasOwnProperty("src")) {
      config._url = root + String(config.src);
      let id = config.id || config._url;

      if (cache[id]) {
        console.log("Required script already in cache");
        return cache[id];
      }

      let promise = _append(_script(config), document.head);

      if(config.id || config.cache !== false) {
        cache[id] = promise;
      }

      // return promise;
      promise_list.push(promise);
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
    load: load
  };

})(window, window.document);

// https://github.com/MiguelCastillo/load-js/blob/master/src/load-js.js
