/**
 * socket.io-client-pre4 worker
 * 
 * Copyright (C) 2014 guanglin.an (lucky315.an@gmail.com)
 */

var ioc = require('socket.io-client');
var BaseWorker = require('../base_worker.js');
var debug = require('debug')('benchmark:ioc_worker');

/**
 * Module exports.
 */
var IoWorker = exports = module.exports = function(opts){
  BaseWorker.call(this);

  this.destUri = opts.dest;
  this.timeout = opts.timeout || 2000;
  this.transport = opts.transport || 'websocket';
};

// Inherits from `EventEmitter.`
IoWorker.prototype.__proto__ = BaseWorker.prototype;

// proto funcs
(function(){

  // @overload 
  this.createClient = function(){
    debug('create client, connect to %s', this.destUri);
    //  mock ioc, for testing terminate func
    this.manager = ioc.Manager(this.destUri, { transports: [ this.transport ], multiplex: false, reconnection: false});
    this.client = this.manager.socket('/');
    
    // init socket listeners
    this.client.on('connect', this.handleConnect.bind(this));
    this.client.on('disconnect', this.handleDisconnect.bind(this));
    this.client.on('error', this.handleError.bind(this));

    // init manager listeners
    this.manager.on('connect_error', this.handleConnectError.bind(this));
    this.manager.on('connect_timeout', this.handleTimeout.bind(this));
    this.manager.on('reconnect', this.handleReconnect.bind(this));
    this.manager.on('reconnect_error', this.handleReconnectError.bind(this));
    this.manager.on('reconnect_failed', this.handleReconnectFailed.bind(this));

    return this.client;
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

  this.handleConnect = function(){
    var self = this;
    debug('handle connect...');
    this.nConnected++;

    this.client.on('message', function(msg){
      debug('client recv msg: %s', msg);
      self.nRecvMsg++;
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
}).call(IoWorker.prototype);
