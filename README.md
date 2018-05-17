# JsLoader

JsLoader is a utility tool that helps to dynamically load Javascript file in a DOM environment.


## Do you need it ?

This module is certainly a must-have in any of these situations:

 + You have a lot of script dependencies, but you are tired of writing billions of `<script>` tag in your `.html`

 + You need to load new Javascript source at runtime

 + The url / path to your dependencies is unknown before a specific `.js` file is loaded


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
> Just imagine 20 more `<script></script>` lines...


## Installation

Just download / clone the source anywhere, and add a a script tag that links to anywhere

```html
<script type="text/javascript" src="path/to/anywhere/js-loader.js"></script>
```

That's it, you are ready to use the `JsLoader` class.


## Features

It provides a static class named `JsLoader`, associated with a single public method named `load()`

The `load()` method allows to load JS files described *however* you want: a single String, an Array of String, an Object structured as a file tree (see the [examples](#code-example)).  
You can also mix any of the previous data structures, it (should) works too: an Array of Objects, an Object composed of Array and String, an Array of Arrays...

It returns a new `Promise` containing every loaded script, so you can chain it easily.

## Code Example

### File Loading

#### String

It can be the path to a saved file, or a url to a hosted file.  
Don't worry about the `.js` extension, it's optionnal so you can save up to 0.017s of your time.

```js
// this is valid;
JsLoader.load("path/to/your/file.js");

// this is also valid;
JsLoader.load("http://url/to/some/code.js");

// this is still valid, it will load 'path/to/other/script.js'
JsLoader.load("path/to/other/script");
```

#### Array

You can use an Array structure to list all your files

```js
JsLoader.load(["file1.js", "file2.js"]);

JsLoader.load([
  "directory/file1.js",
  "https://url/to/secure/script",
  "../directory/relative/to/html/foobar.js"
]);
```

#### Object

This structure can be used to avoid writing repetitively the path to a directory. The keys of the object will be used as directory name, until a final `String` value is reached.

```js
JsLoader.load({
  "top_dir/": {
    "foo/": "file.js",    // load "top_dir/foo/file.js"
    "bar/": "file2"       // load "top_dir/bar/file2.js"
  },
  "buzz/": "lightning.js" // load "buzz/lightning.js"
});
```

There are also two specific keys that can be used: `"."` and `"?"`.


The `"."` key is used to indicate the current directory in the file tree.

```js
JsLoader.load({
  "top_dir/": {
    ".": "file.js",    // load "top_dir/file.js"
    "bar/": "file2"       // load "top_dir/bar/file2.js"
  },
  "buzz/": "lightning.js" // load "buzz/lightning.js"
});
```

The `"?"` key is used to configure the file to load. It should at least specify the `src` of the file, relative to the file tree.

The full configuration is as follows:

 + `src`: String, path to the file, relative to the file tree position. **REQUIRED**
 + `id`: String, ID of the file to query it later (**query not implemented**)
 + `cache`: Boolean, set to false to disable storage in the cache (default: true)
 + `async`: Boolean, set to true to enable async script loading (default: false)
 + `type`: String, the MIME type of the file (default: "text/javascript")


```js
JsLoader.load({
  "top_dir/": {
    ".": "file.js",    // load "top_dir/file.js"
    "bar/": {
      "?": {  // load top_dir/bar/file2.js asynchronously without cache storage
        src: "file2.js"
        async: false,
        cache: false
      }
    }
  },
  "buzz/": "lightning.js" // load "buzz/lightning.js"
});
```


#### Mixin

You can also mix any of the previous data structures!

```js
JsLoader.load({
  "dir/": {
    ".": "file.js"
    "ect/": "ly.js"  // load "dir/ect/ly.js"
  },
  "buzz/": {
    "?": {
      src: "lightning"  // load buzz/lightning.js
      async: true,     // asynchronously
      cache: false    // without cache storage
    }
  }
});
```

Mix **more**!

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


### Chain Execution

The `load()` function returns a `Promise`, that can be used to wait for the loading to finish.

```js
JsLoader.load({...}).then(function () {
  // do something
});
```

```js
function foo() {
  // do something
}

JsLoader.load({...}).then(foo);
```

The function `foo()` will only be executed when the JsLoader has finished working.

## License

Not yet
