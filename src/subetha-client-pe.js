/*!
 * SubEtha Peer Events
 * http://github.com/bemson/subetha-client-pe/
 *
 * Copyright 2014, Bemi Faison
 * Released under the Apache License
 */
!function (inAMD, inCJS, scope, undefined) {

  function initSubEthaClientPE() {

    var
      Subetha = ((inCJS || inAMD) ? require('subetha-client') : scope.Subetha),
      protoSlice = Array.prototype.slice,
      MSG_TYPE_EVENT = 'subetha/event'
    ;

    function isFullString(value) {
      return value && typeof value === 'string';
    }

    // fail when not a (or empty) string or begins with "::"
    function startsWithNetworkPrefix(str) {
      return str.substring(0,2) == '::';
    }

    function transmitEvent(client, type, args, peers) {
      return isFullString(type) &&
        !startsWithNetworkPrefix(type) &&
        client._transmit(
          MSG_TYPE_EVENT,
          peers,
          {
            type: type,
            data: args.length > 1 ? protoSlice.call(args, 1) : []
          }
        );
    }

    // broadcast event to peers
    Subetha.Client.prototype.emit = function (name) {
      return transmitEvent(
        this,
        name,
        arguments,
        0
      );
    };

    // transmit event to this peer
    Subetha.Peer.prototype.send = function (name) {
      var peer = this;

      // exit if peer is disabled
      if (!peer.state) {
        return false;
      }
      return transmitEvent(
        peer._client,
        name,
        arguments,
        peer.id
      );
    };

    // handle incoming "subetha/event" message
    Subetha.msgType[MSG_TYPE_EVENT] = function (client, peer, payload, details) {
      var
        args = payload.data,
        eventName = payload.type,
        customEvent;

      if (!isFullString(eventName) || startsWithNetworkPrefix(eventName)) {
        return;
      }

      // define custom event
      customEvent = {
        data: [].concat(args),
        id: details.id,
        peer: peer,
        timeStamp: details.timeStamp,
        type: eventName
      };

      // invoke fire based on presence of custom args
      if (args.length) {
        client.fire.apply(client, [eventName, customEvent].concat(args));
      } else {
        client.fire(eventName, customEvent);
      }
    };

    return Subetha;
  }

  // initialize and expose module, based on the environment
  if (inAMD) {
    define(initSubEthaClientPE);
  } else if (inCJS) {
    module.exports = initSubEthaClientPE();
  } else if (scope.Subetha) {
    initSubEthaClientPE();
  }
}(
  typeof define == 'function',
  typeof exports != 'undefined',
  this
);