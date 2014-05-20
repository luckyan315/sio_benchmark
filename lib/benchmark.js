/**
 * a benchmark app for testing scalability of socket.io-pre4
 * 
 * Copyright (C) 2014 guanglin.an (lucky315.an@gmail.com)
 */


var EventEmitter = require('events').EventEmitter;
var cluster = require('cluster');
var basename = require('path').basename;
var debug = require('debug')('benchmark:benchmark');
var _ = require('lodash');

/**
 * Module exports.
 */

var Benchmark = exports = module.exports = function(opts){
  if(!(this instanceof Benchmark)) return new Benchmark(opts);
  EventEmitter.call(this);
  
  // dest server uri
  this.dest = opts._[0] || 'ws://localhost';
  this.nConcurrency = opts.c || 1;
  this.nRequests = opts.n || 1;
  this.nWorkers = opts.w || 1;
  this.nClientsPerWorker = opts.ioc || 1;
  this.init();
  
  this.nConnected = 0;
  this.nSendRequests = 0;
  this.nCompleteWorkers = 0;

  debug('create Benchmark opts: %j', opts);
};

// Inherits from `EventEmitter.`
Benchmark.prototype.__proto__ = EventEmitter.prototype;

Benchmark.WORKERS_MAX = 10;

// proto funcs
(function(){
  this.init = function(){
    cluster.setupMaster({
      exec: './lib/worker.js',
      args: ['--adapter', 'ioc_worker.js', '--dest', this.dest]
    });
    this.cluster = cluster;
  };

  this.run = function(){
    debug('run benchmarking ......%s', this.dest);

    var nMsgPerWorker = Math.round(this.nRequests / this.nConcurrency);
    var self = this;
    for(var i = 0; i < this.nConcurrency; ++i){
      this.cluster.fork();
    }

    // register in workers
    _.forEach(this.cluster.workers,  function(worker){
      worker.on('message', self.handleWorkerMessage.bind(self, worker));
    });
    
    this.cluster.on('exit', function(worker, code, signal){
      debug('worker: %s died', worker.id);
    });

    // ctrl & manager workers
    this.send('run', { nMsgs: nMsgPerWorker, nClients: this.nClientsPerWorker });
  };

  this.handleWorkerMessage = function(worker, msg){
    debug('worker: %s recv msg: %j', worker.id, msg);
    
    var funcName = 'on' + msg.cmd.toLowerCase();
    var data = msg.data;
    var slice = Array.prototype.slice;

    if(!this[funcName]){
      debug('%s no method called %s', basename(__filename), funcName);
      return;
    }

    this[funcName].apply(this, slice.call(arguments, 0));
  };
  
  // broadcasting workers
  this.broadcast = function(msg, cb){
    this.send('send', msg);
    cb && cb();
  };
  
  this.stop = function() {
    debug('stop benchmarking .....');

    _.forEach(this.cluster.workers, function(worker){
      debug('killing worker %s', worker.id);
      worker.kill();
    });

    this.emit('exit');
  };

  // private funcs
  
  /**
   * broadcasting workers via client adapter
   * 
   * @param {String} cmd a public method should be defined in a adapter
   * @param {String|Object} data message object pass to adapter for broadcasting
   * @api private
   */
  this.send = function(cmd, data){
    _.forEach(this.cluster.workers, function(worker){
      // nClients should digest nMsgs in total
      worker.send({ cmd: cmd, data: data });
    });
  };


  // @api private
  this.onconnect = function(worker, msg){
    this.nConnected++;
    if(this.nConnected === this.nClientsPerWorker * this.nConcurrency){
      this.emit('all connected', this.nConnected);
    }
  };

  // @api private
  this.ondisconnect = function(worker, msg){
    this.nConnected--;
    debug('Now %d clients connected!', this.nConnected);
  };
  
  this.oncomplete = function(worker, msg){
    var nSndReq = msg.data;
    this.nCompleteWorkers++;
    this.nSendRequests += parseInt(nSndReq, 10);
    debug('a worker complete job');
    if(this.nCompleteWorkers === this.nConcurrency){
      this.emit('all complete', this.nSendRequests);
    }
  };

  // @api private
  this.onerror = function(worker, msg){
    debug('Worker %d occur error: %j', worker.id, msg);
  }

}).call(Benchmark.prototype);
