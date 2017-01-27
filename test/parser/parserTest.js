const options = require('config');
const SearchCarRequestBuilder = require('vehicle-history-model').model.searchCarRequest.SearchCarRequestBuilder;
const parser = require('../../lib/parser/parser');
const chai = require('chai');
const should = chai.should();

describe('parser test', () => {

  it('should generate report', done => {

    const plate = 'HD11JMA';
    const vin = 'ABC123456789DEF';
    const firstRegistrationDate = '2007-01-01';
    const country = 'UK';

    const searchCarRequest = new SearchCarRequestBuilder()
      .withPlate(plate)
      .withVin(vin)
      .withFirstRegistrationDate(firstRegistrationDate)
      .withCountry(country)
      .build();

    const body = `<?xml version="1.0" encoding="ISO-8859-1"?><result id="11111111" generated="1111111111" mode="live" account_id="0"><vrm>${plate}</vrm><make><![CDATA[BMW]]></make><model><![CDATA[320I SE]]></model><body><![CDATA[COUPE]]></body><colour><![CDATA[BLACK]]></colour><fuel><![CDATA[PETROL]]></fuel><engine_size><![CDATA[1995]]></engine_size><first_registered><![CDATA[${firstRegistrationDate}]]></first_registered></result>`;

    parser.generateReport(body, searchCarRequest, options, (err, report) => {

      should.not.exist(err);
      should.exist(report);
      should.exist(report.vehicle);

      const vehicle = report.vehicle;

      vehicle.name.make.should.equal('BMW');
      vehicle.name.model.should.equal('320I SE');

      vehicle.type.type.should.equal('CAR');
      vehicle.type.kind.should.equal('COUPE');

      vehicle.engine.cubicCapacity.should.equal(1995);
      vehicle.engine.fuel.should.equal('PETROL');

      vehicle.registration.firstAt.should.equal('2006-12-31T23:00:00.000Z');
      vehicle.plate.value.should.equal('HD11JMA');
      vehicle.plate.country.should.equal('UK');
      vehicle.vin.should.equal('ABC123456789DEF');

      done();
    });
  });

  it('should return error on not found', done => {

    const body = '<?xml version="1.0" encoding="ISO-8859-1"?><result><error>202</error></result>';

    const plate = 'AB1222';
    const vin = 'ABC123456789DEF';
    const firstRegistrationDate = '21-11-2011';
    const country = 'UK';

    const searchCarRequest = new SearchCarRequestBuilder()
      .withPlate(plate)
      .withVin(vin)
      .withFirstRegistrationDate(firstRegistrationDate)
      .withCountry(country)
      .build();

    parser.generateReport(body, searchCarRequest, options, (err, report) => {

      should.not.exist(report);
      should.exist(err);
      done();
    });
  });
});