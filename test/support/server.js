// test server for sio_benchmarkding 

"use strict";

var sio = require('socket.io');
var debug = require('debug')('benchmark:server');

var server = exports = module.exports = Server;

// constructor
function Server(opts){
  if (!(this instanceof Server)) return new Server(opts);
  EventEmitter.call(this);

  return sio(opts);
};
