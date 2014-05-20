// socket.io-pre2 benchmark application

require('should');
var ioc = require('socket.io-client');
var debug = require('debug')('benchmark:test');
var Server = require('./support/server.js');
var parseArgs = require('minimist');

var benchmark = require('../');
var port = 3000;

//node socket.io benchmark(nb)
describe('sio benchmark ', function(){
  var sio = Server();
  
  before(function(){
    sio.listen(port, function(){
      debug('sio server listening port on ' + port);
    });
  });

  xit('should create workers instants by -c param', function(done){

  });

  it('should create ioc instants by --ioc param', function(done){
    var expClients = 10;
    var nb = benchmark(parseArgs('-n 10 -c 1 --ioc 10 http://localhost:3000/user'.split(' ')));
    nb.on('all connected', function(nClients){
      expClients.should.eql(nClients);
      done();
    });
    nb.run();

  });  
});