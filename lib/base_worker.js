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
  this.run = function(nClients){
    for(var i = 0; i < nClients; ++i){
      var client = this.createClient();

      this.clients.push(client);
    }
  };

  // terminal connections
  this.terminate = function(){
    var self = this;
    _.forEach(this.clients, function(ioc){
      //do disconnect 
      self.disconnect();
    });
  };

  // Pure Virtual APIs
  // should impl in real adapter inst, 

  this.createClient = function(){
    debug('Not implements');
  };
  this.disconnect = function(){
    debug('Not implements');
  };

}).call(Worker.prototype);
