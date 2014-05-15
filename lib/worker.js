/**
 * a worker adapter 
 * 
 * Copyright (C) 2014 guanglin.an (lucky315.an@gmail.com)
 */

"use strict";

var EventEmitter = require('events').EventEmitter;


/**
 * Module exports.
 */

var Worker = exports = module.exports = function(opts){
  EventEmitter.call(this);
   
};

// Inherits from `EventEmitter.`
Worker.prototype.__proto__ = EventEmitter.prototype;


// proto funcs
(function(){

}).call(Worker.prototype)