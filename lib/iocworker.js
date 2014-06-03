/**
 * worker factory, controlled by master
 * 
 * see more : `./benchmark.js`
 * 
 * Copyright (C) 2014 guanglin.an (lucky315.an@gmail.com)
 */

"use strict";

var argv = require('minimist')(process.argv.slice(2));
var path = require('path');
var debug = require('debug')('benchmark:iocworker');
var EventEmitter = require('events').EventEmitter;
var ioc = require('socket.io-client');
var _ = require('lodash');

// ioc worker
var iw = {};

/**
 * Module exports.
 */
var IOCWorker = function(){
  EventEmitter.call(this);

  this.clients = [];
  this.nConnected = 0;
  this.nSendMsg = 0;
  this.nRecvMsg = 0;
  this.nRequests = 0;
  this.nIntervalTime = 2000;

  // test ping-pong
  this.nRecvPong = 0;  
};

// Inherits from `EventEmitter.`
IOCWorker.prototype.__proto__ = EventEmitter.prototype;

// proto funcs
(function(){
  this.run = function(data){
    var nClients = data.nClients || 1;
    var self = this;
    var uri = data.uri;
    var intervalTime = this.nIntervalTime = data.intervalTime;
    this.nRequests = data.nMsgs || 1;

    console.log('[data] ', data);

    for(var i = 1; i <= nClients; ++i){
      setTimeout(function(){
        var client = self.createClient(uri);
        self.clients.push(client);        
      }, i * intervalTime / nClients);
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
      self.emit('complete', this.nSendMsg);
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

  this.createClient = function(uri, opts){
    debug('create client, connect to %s', uri);
    //  mock ioc, for testing terminate func
    var manager = ioc.Manager(uri, { transports: [ 'websocket' ], multiplex: false, reconnection: false});
    // support root ns so far
    var client = manager.socket('/');
    var self = this;    
    // init socket listeners
    client.on('connect', function(){
      self.nConnected++;

      // for ping pong test
      client.on('answer', function(msg){
        self.nRecvPong++;
        self.emit('answer', msg);
      });

      // var _t = new Date().getTime();
      // client.emit('ask', {message: 'ping-pong test', start: _t});
    
      setInterval(function(){
        var now = new Date().getTime();
        client.emit('ask', {message: 'ping-pong test', start: now});
      }, self.nIntervalTime);

      self.emit('connect');      
    });

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

  this.disconnect = function(socket){
    socket.io.engine.close();
    this.nConnected--;

    this.emit('disconnect');
  };

  this.sendMessage = function(socket, msg){
    socket.send(msg);
    this.nSendMsg++;
  };
  
  // private funcs

  this.handleConnect = function(socket){
    var self = this;
    debug('handle connect...');
    this.nConnected++;

    socket.on('message', function(msg){
      debug('client recv msg: %s', msg);
      self.nRecvMsg++;
    });

    // for ping pong test

    socket.on('answer', function(msg){
      self.nRecvPong++;
      self.emit('answer', msg);
    });
    
    setInterval(function(){
     var data = new Date();
     // console.log('[Emit] ', data);
     var now = data.getTime();
     socket.emit('ask', {message: 'ping-pong test', start: now});      
    }, this.nIntervalTime);


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
      for(var i = 0; i < self.nConnected; ++i){
        // debug('[worker] %d, [index]: %d, [iCli]: %d, [nConnected]: %d, [emitIntervalTime]: %d', process.pid, i, iCli, this.nConnected, emitIntervalTime);
        var socket = self.clients[i];
        setTimeout(function(){
          var now = new Date().getTime();
          socket.emit('ask', {message: msg, start: now});
        }, i * intervalTime / self.nConnected);
      }
    }, intervalTime);
  };

}).call(IOCWorker.prototype);

var ExportedEvents = ['connect', 'disconnect', 'complete', 'error',
  'subevent', 'answer'];

function createWorker(){

  iw = new IOCWorker(argv);

  // register listeners
  ExportedEvents.forEach(function(ev){
    iw.on(ev, function(data){
      process.send({ cmd: ev, data: data });
    });
  });

  // register process listeners
  // recv ctrl cmd from master, 
  process.on('message', function(ctrlData){
    // debug('worker %d recv msg: %j', process.pid, ctrlData);
    if (!iw) {
      debug('ioc worker not created!');
      return;
    }
    var func = ctrlData.cmd || 'run';

    if (!iw[func]) {
      debug('IOC Worker no method called %s', func);
      return;
    }
  
    iw[func].call(iw, ctrlData.data);

  });

  // hook signal killed by master
  process.on('SIGINT', function(){
    debug('Worker %d catch SIGINT signal!', process.pid);
    iw.terminate();
  });
};

/**
 * global create worker
 */
createWorker();

