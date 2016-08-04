'use strict';

var request = require('request');
var assert = require('assert-plus');
var logger = require('../logger/logger').logger;
var vehicleHistoryModel = require('vehicle-history-model');
var ServiceUnavailableError = vehicleHistoryModel.error.ServiceUnavailableError;

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

var loadVehicleHistoryContent = function loadVehicleHistoryContent(searchCarRequest, options, callback) {
  logger.debug('loadVehicleHistoryContent');

  assert.object(searchCarRequest, 'searchCarRequest');
  assert.object(options, 'options');
  assert.object(options.headers, 'options.headers');
  assert.number(options.timeout, 'options.timeout');

  var url = null;

  try {
    url = prepareUrl(searchCarRequest, options);
  }
  catch (e) {
    logger.info('Unable to prepareUrl: ', options.url, searchCarRequest.plate);
    return callback(new ServiceUnavailableError('Unable to get vehicle history'));
  }

  var opt = {
    url: url,
    rejectUnauthorized: false,
    method: 'GET',
    followRedirect: true,
    headers: options.headers,
    jar: jar,
    timeout: options.timeout
  };

  try {
    return requestWithJar(opt, function (error, response, body) {

      if (error) {
        logger.info('error on loadVehicleHistoryContent: ', error);
        return callback(new ServiceUnavailableError('Unable to get vehicle history'));
      }

      switch (response.statusCode) {
        case 400 :
          logger.warn('Unable to get data from service: status 400');
          return callback(new ServiceUnavailableError('Unable to get data from service'));
//      case 200 :
        default:
          return callback(null, body);
      }
    });
  }
  catch (err) {
    logger.info('Unable to connect: %s', err);
    return callback(new ServiceUnavailableError('Unable to get vehicle history'));
  }
};

var getVehicleHistoryContent = function getVehicleHistoryContent(searchCarRequest, options, callback) {
  assert.object(searchCarRequest, 'searchCarRequest');
  assert.object(options, 'options');

  return loadVehicleHistoryContent(searchCarRequest, options, function (err, formData) {
    if (err) {
      logger.error('getVehicleHistoryContent returned with error: ', err);
      return callback(err);
    }

    return callback(err, formData);
  });
};

module.exports = {
  loadVehicleHistoryContent: loadVehicleHistoryContent,
  getVehicleHistoryContent: getVehicleHistoryContent
};