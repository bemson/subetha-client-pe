# SubEtha Peer Events

Communicate with SubEtha peers using arbitrary events

version 0.0.0-alpha
by Bemi Faison

## Description

SubEtha Peer Events (or PE) is a SubEtha-Client plugin that enables publishing and subscribing events between peers. This plugin is bundled with the SubEtha module.

**Note:** Please see the [SubEtha project page](https://github.com/bemson/subetha), for important background information, plus development, implementation, and security considerations.

## Usage

PE provides methods to communicate events to channel peers, once the client connection is established. (Events are arbitrary strings that trigger callbacks.) Event subscription is done via the existing `Client#on()` method.

### Communicating events

The `#emit()` and `#send()` methods share the same argument signature. Simply provide an arbitrary event name - i.e., a string with one or more characters. Any additional arguments are passed along to peers that have subscribed to your event. (The arguments must conform to the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/The_structured_clone_algorithm))

Use `Client#emit()` to broadcast your event to all peers in your channel. Below demonstrates rigging a client to broadcast once a connection is made.

```js
var client = new Subetha.Client();
client.on('::connect', function () {
  this.emit('hello world!', 'some', 'additional', 'arguments');
});
```

Use `Peer#send()` to message a single peer. Below demonstrates rigging a client to respond to sending peer - the Peer instance via the event object. (Peers are available by id within the `Client@peers` hash.)

```js
var client = new Subetha.Client();
client.on('hello world!', function (evt) {
  evt.peer.send('hello back!', 'from', 'me');
});
```

**Note:** You may not send events that begin with a double-colon (`::`). These are reserved for _network_ events, published by the SubEtha-Client module.

### Handling Events

The `Client#on()` method may be used to subscribe to peer events sent with `#emit()` or `#send()`. Simply subscribe to the same event passed to those methods and provide a callback function.

Callbacks of peer events receive a _peer-event object_. As well, if additional parameters were passed to `#emit()` or `#send()`, they will likewise be passed as additional, arbitrary arguments to the callback.

While the peer-event object contains lots of useful information, it's most important member is `peer`: the client whom sent the event. This is a Peer instance from the client's own `@peers` hash, meaning any state you set before (or now) is available now (or later).

Below demonstrates a callback which tracks the number of times each peer sends a given event.

```js
var client = new Subetha.Client().open('flu@public');

client.on('ah... ah-choo!!', function (evt) {
  var peer = evt.peer;

  // initalize "cnt" member, if not present
  if (!peer.hasOwnProperty('cnt')) {
    peer.cnt = 0;
  }

  // increment count
  peer.cnt++;

  console.log('peer %s sneezes: %d', peer.id, peer.cnt);
});
```


## API

Below is reference documentation for the SubEtha Peer Events module - i.e., additions to [SubEtha-Client module](https://github.com/bemson/subetha-client).

**Note:** Instance methods are prefixed with a pound-symbol (`#`). Instance properties are prefixed with an at-symbol (`@`). Static members are prefixed with a double-colon (`::`).

### Subetha::Client

##### Peer event object

Callbacks receive the following _peer-event object_, along with any additonal parameters, sent by the peer.

  * `data` - An array of any additional arguments passed to the `#emit()` or `#send()` method.
  * `id` - Unique identifier for this event.
  * `peer` - The peer that sent this message.
  * `sent`:  The time (as a Date instance) when the message was sent.
  * `timeStamp`: The time (in milliseconds) when the event occurred.
  * `type` - The original string passed to the `#emit()` or `#send()` method.

#### Client#emit()

Broadcast a message to channel peers.

```
client.emit(event [, args, ...]);
```

   * **event**: _(string)_ The event to trigger.
   * **args**: _(mix)_ Remaining arguments, to be sent as additional parameters.

The _event_ argument may not begin with a double-colon (`::`).

Returns `true` when the event is sent. Otherwise, `false`.

### Subetha::Peer

#### Peer#send()

Send an event to this peer.

```
peer.send(event [, args, ... ])
```

   * **event**: _(string)_ The event to trigger.
   * **args**: _(mix)_ Remaining arguments, to be sent as additional parameters.

The _event_ argument may not begin with a double-colon (`::`).

Returns `true` when the event is sent. Otherwise, `false`.

## Installation

SubEtha Peer Events works within, and is intended for, modern JavaScript browsers. It is available on [bower](http://bower.io/search/?q=subetha-client-pe), [component](http://component.github.io/) and [npm](https://www.npmjs.org/package/subetha-client-pe) as a [CommonJS](http://wiki.commonjs.org/wiki/CommonJS) or [AMD](http://wiki.commonjs.org/wiki/Modules/AsynchronousDefinition) module.

If SubEtha Peer Events isn't compatible with your favorite runtime, please file an issue or pull-request (preferred).

### Dependencies

SubEtha Peer Events depends on the following module:

  * [SubEtha-Client](https://github.com/bemson/subetha-client)

### Web Browsers

Use a `<SCRIPT>` tag to load the _subetha-client-pe.min.js_ file in your web page. The file does _not_ include the SubEtha-Client module. You must include this as well, _before_ loading this plugin, which updates members of the `Subetha` namespace, in the global scope.

```html
  <script type="text/javascript" src="path/to/subetha-client.min.js"></script>
  <script type="text/javascript" src="path/to/subetha-client-pe.min.js"></script>
  <script type="text/javascript">
    // ... SubEtha dependent code ...
  </script>
```

**Note:** The minified file was compressed by [Closure Compiler](http://closure-compiler.appspot.com/).

Generally speaking, the standalone version of this plugin should not be installed manually, since it's bundled with the SubEtha module. Install the [SubEtha module](https://github.com/bemson/subetha) instead - a rollup of the SubEtha-Client and recommended plugins.

### Package Managers

  * `npm install subetha-client-pe`
  * `component install bemson/subetha-client-pe`
  * `bower install subetha-client-pe`

**Note:** The npm package uses `subetha-client` as a [peerDependency](https://www.npmjs.org/doc/files/package.json.html#peerdependencies).

### AMD

Assuming you have a [require.js](http://requirejs.org/) compatible loader, configure an alias for the SubEtha Peer Events module (the term "subetha-client-pe" is recommended, for consistency). The _subetha-client-pe_ module exports a module namespace.

```js
require.config({
  paths: {
    'subetha-client-pe': 'libs/subetha-client-pe'
  }
});
```

Then require and use the module in your application code:

```js
require(['subetha-client-pe'], function (Subetha) {
  // ... SubEtha dependent code ...
});
```

**Caution:** You should not load the minified file via AMD. Instead use AMD optimizers like [r.js](https://github.com/jrburke/r.js/), in order to roll-up your dependency tree.

## License

SubEtha-Event is available under the terms of the [Apache-License](http://www.apache.org/licenses/LICENSE-2.0.html).

Copyright 2014, Bemi Faison