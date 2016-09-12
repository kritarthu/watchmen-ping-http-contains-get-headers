var assert = require('assert');
var stuPingServiceFactory = require('../index');

describe('ping service http-contains', function(){

  var pingService;
  var service;

  function getMockedpingServiceFactory (mockedBody){
    return new stuPingServiceFactory({
      dependencies: {
        request: {
          get: function(options, callback){
            callback(null, {}, mockedBody);
          }
        }
      }
    });
  }

  beforeEach(function(){

    service = {
      url: 'http://apple.com',
      pingServiceOptions: {
        'http-contains': {
          contains: {
            descr: 'response body must contain',
            required: true,
            value: 'ping'
          },

          notContains: {
            descr: 'response body must NOT contain',
            required: false,
            value: 'pong'
          }
        }
      }
    }
  });

  it('should complain if configuration is missing', function(){
    delete service.pingServiceOptions;
    pingService = new stuPingServiceFactory();
    assert.throws(function(){
      pingService.ping(service, function(){});
    })
  });

  it('should complain if contains configuration is missing', function(){
    delete service.pingServiceOptions['http-contains'].contains;
    pingService = new stuPingServiceFactory();
    assert.throws(function(){
      pingService.ping(service, function(){});
    })
  });

  it('should not complain if notContains configuration is missing', function(done){
    delete service.pingServiceOptions['http-contains'].notContains;
    pingService = getMockedpingServiceFactory('this is it');
    pingService.ping(service, function(){
      done();
    });
  });

  describe('contains matcher', function(){

    it('should fail if body does not contain term', function(done){
      pingService = getMockedpingServiceFactory('this is it');
      pingService.ping(service, function(error, body, response, elapsedTime){
        assert.ok(error);
        done();
      });
    });

    it('should succeed if body does contain term', function(done){
      pingService = getMockedpingServiceFactory('this is a ping');
      pingService.ping(service, function(error, body, response, elapsedTime){
        done(error);
      });
    });
  });

  describe('not contains matcher', function(){

    it('should fail if body does contain term', function(done){
      pingService = getMockedpingServiceFactory('this is a pong');
      pingService.ping(service, function(error, body, response, elapsedTime){
        assert.ok(error);
        done();
      });
    });

    it('should succeed if body does not contain term', function(done){
      pingService = getMockedpingServiceFactory('this is a ping');
      pingService.ping(service, function(error, body, response, elapsedTime){
        done(error);
      });
    });

  });
});
