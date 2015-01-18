var xml2json = require('xml2json');

var vehicleHistoryModel = require('vehicle-history-model');
var responseBuilder = vehicleHistoryModel.builder.responseBuilder;

var logger = require('../logger/logger').logger;

var exports = {};

var parseDataFromXml = function (body, xmlParserOptions) {
  return xml2json.toJson(body, xmlParserOptions);
};

var getObjectValue = function (data, field) {
  if (data.hasOwnProperty(field)) {
    var value = data[field];

    if (value === null) {
      logger.info('Parser.getObjectValue: Null value for "%s" field', field);
    }

    return value;
  }

  logger.info('AbstractResolver.getMapValue: Unable to get value from map for "%s" field', field);
  return null;
};

var getResultMap = function (result, mapperDefaults, mappers) {
  var map = {};

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

  var xmlParserOptions = options.get('xmlParserOptions');
  var mapperDefaults = options.get('mapperDefaults');
  var mappers = options.get('mapper');

  var data = parseDataFromXml(body, xmlParserOptions);

  if (!data.hasOwnProperty('result')) {
    logger.error('unable to read response from xml provider (missing result struct)', data);
    return callback(new Error('Wrong response from xml provider'));
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