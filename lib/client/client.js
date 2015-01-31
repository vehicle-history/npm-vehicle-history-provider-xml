var request = require('request');
var assert = require('assert-plus');
var logger = require('../logger/logger').logger;
var vehicleHistoryModel = require('vehicle-history-model');
var ServiceUnavailableError = vehicleHistoryModel.error.ServiceUnavailableError;

var exports = {};

var jar = request.jar();
var requestWithJar = request.defaults({jar: jar});

var prepareUrl = function (searchCarRequest, options) {
  logger.debug('prepareUrl');

  assert.object(searchCarRequest, 'searchCarRequest');
  assert.string(searchCarRequest.plate, 'searchCarRequest.plate');
  assert.object(options, 'options');
  assert.string(options.url, 'options.url');

  return options.url + searchCarRequest.plate;
};

exports.loadVehicleHistoryContent = function (searchCarRequest, options, callback) {
  logger.debug('loadVehicleHistoryContent');

  assert.object(searchCarRequest, 'searchCarRequest');
  assert.object(options, 'options');

  try {
    var url = prepareUrl(searchCarRequest, options);
  }
  catch (e) {
    return callback(e);
  }

  var opt = {
    url: url,
    method: 'GET',
    followRedirect: true,
    headers: options.headers,
//    gzip: true,
    jar: jar

  };

  requestWithJar(opt, function (error, response, body) {

    if (error) {
      logger.error(error);
      return callback(error);
    }

    switch (response.statusCode) {
      case 302 :
        var location = response.headers.location;
        logger.debug('request for: ' + location);

        //override url for redirect
        opt.url = location;

        requestWithJar(opt, function (error, response, body) {
          return callback(null, body);
        });

        break;
      case 400 :
        logger.warn('Unable to get data from service: status 400');
        return callback(new ServiceUnavailableError('Unable to get data from service'));
//      case 200 :
      default:
        return callback(null, body);
    }

  });
};

exports.getVehicleHistoryContent = function (searchCarRequest, options, callback) {
  assert.object(searchCarRequest, 'searchCarRequest');
  assert.object(options, 'options');

  return exports.loadVehicleHistoryContent(searchCarRequest, options, callback);
};

module.exports = exports;