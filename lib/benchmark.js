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
  this.concurrency = opts.c || 5;
  this.requests = opts.n || 10;
  this.workersCnt = opts.workersCnt;
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
      args: ['--use', 'https'],
    });
  };

  this.run = function(){
    debug('run benchmarking ......' + this.dest);

    var nWorkers = this.workersCnt || (this.requests / this.concurrency);
    for(var i = 0; i < nWorkers; ++i){
      cluster.fork();
    }

    // init listeners
    Object.keys(cluster.workers).forEach(function(id){
      cluster.workers[id].on('message', function(msg){
        debug('worker: ' + id + 'recv msg: ' + msg);
      });
    });

    cluster.on('exit', function(worker, code, signal){
      debug('worker: ' +  worker.process.pid  + ' died');
    });

  };

  this.stop = function(cb){
    debug('stop benchmarking .....');

    _.forEach(cluster.workers, function(worker){
      debug('killing worker ' + worker.id);
      worker.kill();
    });

    //after stop workers, exit
    cb && cb();
  };
}).call(Benchmark.prototype);
