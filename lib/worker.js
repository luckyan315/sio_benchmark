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
      return process.send({cmd: 'error', error: err});
    }

    this.adapter = new Adapter(argv);

    // register listeners
    this.adapter.on('connect', function(){
      process.send({cmd: 'connect'});
    });

    this.adapter.on('disconnect', function(){
      process.send({cmd: 'disconnect'});
    });
    
    this.adapter.on('complete', function(nSendReq){

      process.send({cmd: 'complete', data: nSendReq});
    });
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
process.on('message', function(ctrlData){
  debug('worker %d recv msg: %j', process.pid, ctrlData);
  var adapter = worker.adapter;
  if (!adapter) {
    debug('adapter not created!');
    return;
  }
  var func = ctrlData.cmd || 'run';

  if (!adapter[func]) {
    debug('Adapter: %s no method called %s', argv.adapter, func);
    return;
  }
  
  adapter[func].call(adapter, ctrlData.data);

});

// hook signal killed by master
process.on('SIGINT', function(){
  debug('Worker %d catch SIGINT signal!', process.pid);
  var adapter = worker.adapter;

  adapter.terminate();
});
