/**
 * worker factory, controlled by master
 * 
 * see more : `./benchmark.js`
 * 
 * Copyright (C) 2014 guanglin.an (lucky315.an@gmail.com)
 */

"use strict";

var argv = require('minimist')(process.argv.slice(2));
var debug = require('debug')('benchmark:worker');

debug('worker run with args: ', argv);