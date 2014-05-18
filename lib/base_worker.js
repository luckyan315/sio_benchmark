/**
 * a base worker adapter skel
 * 
 * see more : `./ioc_worker.js`
 *  
 * Copyright (C) 2014 guanglin.an (lucky315.an@gmail.com)
 */

"use strict";

var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('benchmark:worker');
var _ = require('lodash');

/**
 * Module exports.
 */

var Worker = exports = module.exports = function(opts){
  EventEmitter.call(this);

  this.clients = [];
};

// Inherits from `EventEmitter.`
Worker.prototype.__proto__ = EventEmitter.prototype;

// proto funcs
(function(){
  this.run = function(data){
    var nClients = data.nClients || 1;
    var nMsgs = data.nMsgs || 1;

    for(var i = 0; i < nClients; ++i){
      var client = this.createClient();

      this.clients.push(client);
    }
  };

  // terminal connections
  this.terminate = function(){
    var self = this;
    _.forEach(this.clients, function(socket){
      //do disconnect 
      self.disconnect(socket);
    });
  };
  
  this.send = function(msg){
    var self = this;
    _.forEach(this.clients, function(socket){
      self.sendMessage(socket, msg);
    });
  };
  
  // Pure Virtual APIs
  // should impl in real adapter inst, 

  this.createClient = function(){
    debug('Not implements');
  };
  this.disconnect = function(socket){
    debug('Not implements');
  };
  this.sendMessage = function(socket, msg){
    debug('Not implements');
  };
}).call(Worker.prototype);
