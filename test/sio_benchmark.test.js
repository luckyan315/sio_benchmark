// socket.io-pre2 benchmark application

require('should');
var ioc = require('socket.io-client');
var debug = require('debug')('benchmark:test');
var Server = require('./support/server.js');
var parseArgs = require('minimist');
var _ = require('lodash');
var benchmark = require('../');


//node socket.io benchmark(nb)
describe('sio benchmark ', function(){
  var port = 3000;
  var host = 'ws://localhost' + ':' + port;
  var sio = Server();

  before(function(){
    sio.listen(port, function(){
      debug('sio server listening port on %d', port);
    });
  });

  it('should close all connection as run stop', function(done){    this.timeout(30000);
    var mockArgs = parseArgs('-n 20 -c 1 --ioc 20 http://localhost:3000/user'.split(' '));
    var nb = benchmark(mockArgs);
    nb.on('all complete', function(nClients){
      nb.stop();
      // maybe it take 500ms ?
      setTimeout(function(){
        nb.nConnected.should.eql(0);
        done();
      }, 500);
    });
    nb.run();    
  });

  it('should occur error connect unknown port', function(done){
    var mockArgs = {
      _ : ['http://localhost:9898/user'],
      n : 1,
      c : 1,
      ioc: 1
    };
    var nb = benchmark(mockArgs);

    nb.on('error', function(err){
      nb.stop();
      debug('[error] %j', err);
      done();
    });

    nb.run();
  });

  it('should emit requests according -n (requests) param', function(done){
    var mockArgs = parseArgs('-n 5 -c 1 --ioc 1 http://localhost:3000/user'.split(' '));
    var expReq = 5;
    var nb = benchmark(mockArgs);
    nb.on('all complete', function(nReq){
      expReq.should.eql(nReq);
      nb.stop();      
      done();
    });
    nb.run();
  });

  it('should create workers instants by -c param', function(done){
    var mockArgs = parseArgs('-n 1 -c 1 --ioc 1 http://localhost:3000'.split(' '));
    var expWorkers = 1;
    var nb = benchmark(mockArgs);
    nb.on('all connected', function(nClients){
      expWorkers.should.eql(_.size(nb.cluster.workers));
      nb.stop();
      done();
    })
    nb.run();
  });

  it('should create ioc instants by --ioc param', function(done){
    var expClients = 10;
    var mockArgs = parseArgs('-n 10 -c 1 --ioc 10 http://localhost:3000/user'.split(' '));
    var nb = benchmark(mockArgs);
    nb.on('all connected', function(nClients){
      expClients.should.eql(nClients);
      nb.stop();
      done();
    });
    nb.run();
  });  
});