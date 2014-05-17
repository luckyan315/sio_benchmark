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


/**
 * Module exports.
 */
exports = module.exports = createWorker;

function createWorker(opts){
  if(!(this instanceof createWorker)) return new createWorker(opts);

  this.initAdapter();
};

(function(){
  this.initAdapter = function(){
    var Adapter = null;
    try{
      Adapter = require(path.join(__dirname, 'adapters', argv.adapter));
    } catch(err){
      debug('[initAdapter]', err);
      process.exit(1);
    }

    this.adapter = new Adapter(argv);
    return this.adapter;
  };
}).call(createWorker.prototype);

/**
 * global create worker
 */
var worker = createWorker();

/**
 * recv ctrl cmd from master, 
 */
process.on('message', function(data){
  debug('worker ' + process.pid + ' recv msg: ' , data);
  var adapter = worker.adapter;
  var func = data.cmd || 'run';
  var slice = Array.prototype.slice;

  if (!adapter[func]) {
    debug('Adapter: ' + argv.adapter + ' no method called ' + func);
    return;
  }
  
  adapter[func].apply(adapter, slice.call(arguments, 0));

});

// hook signal killed by master
process.on('SIGINT', function(){
  debug('Worker ' + process.pid + ' catch SIGINT signal!');
  var adapter = worker.adapter;

  adapter.terminate();
});
