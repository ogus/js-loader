# JsLoader

JsLoader is a small, fast, simple module that helps loading Javascript source in a browser environment


## Why ?

This module is certainly a must-have in any of these situations:

 + You need to load new JS source at runtime
 + You have a lot of JS dependencies, but you are tired of writing billions of `<script>` tag in your `.html` header
 + You want to use a single JS file to load other JS source before computing everything

Moreover, it has the following features:

 + It is small: ~2.3 Ko for the non-minified version
 + It is fast: straighforward implementation && no external dependencies
 + It is easy to use: modular input arguments easily configurable
 + It is browser-friendly: both ES5 && ES6 version available

## Installation

### Step 1
You can clone the repository & include the `js-loader.js` file in your project:
```sh
git clone https://github.com/ogus/js-loader.git
```

Alternatively, you can import it from a Gist file *(not yet)*

### Step 2

Then import the module as the **first** `<script>` tag of your HTML

```html
<script src="path/to/js-loader.js"></script>
```


## Usage

```js
// load a JS file from a URL
JsLoader.load("http://url/to/some/code.js");

// load a JS file from a relative path
JsLoader.load("../path/to/script");

// load many files, in many directories
JsLoader.load({
  "dir1/": ["file1", "file2", "file3"],
  "dir2/": {
    ".": "hello",
    "sub/": [ "foo", "bar", "subsub/script"]
  }
}).then(function () {
  // Callback that let you wait for loading completion !
});
```


## API

The script provides a *global static class* `JsLoader`, with two public methods.

The `JsLoader.load(args)` function allows to load JS files passed as arguments. and

The `JsLoader.require(script)` function allows to require a script instantly. that has been previously loaded, and return it. If the script has not been loaded yet, it will be loaded synchronously.


### `JsLoader.load(args)`

Allows to load JS files passed as arguments.

Return either a `Promise` (default) or a context (ES5) that can be used for chain execution when all JS source are loaded with the function `then()`
```js
JsLoader.load(...).then(function () {
  // all scripts are loaded
});
```

### `JsLoader.require(src)`

Allows to require a script.

If it has been previously loaded return it instantly, or else it will be loaded synchronously.

### Input `args`

The structure of the input arguments has been made as flexible as possible.

You can use a `String`, an `Array`, an `Object` with *keys* as directory name, or a mix of all of this argument types.

*Note:* The `.js` extension will automatically be added to any script if it is missing (so you can save up to 0.017s of your precious time).

#### String

`args` can be a `String` that describes the path to a local file, or the url to a remote file.

```js
JsLoader.load("http://url/to/some/code.js");

JsLoader.load("path/to/script");  // load 'path/to/script.js'
```

#### Array

`args` can be an `Array` structure that list all JS source files.

```js
JsLoader.load(["./file1", "./src/file2"]);

JsLoader.load([
  "directory/file1.js",
  "https://url/to/secure/script.js",
  "../directory/relative/to/html/foobar.js"
]);
```

#### Object

`args` can be a *JSON*-like structure. Each keys of the object is used as a sub-directory name, and each value is used as a file name.

This can avoid writing repetitively the path to a directory containing several scripts.

```js
JsLoader.load({
  "src/": {
    "foo/": "file.js",    // load "src/foo/file.js"
    "bar/": "file2"       // load "src/bar/file2.js"
  },
  "buzz/": "lightning.js" // load "buzz/lightning.js"
});
```

There is also two specific `Object` keys, with special properties : `.` and `?`

#### Reserved Object key: `.`

The `.` key is used to indicate the current directory in the file tree.

```js
JsLoader.load({
  "directory/": {
    ".": "file.js",    // load "directory/file.js"
    "bar/": "file2"    // load "directory/bar/file2.js"
  }
});
```

#### Reserved Object key: `?`

The `?` key is used to define the configuration for a JS source file.

When this key appears in the file tree structure, the value is expected to be a single `Object`.
The loader will looks for the following parameters:

 + `src`: *String*, path to the file (relative to the file tree) **REQUIRED**
 + `id`: *String*, ID of the file. Useful to `require()` it later
 + `cache`: *Boolean*, set to false to disable cache storage (default: true)
 + `async`: *Boolean*, set to true to enable async script loading (default: false)
 + `type`: *String*, the MIME type of the file (default: "text/javascript")

```js
JsLoader.load({
  "directory/": {
    "foo/": "file.js",
    "?": {src: "bar/file2.js", async: false}, // load "directory/bar/file2.js" synchronously
    "buzz/": {
      "?" : {
        src: "path/to/lightning",  // load "buzz/path/to/lightning.js"
        id: "light",               // as "light"
        cache: false               // without cache storage
      }
    }
  }
});
```

#### Mixin

You can also mix any of the previous data structures !

Load an `Array` of `Objects`:
```js
JsLoader.load([
  "http://": ["url/script", "other/url/script.min"],
  "dir/": [
    "foo", {
      "bar/": {
        "bob",
        {"?": "bobby", src: "bobby", async: false}
      }
    }
  ],
  "ok.js"
]);
/*
Loads 6 files:
http://url/script.js, http://other/url/script.min.js,
dir/foo.js, dir/bar/bob.js, dir/bar/bobby.js (as 'bobby'),
ok.js
*/
```

Load a complicated `Object`:
```js
JsLoader.load({
  "pika/": ["file1", "file2", "file3"],
  "loop/": {
    ".": "hello.js",
    "child/": [
      "foo",
      "bar",
      {
        "gadget/": "far_away"
      }
    ]
  },
  "letters/": ["a", "b", ["d", "e"], "f": ["g", "h"]]
});
/*
Loads 15 files:
pika/file1.js, pika/file2.js, pika/file3.js,
loop/hello.js, loop/child/foo.js,
loop/child/bar.js, loop/child/gadget/far_way.js,
letters/a.js, letters/b.js, letters/c.js, letters/d.js,
letters/e.js, letters/f/g.js, letters/f/h.js
*/
```
An `Array` inside another `Array` does not add sub-directories. You might never use it, but who knows...


## License

This project is licensed under the WTFPL - see [LICENSE](LICENSE) for more details
