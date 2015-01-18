var request = require('request');
var logger = require('../logger/logger').logger;
var ClientUrlError = require('../error/clientUrlError').ClientUrlError;

var exports = {};

var jar = request.jar();
var requestWithJar = request.defaults({jar: jar});

var prepareUrl = function (searchCarRequest, options) {
  logger.debug('prepareUrl');

  if (!searchCarRequest || !searchCarRequest.hasOwnProperty('plate') || !searchCarRequest.plate) {
    logger.warn('prepareUrl: Missing searchCarRequest.plate', searchCarRequest);
    throw new ClientUrlError('Unable provider client to connect');
  }

  var url = options.url + searchCarRequest.plate;
  logger.info('prepareUrl: "%s"', url);

  return url;
};

exports.loadVehicleHistoryContent = function (searchCarRequest, options, callback) {
  logger.debug('loadVehicleHistoryContent');

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
        return callback(new Error('Bad request'));
//      case 200 :
      default:
        return callback(null, body);
    }

  });
};

exports.getVehicleHistoryContent = function (searchCarRequest, options, callback) {
  return exports.loadVehicleHistoryContent(searchCarRequest, options, callback);
};

module.exports = exports;