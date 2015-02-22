var options = require('config');
var rewire = require('rewire');
var client = rewire('../../lib/client/client');
var SearchCarRequestBuilder = require('vehicle-history-model').model.searchCarRequest.SearchCarRequestBuilder;
var chai = require('chai');
var should = chai.should();

describe('client test', function () {

  it('should return error on missing plate', function (done) {

    var plate = '';
    var vin = 'vin';
    var firstRegistrationDate = 'date';
    var country = 'UK';

    var request = new SearchCarRequestBuilder()
      .withPlate(plate)
      .withVin(vin)
      .withFirstRegistrationDate(firstRegistrationDate)
      .withCountry(country)
      .build();

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

    var plate = 'plate';
    var vin = 'vin';
    var firstRegistrationDate = 'date';
    var country = 'UK';

    var request = new SearchCarRequestBuilder()
      .withPlate(plate)
      .withVin(vin)
      .withFirstRegistrationDate(firstRegistrationDate)
      .withCountry(country)
      .build();
    client.loadVehicleHistoryContent(request, options, function (err, content) {
      should.exist(content);
      should.not.exist(err);
      done();
    });
  });

});
