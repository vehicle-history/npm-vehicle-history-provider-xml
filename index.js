var meta = require('./lib/meta');
var logger = require('./lib/logger/logger').logger;

var exports = {};

exports.checkVehicleHistory = function (plate, vin, firstRegistrationDate, options, callback) {
  logger.debug('checkCarHistory: plate:' + plate + ', vin:' + vin + ', firstRegistrationDate:' + firstRegistrationDate);
  return callback(null, {});
};

/**
 * the version of the library
 * @property VERSION
 * @type String
 * @static
 */
exports.VERSION = meta.VERSION;

module.exports = exports;