/**
 * a benchmark app for testing scalability of socket.io-pre2
 * 
 * Copyright (C) 2014 guanglin.an (lucky315.an@gmail.com)
 */


var ioc = require('socket.io-client');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('benchmark:benchmark');

var Benchmark = exports = module.exports = function(opts){
  EventEmitter.call(this);

  // [http[s]://]hostname[:port]/path
  this.dest = opts._[0];
  // concurrency
  // Number of multiple requests to perform at a time
  this.c = opts.c;
  // requests
  // Number  of requests to perform for the benchmarking
  this.n = opts.n;

  debug('create Benchmark opts:', opts);
};

// Inherits from `EventEmitter.`
Benchmark.prototype.__proto__ = EventEmitter();

// proto funcs
(function(){

  this.run = function(){
    debug('run benchmarking ......' + this.dest);
  }  
}).call(Benchmark.prototype);

