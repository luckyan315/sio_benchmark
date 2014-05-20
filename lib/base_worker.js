/**
 * a base worker adapter
 * 
 * see more : `./adapters`
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
  this.nConnected = 0;
  this.nSendMsg = 0;
  this.nRecvMsg = 0;
  this.nRequests = 0;
};

// Inherits from `EventEmitter.`
Worker.prototype.__proto__ = EventEmitter.prototype;

// proto funcs
(function(){
  this.run = function(data){
    var nClients = data.nClients || 1;
    var self = this;
    this.nRequests = data.nMsgs || 1;

    for(var i = 0; i < nClients; ++i){
      var client = this.createClient();

      this.clients.push(client);
    }

    var nRound = Math.ceil(this.nRequests/nClients);
    for(var i = 0; i < nRound; ++i){
      this.send('stress tests');
    }

    function checkComplete(){
      if(this.nSendMsg < this.nRequests) {
        debug('worker %s already send %d messages...', process.pid, this.nSendMsg);
        return setTimeout(checkComplete, 200);        
      }

      debug('worker %s totally send %d messages.', process.pid, this.nSendMsg);
      this.emit('complete', this.nSendMsg)
    }

    checkComplete.call(this);
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
  
  // Pure Virtual Interfaces
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
