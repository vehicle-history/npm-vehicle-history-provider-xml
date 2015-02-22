var options = require('config');
var SearchCarRequestBuilder = require('vehicle-history-model').model.searchCarRequest.SearchCarRequestBuilder;
var parser = require('../../lib/parser/parser');
var chai = require('chai');
var should = chai.should();

describe('parser test', function () {

  it('should generate report', function (done) {

    var plate = 'HD11JMA';
    var vin = 'ABC123456789DEF';
    var firstRegistrationDate = '2007-01-01';
    var country = 'UK';

    var searchCarRequest = new SearchCarRequestBuilder()
      .withPlate(plate)
      .withVin(vin)
      .withFirstRegistrationDate(firstRegistrationDate)
      .withCountry(country)
      .build();

    var body = '<?xml version="1.0" encoding="ISO-8859-1"?><result id="11111111" generated="1111111111" mode="live" account_id="0"><vrm>' + plate + '</vrm><make><![CDATA[BMW]]></make><model><![CDATA[320I SE]]></model><body><![CDATA[COUPE]]></body><colour><![CDATA[BLACK]]></colour><fuel><![CDATA[PETROL]]></fuel><engine_size><![CDATA[1995]]></engine_size><first_registered><![CDATA[' + firstRegistrationDate + ']]></first_registered></result>';

    parser.generateReport(body, searchCarRequest, options, function (err, report) {

      should.not.exist(err);
      should.exist(report);
      should.exist(report.car);

      var car = report.car;

      car.name.make.should.equal('BMW');
      car.name.model.should.equal('320I SE');

      car.type.type.should.equal('CAR');
      car.type.kind.should.equal('COUPE');

      car.engine.cubicCapacity.should.equal(1995);
      car.engine.fuel.should.equal('PETROL');

      car.registration.firstAt.should.equal('2007-01-01T00:00:00.000Z');
      car.plate.value.should.equal('HD11JMA');
      car.plate.country.should.equal('UK');
      car.vin.should.equal('ABC123456789DEF');

      done();
    });
  });

  it('should return error on not found', function (done) {

    var body = '<?xml version="1.0" encoding="ISO-8859-1"?><result><error>202</error></result>';

    var plate = 'AB1222';
    var vin = 'ABC123456789DEF';
    var firstRegistrationDate = '21-11-2011';
    var country = 'UK';

    var searchCarRequest = new SearchCarRequestBuilder()
      .withPlate(plate)
      .withVin(vin)
      .withFirstRegistrationDate(firstRegistrationDate)
      .withCountry(country)
      .build();

    parser.generateReport(body, searchCarRequest, options, function (err, report) {

      should.not.exist(report);
      should.exist(err);
      done();
    });
  });
});