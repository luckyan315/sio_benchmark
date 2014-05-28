/**
 * dashboard app provide Restful api inorder to master sio_benchmark 
 * 
 * Copyright (C) 2014 guanglin.an (lucky315.an@gmail.com)
 */

"use strict";

var express = require('express');
var app = express();
var debug = require('debug')('benchmark:express');

var http_port = 6666;

app.get('/', function(req, res, next){
  res.send('hell world');
});

app.listen(http_port, function(){
  debug('Express server listening port on %d ...', http_port);
});