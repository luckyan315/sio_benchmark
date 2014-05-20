// socket.io-pre2 benchmark application

require('should');
var ioc = require('socket.io-client');
var debug = require('debug')('benchmark:test');
var Server = require('./support/server.js');
var parseArgs = require('minimist');
var _ = require('lodash');
var benchmark = require('../');
var port = 3000;

//node socket.io benchmark(nb)
describe('sio benchmark ', function(){
  var sio = Server();
  
  before(function(){
    sio.listen(port, function(){
      debug('sio server listening port on %d', port);
    });
  });

  xit('should emit requests according -n (requests) param', function(done){
    var mockArgs = parseArgs('-n 20 -c 1 --ioc 1 http://localhost:3000/user'.split(' '));
    var expReq = 20;
    var nb = benchmark(mockArgs);
    nb.on('complete', function(nClients){
      expReq.should.eql(nb.connected);
      done();
    });
    nb.run();
  });

  it('should create workers instants by -c param', function(done){
    var mockArgs = parseArgs('-n 10 -c 2 --ioc 10 http://localhost:3000/user'.split(' '));
    var expWorkers = 2;
    var nb = benchmark(mockArgs);
    nb.on('all connected', function(nClients){
      expWorkers.should.eql(_.size(nb.cluster.workers));
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
      done();
    });
    nb.run();

  });  
});