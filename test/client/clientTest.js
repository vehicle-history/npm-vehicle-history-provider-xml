var options = require('config');
var rewire = require('rewire');
var client = rewire('../../lib/client/client');
var SearchCarRequest = require('vehicle-history-model').model.SearchCarRequest;
var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

describe('client test', function () {

  it('should return error on missing plate', function (done) {

    var request = new SearchCarRequest('', 'vin', 'date');
    client.loadVehicleHistoryContent(request, options, function (err, content) {
      should.exist(err);
      should.not.exist(content);
      done();
    });
  });

  it('should return vehicle history (status 200)', function (done) {
    client.__set__({
      requestWithJar: function (opts, callback) {
        should.exist(opts);
        var error = null;
        var response = null;
        var body = '';

        if (opts.url === 'http://vehiclehost?plate=plate') {
          error = null;
          response = {statusCode: 200};
          body = 'body';
          return callback(error, response, body);
        }
      }
    });

    var request = new SearchCarRequest('plate', 'vin', 'date');
    client.loadVehicleHistoryContent(request, options, function (err, content) {
      should.exist(content);
      should.not.exist(err);
      done();
    });
  });

});
