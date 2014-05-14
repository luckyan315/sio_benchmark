// test server for sio_benchmarkding 

"use strict";

var sio = require('socket.io');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('benchmark:server');

var server = exports = module.exports = Server;

// constructor
function Server(opts){
  if (!(this instanceof Server)) return new Server(opts);
  EventEmitter.call(this);

  debug('Create Sio Server');
};

// Inherits from `EventEmitter.`
Server.prototype.__proto__ = EventEmitter.prototype;

// proto funcs
(function(){

}).call(Server.prototype);
