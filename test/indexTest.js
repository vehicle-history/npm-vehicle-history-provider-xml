const rewire = require('rewire');
const index = rewire('../index');
const options = require('config');
const chai = require('chai');
const should = chai.should();
const SearchCarRequestBuilder = require('vehicle-history-model').model.searchCarRequest.SearchCarRequestBuilder;

const body = '';

describe('index test', () => {

  index.__set__({
    client: {
      getVehicleHistoryContent: function({plate, vin, firstRegistrationDate}, options, callback) {
        plate.should.equal('HD11JMA');
        vin.should.equal('ABC123456789DEF');
        firstRegistrationDate.should.equal('11.11.2000');

        return callback(null, body);
      }
    },
    parser: {
      generateReport: function(content, {plate, vin, firstRegistrationDate}, options, callback) {
        content.should.equal(body);
        plate.should.equal('HD11JMA');
        vin.should.equal('ABC123456789DEF');
        firstRegistrationDate.should.equal('11.11.2000');

        return callback(null, {});
      }
    }
  });

  it('should call checkVehicleHistory ', done => {

    const plate = 'HD11JMA';
    const vin = 'ABC123456789DEF';
    const firstRegistrationDate = '11.11.2000';
    const country = 'UK';

    const searchCarRequest = new SearchCarRequestBuilder()
      .withPlate(plate)
      .withVin(vin)
      .withFirstRegistrationDate(firstRegistrationDate)
      .withCountry(country)
      .build();

    index.checkVehicleHistory(searchCarRequest, options, (err, result) => {
      should.not.exist(err);
      should.exist(result);
      done();
    });
  });
});