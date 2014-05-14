// socket.io-pre2 benchmark application

require('should');
var ioc = require('socket.io-client');
var debug = require('debug')('benchmark:test');
var Server = require('./support/server.js');
var sb = require('../sio_benchmark.js');

// sio benchmark
describe('sio benchmark ', function(){
  var sio = Server({});  
  before(function(){

  });

  it('should connect to the sio', function(done){
    done();
  });  
});