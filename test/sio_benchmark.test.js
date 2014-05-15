// socket.io-pre2 benchmark application

require('should');
var ioc = require('socket.io-client');
var debug = require('debug')('benchmark:test');
var Server = require('./support/server.js');
var parseArgs = require('minimist');

var siobenchmark = require('../');
var port = 3000;

// sio benchmark
describe('sio benchmark ', function(){
  var sio = Server();
  
  before(function(){
    sio.listen(port, function(){
      debug('sio server listening port on ' + port);
    });
  });

  it('should connect to the sio', function(done){
    var sb = siobenchmark(parseArgs('-c 100 -n 1000 http://localhost:3000/user'.split(' ')));
    sb.run();
    done();
  });  
});