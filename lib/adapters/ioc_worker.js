/**
 * socket.io-client-pre4 worker
 * 
 * Copyright (C) 2014 guanglin.an (lucky315.an@gmail.com)
 */

var ioc = require('socket.io-client');
var BaseWorker = require('../base_worker.js');
var debug = require('debug')('benchmark:ioc_worker');
var _ = require('lodash');

/**
 * Module exports.
 */
var IoWorker = exports = module.exports = function(){
  BaseWorker.call(this);

  // test ping-pong
  this.nRecvPong = 0;  
};

// Inherits from `EventEmitter.`
IoWorker.prototype.__proto__ = BaseWorker.prototype;

// proto funcs
(function(){

  // @overload 
  this.createClient = function(uri, opts){
    debug('create client, connect to %s', uri);
    //  mock ioc, for testing terminate func
    var manager = ioc.Manager(uri, { transports: [ 'websocket' ], multiplex: false, reconnection: false});
    // support root ns so far
    var client = manager.socket('/');
    
    // init socket listeners
    client.on('connect', this.handleConnect.bind(this, client));
    client.on('disconnect', this.handleDisconnect.bind(this));
    client.on('error', this.handleError.bind(this));

    // init manager listeners
    manager.on('connect_error', this.handleConnectError.bind(this));
    manager.on('connect_timeout', this.handleTimeout.bind(this));
    manager.on('reconnect', this.handleReconnect.bind(this));
    manager.on('reconnect_error', this.handleReconnectError.bind(this));
    manager.on('reconnect_failed', this.handleReconnectFailed.bind(this));

    return client;
  };

  // @overload
  this.disconnect = function(socket){
    socket.io.engine.close();
    this.nConnected--;

    this.emit('disconnect');
  };

  // @overload
  this.sendMessage = function(socket, msg){
    socket.send(msg);
    this.nSendMsg++;
  };
  
  // private funcs

  this.handleConnect = function(client){
    var self = this;
    debug('handle connect...');
    this.nConnected++;

    client.on('message', function(msg){
      debug('client recv msg: %s', msg);
      self.nRecvMsg++;
    });

    // for ping pong test

    client.on('answer', function(msg){
      self.nRecvPong++;
      self.emit('answer', msg);
    });
    
    this.emit('connect');
  };

  this.handleConnectError = function(err){
    debug('handle connect error: %s', err);
    this.emit('error', err);
  };

  this.handleTimeout = function(timeout){
    debug('handle timeout ', timeout);
  };

  this.handleReconnect = function(){
    debug('handle reconnect');
  };

  this.handleReconnectError = function(err){
    debug('handle reconnect error', err);
    this.emit('error', err);
  };

  this.handleReconnectFailed = function(){
    debug('handle reconnect failed');
    this.emit('error', 'ioc reconnect failed');
  };

  this.handleDisconnect = function(reason){
    debug('handle disconnected...', reason);
    this.nConnected--;
    
    this.emit('disconnect');    
  };

  this.handleError = function(err){
    debug('handle error %s', err);
    this.emit('error', err);
  };

  this.pubEvent = function(data){
    var event = data.event;
    var msg = data.message;
    _.forEach(this.clients, function(socket){
      socket.emit(event, msg);
    });
  };

  this.subEvent = function(data){
    var self = this;
    var event = data.event;

    _.forEach(this.clients, function(socket){
      socket.on(event, function(){
        var args = Array.prototype.slice.call(arguments, 0);
        // pack args
        args.unshift('subevent');
        self.emit.apply(self, args);
      });
    });
  };

  // for ping pong test
  this.emitping = function(data){
    if(!data.intervalTime){
      debug('[Param: %j]', data);
      throw Error('no interval time');
    }
    var intervalTime = parseInt(data.intervalTime, 10);
    var msg = data.msg || 'pingpong test';
    var self = this;
    // debug('[intervalTime] %d, [nConn] %d', intervalTXime, this.nConnected);

    var emitIntervalTime = this.nConnected > 1 ? Math.floor(parseInt(intervalTime / (this.nConnected - 1), 10)) : intervalTime;
    // emit msg smoothly

    setInterval(function(){
      for(var i = 1; i <= self.nConnected; ++i){
        // debug('[worker] %d, [index]: %d, [iCli]: %d, [nConnected]: %d, [emitIntervalTime]: %d', process.pid, i, iCli, this.nConnected, emitIntervalTime);
        var socket = self.clients[i];
        setTimeout(function(){
          var now = new Date().getTime();
          socket.emit('ask', {message: msg, start: now});
        }, i * intervalTime / self.nConnected);
      }
    }, intervalTime);
  };

}).call(IoWorker.prototype);
