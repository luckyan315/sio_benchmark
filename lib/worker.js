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
var adapter = {};


function createWorker(){
  var Adapter = null;
  try{
    Adapter = require(path.join(__dirname, 'adapters', argv.adapter));
  } catch(err){
    debug('[initAdapter]', err);
    return process.send({cmd: 'error', error: err});
  }

  adapter = new Adapter(argv);

  // register listeners
  adapter.on('connect', function(){
    process.send({cmd: 'connect'});
  });

  adapter.on('disconnect', function(){
    process.send({cmd: 'disconnect'});
  });

  adapter.on('complete', function(nSendReq){
    process.send({cmd: 'complete', data: nSendReq});
  });

  adapter.on('error', function(err){
    process.send({ cmd: 'error', data: err });
  });

  adapter.on('subevent', function(msg){
    process.send({cmd: 'subevent', data: msg});
  });

  // for ping pong
  adapter.on('answer', function(n){
    process.send({cmd: 'answer', data: n});
  });

  // register process listeners

  // recv ctrl cmd from master, 
  process.on('message', function(ctrlData){
    // debug('worker %d recv msg: %j', process.pid, ctrlData);
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
    adapter.terminate();
  });
};

/**
 * global create worker
 */
createWorker();

