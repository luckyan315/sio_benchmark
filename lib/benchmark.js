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
  
  this.connected = 0;
  
  debug('create Benchmark opts:', opts);
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
  };

  this.run = function(){
    debug('run benchmarking ......' + this.dest);

    var nMsgPerWorker = Math.round(this.nRequests / this.nConcurrency);
    var self = this;
    for(var i = 0; i < this.nConcurrency; ++i){
      cluster.fork();
    }

    // register in workers
    _.forEach(cluster.workers,  function(worker){
      worker.on('message', self.handleWorkerMessage.bind(self, worker));
    });
    
    cluster.on('exit', function(worker, code, signal){
      debug('worker: ' +  worker.process.pid  + ' died');
    });

    // ctrl & manager workers
    this.send('run', { nMsgs: nMsgPerWorker, nClients: this.nClientsPerWorker });
  };

  this.handleWorkerMessage = function(worker, msg){
    debug('worker: ' + worker.id + ' recv msg: ', msg);
    
    var funcName = 'on' + msg.cmd.toLowerCase();
    var data = msg.data;
    var slice = Array.prototype.slice;

    if(!this[funcName]){
      debug(basename(__filename) + ' no method called ' + funcName);
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

    _.forEach(cluster.workers, function(worker){
      debug('killing worker ' + worker.id);
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
    _.forEach(cluster.workers, function(worker){
      // nClients should digest nMsgs in total
      worker.send({ cmd: cmd, data: data });
    });
  };


  // @api private
  this.onconnect = function(worker, msg){
    this.connected++;
    if(this.connected === this.nClientsPerWorker * this.nConcurrency){
      this.emit('all connected', this.connected);
    }
  };

  // @api private
  this.ondisconnect = function(worker, msg){
    this.connected--;
    debug('Now ' + this.connected + ' clients' + ' connected!');
  };
  
  // @api private
  this.onerror = function(worker, msg){
    debug('Worker %d occur error: %j', worker.id, msg);
  }

}).call(Benchmark.prototype);
