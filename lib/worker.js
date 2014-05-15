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
var debug = require('debug')('benchmark:worker');
var Adapter = null;

try{
  Adapter = require(path.join(__dirname, argv.adapter));
} catch(err){
  debug(err);
  process.exit(1);
}

var worker = new Adapter();

process.on('message', function(msg){
  debug('worker ' + process.pid + ' recv msg: ' + msg);
});