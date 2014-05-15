/**
 * a benchmark app for testing scalability of socket.io-pre2
 * 
 * Copyright (C) 2014 guanglin.an (lucky315.an@gmail.com)
 */


var EventEmitter = require('events').EventEmitter;
var cluster = require('cluster');
var debug = require('debug')('benchmark:benchmark');


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

  this.init();

  debug('create Benchmark opts:', opts);
};

// Inherits from `EventEmitter.`
Benchmark.prototype.__proto__ = EventEmitter.prototype;

// proto funcs
(function(){
  this.init = function(){
    cluster.setupMaster({
      exec: './worker.js',
      args: ['--use', 'https'],
      silent: true
    });
  };

  this.run = function(){
    debug('run benchmarking ......' + this.dest);
  };

  this.stop = function(cb){
    debug('stop benchmarking .....');

    //after stop workers, exit
    cb && cb();
  };
}).call(Benchmark.prototype);
