'use strict';

const assert = require('assert-plus');
const xml2json = require('xml2json');
const vehicleHistoryModel = require('vehicle-history-model');
const responseBuilder = vehicleHistoryModel.builder.responseBuilder;
const resolver = vehicleHistoryModel.resolver.resolver;
const VehicleNotFoundError = vehicleHistoryModel.error.VehicleNotFoundError;
const ServiceUnavailableError = vehicleHistoryModel.error.ServiceUnavailableError;

const logger = require('../logger/logger').logger;

const parseDataFromXml = (body, xmlParserOptions) => xml2json.toJson(body, xmlParserOptions);

const getResultMap = (result, mapperDefaults, mappers, callback) => {
  const map = {};
  let emptyValues = true;

  assert.object(result, 'result');
  assert.object(mapperDefaults, 'mapperDefaults');
  assert.object(mappers, 'mappers');

  for (const i in mapperDefaults) {
    if (mapperDefaults.hasOwnProperty(i)) {
      const mapperDefault = mapperDefaults[i];
      map[mapperDefault.to] = mapperDefault.value;
    }
  }

  for (const j in mappers) {
    if (mappers.hasOwnProperty(j)) {
      const mapper = mappers[j];

      let val = null;
      const property = mapper.from;

      if (result.hasOwnProperty(property)) {
        val = result[property];
      }

      map[mapper.to] = val;

      if (val) {
        emptyValues = false;
      }
    }
  }

  if (emptyValues) {
    logger.debug('Empty values for:', map);
    return callback(new VehicleNotFoundError('Vehicle not found'));
  }

  return callback(null, map);
};

const generateReport = (body, searchCarRequest, options, callback) => {
  logger.debug('generateReport');

  assert.object(searchCarRequest, 'searchCarRequest');
  assert.object(options, 'options');
  assert.string(body, 'body');

  const xmlParserOptions = options.get('xmlParserOptions');
  const mapperDefaults = options.get('mapperDefaults');
  const mappers = options.get('mapper');

  const data = parseDataFromXml(body, xmlParserOptions);

  if (!data.hasOwnProperty('result')) {
    logger.error('unable to read response from xml provider (missing result struct)', data);
    return callback(new ServiceUnavailableError('Wrong response from xml provider'));
  }

  if (data.result.hasOwnProperty('error')) {
    logger.error('unable to get data because of error response:', data.result);
    return callback(new VehicleNotFoundError('Vehicle not found'));
  }

  logger.debug('data.result:', data.result);

  return getResultMap(data.result, mapperDefaults, mappers, (err, map) => {
    if (err) {
      logger.error('unable to parse car data:', err);
      return callback(err);
    }

    return resolver.resolver(map, searchCarRequest, options, (errResolver, updatedMap) => {
      if (errResolver) {
        logger.error('unable to resolve data: %s', errResolver);
        return callback(errResolver);
      }

      return responseBuilder.build(updatedMap, options, (errResponseBuilder, report) => {
        if (errResponseBuilder) {
          logger.error('unable to generate report by responseBuilder: %s', errResponseBuilder);
          return callback(errResponseBuilder);
        }

        return callback(errResponseBuilder, report);
      });
    });
  });
};

module.exports = {
  generateReport: generateReport
};