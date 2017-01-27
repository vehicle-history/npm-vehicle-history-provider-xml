const options = require('config');
const rewire = require('rewire');
const client = rewire('../../lib/client/client');
const SearchCarRequestBuilder = require('vehicle-history-model').model.searchCarRequest.SearchCarRequestBuilder;
const chai = require('chai');
const should = chai.should();

describe('client test', () => {

  it('should return error on missing plate', done => {

    const plate = '';
    const vin = 'vin';
    const firstRegistrationDate = 'date';
    const country = 'UK';

    const request = new SearchCarRequestBuilder()
      .withPlate(plate)
      .withVin(vin)
      .withFirstRegistrationDate(firstRegistrationDate)
      .withCountry(country)
      .build();

    client.loadVehicleHistoryContent(request, options, (err, content) => {
      should.exist(err);
      should.not.exist(content);
      done();
    });
  });

  it('should return vehicle history (status 200)', done => {
    client.__set__({
      requestWithJar: (opts, callback) => {
        should.exist(opts);
        let error = null;
        let response = null;
        let body = '';

        if (opts.url === 'http://vehiclehost?plate=plate') {
          error = null;
          response = {statusCode: 200};
          body = 'body';
          return callback(error, response, body);
        }
      }
    });

    const plate = 'plate';
    const vin = 'vin';
    const firstRegistrationDate = 'date';
    const country = 'UK';

    const request = new SearchCarRequestBuilder()
      .withPlate(plate)
      .withVin(vin)
      .withFirstRegistrationDate(firstRegistrationDate)
      .withCountry(country)
      .build();
    client.loadVehicleHistoryContent(request, options, (err, content) => {
      should.exist(content);
      should.not.exist(err);
      done();
    });
  });

});
