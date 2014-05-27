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

var AdapterExportedEvents = ['connect', 'disconnect', 'complete', 'error',
  'subevent', 'answer'];

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
  AdapterExportedEvents.forEach(function(ev){
    adapter.on(ev, function(data){
      process.send({ cmd: ev, data: data });
    });
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

