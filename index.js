var request = require('request');

function PingService(options){
  if (options && options.dependencies && options.dependencies.request){
    request = options.dependencies.request;
  }
}

exports = module.exports = PingService;

PingService.prototype.ping = function(service, callback){
  var startTime = +new Date();
  var options = {
    uri: service.url,
    timeout: service.timeout,
    headers:service.header,
    poll: false
  };

  if (!service.pingServiceOptions || !service.pingServiceOptions['http-contains-get'] ||
      !service.pingServiceOptions['http-contains-get'].contains ||
      !service.pingServiceOptions['http-contains-get'].contains.value) {
    callback('http-contains plugin configuration is missing');
  }

  var contains = service.pingServiceOptions['http-contains-get'].contains.value;
  var notContains = null;

  if (service.pingServiceOptions['http-contains-get'].notContains){
    notContains = service.pingServiceOptions['http-contains-get'].notContains.value;
  }

  request.get(options, function(error, response, body){

    var elapsedTime = +new Date() - startTime;
    if (error) {
      return callback(error, body, response, elapsedTime);
    }

    if(typeof body =='object'){
      body = JSON.stringify(body)
    }
    if(undefined == body) {
      body = "";
    }
    if (body.indexOf(contains) === -1) {
      return callback(contains + ' not found in response body: ' + body, body, response, elapsedTime);
    }
    else {
      if (notContains && body.indexOf(notContains) > -1) {
        return callback(notContains + ' found in response body: '+ body, body, response, elapsedTime);
      }
      callback(null, body, response, elapsedTime);
    }
  });
};

PingService.prototype.getDefaultOptions = function(){
  return {
    contains: {
      descr: 'response body must contain',
      required: true
    },

    notContains: {
      descr: 'response body must NOT contain',
      required: false
    }
  };
}
