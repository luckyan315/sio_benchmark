/**
 * a benchmark app for testing scalability of socket.io-pre2
 * 
 * Copyright (C) 2014 guanglin.an (lucky315.an@gmail.com)
 */


var EventEmitter = require('events').EventEmitter;
var cluster = require('cluster');
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
  this.init();

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
      args: ['--adapter', 'ioc_pre2_worker.js', '--dest', this.dest]
    });
  };

  this.run = function(){
    debug('run benchmarking ......' + this.dest);

    var nMsgPerWorker = Math.round(this.nRequests / this.nConcurrency);
    for(var i = 0; i < this.nConcurrency; ++i){
      cluster.fork();
    }
        
    cluster.on('exit', function(worker, code, signal){
      debug('worker: ' +  worker.process.pid  + ' died');
    });

    // ctrl & manager workers
    this.send('run', { nMsgs: nMsgPerWorker, nClients: 1 });

    this.emit('all connected');
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
   * @param {String | Object} data message object pass to adapter for broadcasting
   * @api private
   */
  this.send = function(cmd, data){
    _.forEach(cluster.workers, function(worker){
      // nClients should digest nMsgs in total
      worker.send({ cmd: cmd, data: data });
    });
  };

}).call(Benchmark.prototype);
