'use strict';

const request = require('request');
const assert = require('assert-plus');
const logger = require('../logger/logger').logger;
const vehicleHistoryModel = require('vehicle-history-model');
const ServiceUnavailableError = vehicleHistoryModel.error.ServiceUnavailableError;

const jar = request.jar();
var requestWithJar = request.defaults({jar: jar});

const prepareUrl = (searchCarRequest, options) => {
  logger.debug('prepareUrl');

  assert.object(searchCarRequest, 'searchCarRequest');
  assert.string(searchCarRequest.plate, 'searchCarRequest.plate');
  assert.object(options, 'options');
  assert.string(options.url, 'options.url');

  return options.url + searchCarRequest.plate;
};

const loadVehicleHistoryContent = function loadVehicleHistoryContent(searchCarRequest, options, callback) {
  logger.debug('loadVehicleHistoryContent');

  assert.object(searchCarRequest, 'searchCarRequest');
  assert.object(options, 'options');
  assert.object(options.headers, 'options.headers');
  assert.number(options.timeout, 'options.timeout');

  let url = null;

  try {
    url = prepareUrl(searchCarRequest, options);
  }
  catch (e) {
    logger.info('Unable to prepareUrl: ', options.url, searchCarRequest.plate);
    return callback(new ServiceUnavailableError('Unable to get vehicle history'));
  }

  const opt = {
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

const getVehicleHistoryContent = function getVehicleHistoryContent(searchCarRequest, options, callback) {
  assert.object(searchCarRequest, 'searchCarRequest');
  assert.object(options, 'options');

  return loadVehicleHistoryContent(searchCarRequest, options, (err, formData) => {
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