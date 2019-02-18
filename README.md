# JsLoader

JsLoader is a utility tool that helps dynamically to load Javascript source in a browser context.


## Background

This module is certainly a must-have in any of these situations:

 + You have a lot of script dependencies, but you are tired of writing billions of `<script>` tag in your `.html`

 + You need to load new Javascript source at runtime

 + The url to your dependencies is unknown before a specific `.js` file is loaded


It aims to avoid this kind of **nightmare**:
```html
<!DOCTYPE html>
<html>
  <head>
    [...]
    <script type="text/javascript" src="path/to/script1.js"></script>
    <script type="text/javascript" src="path/to/script2.js"></script>
    <script type="text/javascript" src="http://url/to/cool_script.js"></script>
    <script type="text/javascript" src="path/script3.js"></script>
    <script type="text/javascript" src="path/script4.js"></script>
    <script type="text/javascript" src="path/script.js"></script>
    [...]
  </head>
</html>
```
> Just imagine 20 more `<script></script>` tags...


## Installation

Download / clone this repository and add `js-loader.min.js` form the `src` directory in your own project.

Then import the module as the first `<script>` tag

```html
<script type="text/javascript" src="path/to/js-loader.min.js"></script>
```


## Usage

```js
JsLoader.load("http://url/to/some/code.js");

JsLoader.load("path/to/script");

JsLoader.load({
  "dir1/": ["file1", "file2", "file3"],
  "dir2/": {
    ".": "hello.js",
    "child/": [ "foo", "bar", "sub/script"]
  }
}).then(function () {
  // do something after all scripts are loaded
});
```


## Features

The script provides a *static* class `JsLoader`, with two public methods.

The `JsLoader.load(args)` function allows to load JS files passed in arguments, and returns a new `Promise` containing every loaded script, so you can chain it easily.

The `JsLoader.require(script)` function allows to query a script that has been previously loaded, and return it. If the script has not been loaded yet, it will be loaded synchronously.

### `JsLoader.load(args)`

The structure of the method arguments has been made as permissive as possible.

You can use a `String`, an `Array`, an `Object` with *keys* as directory name, or a mix of all of this argument types.

*Note:* The `.js` extension will automatically be added to any script if it is missing (so you can save up to 0.017s of your time).

#### String

`args` can be a `String` describing the path to a saved file, or the url to a hosted file.

```js
JsLoader.load("http://url/to/some/code.js");

JsLoader.load("path/to/script");  // load 'path/to/script.js'
```

#### Array

`args` can be an `Array` structure to list all your files

```js
JsLoader.load(["file1.js", "src/file2.js"]);

JsLoader.load([
  "directory/file1.js",
  "https://url/to/secure/script.js",
  "../directory/relative/to/html/foobar.js"
]);
```

#### Object

`args` can be a *JSON*-like structure, to avoid writing repetitively the path to a directory containing several scripts.

Each keys of the object is used as a sub-directory name, and each value is used as a file name

```js
JsLoader.load({
  "directory/": {
    "foo/": "file.js",    // load "directory/foo/file.js"
    "bar/": "file2"       // load "directory/bar/file2.js"
  },
  "buzz/": "lightning.js" // load "buzz/lightning.js"
});
```

#### Reserved Object key: `"."`

There are two specific keys with special properties for an `Object`: `"."` and `"?"`


The `"."` key is used to indicate the current directory in the file tree.

```js
JsLoader.load({
  "directory/": {
    ".": "file.js",    // load "directory/file.js"
    "bar/": "file2"       // load "directory/bar/file2.js"
  }
});
```

#### Reserved Object key: `"?"`

The `"?"` key is used to set up the configuration of a specific file to load.

When this key appears in the file tree sctructure, the value is expected to be a single object defining various parameters
The loader will looks for the following parameters:

 + `src`: *String*, path to the file (relative to the file tree) **REQUIRED**
 + `id`: *String*, ID of the file. Useful to `require()` it later
 + `cache`: *Boolean*, set to true to enable cache storage (default: true)
 + `async`: *Boolean*, set to true to enable async script loading (default: false)
 + `type`: *String*, the MIME type of the file (default: "text/javascript")

```js
JsLoader.load({
  "directory/": {
    "foo/": "file.js",
    "?": {
      src: "bar/file2.js",  // load "directory/bar/file2.js"
      async: false,         // synchronously
    },
  },
  "buzz/": {"?" : {
    src: "path/to/lightning",  // load "buzz/path/to/lightning.js"
    id: "light",               // as "light"
    cache: false               // without cache storage
  }}
});
```


#### Mixin

You can also mix any of the previous data structures !


Load an Array of Objects
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


Load a complicated Object
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
Notice how the Array inside another Array does not add a sub-directory. You might never use it, but who knows...


## License

This project is licensed under the WTFPL - see [LICENSE](LICENSE) for more details
