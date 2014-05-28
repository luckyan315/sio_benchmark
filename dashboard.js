/**
 * dashboard app provide Restful api inorder to master sio_benchmark 
 * 
 * Copyright (C) 2014 guanglin.an (lucky315.an@gmail.com)
 */

"use strict";

var express = require('express');
var app = express();
var debug = require('debug')('benchmark:express');
var sprintf = require('sprintf');
var parseArgs = require('minimist');
var benchmark = require('./');

var http_port = 6666;

app.get('/', function(req, res, next){
  res.send('Welcome to dashboard \n');
});

app.get('/start', function(req, res, next){
  var nRequests = req.query.n;
  var nConcurrency = req.query.c;
  var nClientsPerWorker = req.query.ioc;
  var nIntervalTime = req.query.t;
  var dest = req.query.dest;

  if(!nRequests || !nConcurrency || !nClientsPerWorker || 
    !nIntervalTime || !dest){
    res.writeHead(500);
    res.end('\x1b[1;31mPlease pass all params\x1b[m\n' + JSON.stringify(req.query));
    return;
  }

  var args = packQuery(nRequests, nConcurrency, 
    nClientsPerWorker, nIntervalTime, dest);
  debug('[args] %j', args);

  var nb = benchmark(args);

  nb.on('all connected', function(){
    debug('All clients: %d connected !', nConcurrency * nClientsPerWorker);
    // start ping-pong benchmark
    nb.emitping();
    res.send(sprintf('\x1b[1;32mStart benchmark...\x1b[m ' + JSON.stringify(args)));    
  });

  nb.on('error', function(err){
    debug('[error] %j', err);
    res.writeHead(500);
    res.end('\x1b[1;31mOccur Error: \x1b[m' + err.toString());
  });

  // start benchmarkding ...
  nb.run();


});


app.listen(http_port, function(){
  debug('Express server listening port on %d ...', http_port);
});

function packQuery(n, c, ioc, t, dest){
  return parseArgs(sprintf('-n %s -c %s --ioc %s -t %s %s',
   n, c, ioc, t, dest).split(' '));
};