// socket.io-pre2 benchmark application

require('should');
var ioc = require('socket.io-client');
var debug = require('debug')('benchmark:test');
var Server = require('./support/server.js');
var sb = require('../sio_benchmark.js')({
  // follow args format of `minimist`
  _: ['http://localhost:'],
  n: 100,
  c: 1000
});

// sio benchmark
describe('sio benchmark ', function(){
  var sio = Server({});  
  before(function(){
    
  });

  it('should connect to the sio', function(done){
    sb.run();
    done();
  });  
});