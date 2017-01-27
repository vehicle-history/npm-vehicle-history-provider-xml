'use strict';

const meta = require('./lib/meta');
const logger = require('./lib/logger/logger').logger;
var client = require('./lib/client/client');
var parser = require('./lib/parser/parser');

const checkVehicleHistory = (searchCarRequest, options, callback) => {
  logger.debug('checkVehicleHistory:', searchCarRequest);

  client.getVehicleHistoryContent(searchCarRequest, options, (err, body) => {

    if (err) {
      logger.error(err);
      return callback(err);
    }

    return parser.generateReport(body, searchCarRequest, options, callback);
  });
};

/**
 * the version of the library
 * @property VERSION
 * @type String
 * @static
 */
module.exports = {
  checkVehicleHistory: checkVehicleHistory,
  VERSION: meta.VERSION
};