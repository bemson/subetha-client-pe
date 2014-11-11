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
      protoSlice = Array.prototype.slice
    ;

    function transmitEvent(client, type, args, peers) {
      return !!value &&
        typeof value === 'string' &&
        client._transmit(
          'event',
          peers,
          {
            type: type,
            data: args.length > 1 ? [].concat(args) : []
          }
        );
    }

    // broadcast event to peers
    Subetha.Client.prototype.emit = function (name) {
      var args = arguments;

      return transmitEvent(
        this,
        name,
        args.length > 1 ? protoSlice.call(args, 1) : [],
        0
      );
    };

    // transmit event to this peer
    Subetha.Peer.prototype.send = function (name) {
      var
        peer = this,
        args = arguments;

      // exit if peer is disabled
      if (!peer.state) {
        return false;
      }
      return transmitEvent(
        peer._client,
        name,
        args.length > 1 ? protoSlice.call(args, 1) : [],
        peer.id
      );
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
  typeof define === 'function',
  typeof exports != 'undefined',
  this
);