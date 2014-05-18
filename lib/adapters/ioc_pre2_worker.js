/**
 * socket.io-client-pre2 worker
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
  Worker.call(this);

  this.destUri = opts.dest;
};

// Inherits from `EventEmitter.`
IoWorker.prototype.__proto__ = BaseWorker.prototype;

// proto funcs
(function(){

  // @overload 
  this.createClient = function(){
    debug('create client, connect to ' + this.destUri);
    //  mock ioc, for testing terminate func
    this.client = ioc(this.destUri, { transports: ['websocket'], multiplex: false });

    this.client.on('connect', this.handleConnect.bind(this));
    this.client.on('connect_error', this.handleConnectError.bind(this));
    this.client.on('connect_timeout', this.handleTimeout.bind(this));
    this.client.on('reconnect', this.handleReconnect.bind(this));
    this.client.on('reconnect_error', this.handleReconnectError.bind(this));
    this.client.on('reconnect_failed', this.handleReconnectFailed.bind(this));
    return this.client;
  };

  // @overload
  this.disconnect = function(socket){
    socket.io.engine.close();
  };

  // @overload
  this.sendMessage = function(socket, msg){
    socket.send(msg);
  };
  
  // private funcs

  this.handleConnect = function(){
    debug('handle connect...');
    
    this.client.on('message', function(msg){
      debug('client recv msg: ', msg);
    });    
  };

  this.handleConnectError = function(err){
    debug('handle connect error: ' + err);
  };

  this.handleTimeout = function(){
    debug('handle timeout ');
  };

  this.handleReconnect = function(){
    debug('handle reconnect');
  };

  this.handleReconnectError = function(err){
    debug('handle reconnect error', err);
  };

  this.handleReconnectFailed = function(){
    debug('handle reconnect failed');
  };
}).call(IoWorker.prototype);
