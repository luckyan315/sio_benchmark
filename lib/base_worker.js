/**
 * a base worker adapter skel
 * 
 * see more : `./ioc_worker.js`
 *  
 * Copyright (C) 2014 guanglin.an (lucky315.an@gmail.com)
 */

"use strict";

var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('benchmark:worker');

/**
 * Module exports.
 */

var Worker = exports = module.exports = function(opts){
  EventEmitter.call(this);

  debug('create worker....', arguments);
};

// Inherits from `EventEmitter.`
Worker.prototype.__proto__ = EventEmitter.prototype;

// proto funcs
(function(){

}).call(Worker.prototype)
