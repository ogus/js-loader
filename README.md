# JsLoader

JsLoader is a utility tool that helps dynamically loading Javascript file in a DOM environment.


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
> Just imagine 20 more `<script></script>` tags...


## Installation

Just download/clone this repository anywhere to get the source files, and add a script tag that links to anywhere

```html
<script type="text/javascript" src="path/to/anywhere/js-loader.js"></script>
```

That's it, you are ready to go !


## Features

It provides a *static* class named `JsLoader`, associated with two public function.

The `load()` function allows to load JS files passed in arguments, and returns a new `Promise` containing every loaded script, so you can chain it easily.  
The *nopromise* version also allows chaining by returning the JsLoader object and defining a `then()` that accept a function as argument.

The `require()` function allows to require a script that has been previously loaded, and return it. If the script has not been loaded, it load it synchronously.

The structure of the `load()` arguments has been made as permissive as possible. It can accept a **String**, an **Array**, or an **Object** where the *keys* will be used as directory name (see the [examples](#code-example)).  
You can even mix any of those argument, everything should work ! And if does not, you can happily open a new issue ;)


## Code Example

### File Loading

#### String

It can be the path to a saved file, or the url to a hosted file.  
Don't worry about the `.js` extension, it's optionnal so you can save up to 0.017s of your time.

```js
// this is valid;
JsLoader.load("http://url/to/some/code.js");

// this is aslo valid, it will load 'path/to/script.js'
JsLoader.load("path/to/script");
```

#### Array

You can use an Array structure to list all your files

```js
JsLoader.load(["file1.js", "src/file2.js"]);

JsLoader.load([
  "directory/file1.js",
  "https://url/to/secure/script.js",
  "../directory/relative/to/html/foobar.js"
]);
```

#### Object

This JSON-like structure can be used to avoid writing repetitively the path to a directory containing several scripts.  
The keys of the object are used as directory name, and concatenated until the file name

```js
JsLoader.load({
  "directory/": {
    "foo/": "file.js",    // load "directory/foo/file.js"
    "bar/": "file2"       // load "directory/bar/file2.js"
  },
  "buzz/": "lightning.js" // load "buzz/lightning.js"
});
```

There are also two specific keys that can be used: `"."` and `"?"`.


The `"."` key is used to indicate the current directory in the file tree.

```js
JsLoader.load({
  "directory/": {
    ".": "file.js",    // load "directory/file.js"
    "bar/": "file2"       // load "directory/bar/file2.js"
  }
});
```

The `"?"` key is used to indicate the configuration of the file to load.  
When an object possess this key, it will be read as the script identifier and the loader will search for other configuration parameters.

When passing the `"?"` key, its value can be set as an empty string to avoid passing an ID

> An object can not indicate a directory AND the configuration of a script

The loader will consider for the following keys:

 + `?`: *String*, ID of the file. Useful to `require()` it later
 + `src`: *String*, path to the file (relative to the file tree) **REQUIRED**
 + `cache`: *Boolean*, set to true to enable cache storage (default: true)
 + `async`: *Boolean*, set to true to enable async script loading (default: false)
 + `type`: *String*, the MIME type of the file (default: "text/javascript")


```js
JsLoader.load({
  "directory/": {
    "foo/": "file.js",
    "bar/": {
      "?": "",            // no ID povided
      src: "file2.js",    // load "directory/bar/file2.js"
      async: false,       // synchronously
    },
  },
  "buzz/": {
    src: "path/to/lightning",   // load "buzz/path/to/lightning.js"
    "?": "light",               // as "light"
    cache: true                 // with cache storage (this is default)
  }
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
