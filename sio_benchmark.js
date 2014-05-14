/**
 * Node websocket server benchmarking tool
 * 
 * Copyright (C) 2014 guanglin.an (lucky315.an@gmail.com)
 */

var argv = require('minimist')(process.argv.slice(2));
var debug = require('debug')('benchmark:sb');
var Benchmark = require('./lib/benchmark.js');


var benchmark = exports = module.exports = function(opts){
  // opts left for unit test
  var args = opts || argv;
  var bm = new Benchmark(argv);

  return bm
};

if(process.env.NODE_ENV !== 'test') {
  benchmark().run();  
}
