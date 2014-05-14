/**
 * Node websocket server benchmarking tool
 * 
 * Copyright (C) 2014 guanglin.an (lucky315.an@gmail.com)
 */

var argv = require('minimist')(process.argv.slice(2));
var debug = require('debug')('benchmark:sb');
var Benchmark = require('./lib/benchmark.js');


var benchmark = new Benchmark(argv);

benchmark.run();