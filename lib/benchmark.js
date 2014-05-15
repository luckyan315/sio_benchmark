/**
 * a benchmark app for testing scalability of socket.io-pre2
 * 
 * Copyright (C) 2014 guanglin.an (lucky315.an@gmail.com)
 */


var ioc = require('socket.io-client');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('benchmark:benchmark');

var Benchmark = exports = module.exports = function(opts){
  if(!(this instanceof Benchmark)) return new Benchmark(opts);
  EventEmitter.call(this);
  
  // dest server uri
  this.dest = opts._[0];
  this.concurrency = opts.c;
  this.requests = opts.n;

  debug('create Benchmark opts:', opts);
};

// Inherits from `EventEmitter.`
Benchmark.prototype.__proto__ = EventEmitter();

// proto funcs
(function(){

  this.run = function(){
    debug('run benchmarking ......' + this.dest);
  };

  this.stop = function(cb){
    debug('stop benchmarking .....');

    //after stop workers, exit
    cb && cb();
  };
}).call(Benchmark.prototype);
