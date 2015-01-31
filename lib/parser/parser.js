
var assert = require('assert-plus');
var xml2json = require('xml2json');
var vehicleHistoryModel = require('vehicle-history-model');
var responseBuilder = vehicleHistoryModel.builder.responseBuilder;
var VehicleNotFoundError = vehicleHistoryModel.error.VehicleNotFoundError;
var ServiceUnavailableError = vehicleHistoryModel.error.ServiceUnavailableError;

var logger = require('../logger/logger').logger;

var exports = {};

var parseDataFromXml = function (body, xmlParserOptions) {
  return xml2json.toJson(body, xmlParserOptions);
};

var getResultMap = function (result, mapperDefaults, mappers) {
  var map = {};

  assert.object(result, 'result');
  assert.object(mapperDefaults, 'mapperDefaults');
  assert.object(mappers, 'mappers');

  for (var i in mapperDefaults) {
    if (mapperDefaults.hasOwnProperty(i)) {
      var mapperDefault = mapperDefaults[i];
      map[mapperDefault.to] = mapperDefault.value;
    }
  }

  for (var i in mappers) {
    if (mappers.hasOwnProperty(i)) {
      var mapper = mappers[i];

      var val = null;
      var property = mapper.from;

      if (result.hasOwnProperty(property)) {
        val = result[property];
      }

      map[mapper.to] = val;
    }
  }

  return map;
};

exports.generateReport = function (body, searchCarRequest, options, callback) {
  logger.debug('generateReport');

  assert.object(searchCarRequest, 'searchCarRequest');
  assert.object(options, 'options');
  assert.string(body, 'body');

  var xmlParserOptions = options.get('xmlParserOptions');
  var mapperDefaults = options.get('mapperDefaults');
  var mappers = options.get('mapper');

  var data = parseDataFromXml(body, xmlParserOptions);

  if (!data.hasOwnProperty('result')) {
    logger.error('unable to read response from xml provider (missing result struct)', data);
    return callback(new ServiceUnavailableError('Wrong response from xml provider'));
  }

  if (data.result.hasOwnProperty('error')) {
    logger.error('unable to get data because of error response:', data.result);
    return callback(new VehicleNotFoundError('Vehicle not found'));
  }

  var map = getResultMap(data.result, mapperDefaults, mappers);

  responseBuilder.build(map, searchCarRequest, options, function (err, report) {
    if (err) {
      logger.error('unable to generate report by responseBuilder: %s', err);
      return callback(err);
    }

    return callback(err, report);
  });

};

module.exports = exports;