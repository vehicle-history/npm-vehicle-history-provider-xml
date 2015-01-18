var options = require('config');
var SearchCarRequest = require('vehicle-history-model').model.SearchCarRequest;
var parser = require('../../lib/parser/parser');
var chai = require('chai');
var should = chai.should();

describe('parser test', function () {

  it('should generate report', function (done) {

    var plate = 'HD11JMA';
    var vin = 'ABC123456789DEF';
    var firstRegistrationDate = '2007-01-01';
    var searchCarRequest = new SearchCarRequest(plate, vin, firstRegistrationDate);

    var body = '<?xml version="1.0" encoding="ISO-8859-1"?><result id="11111111" generated="1111111111" mode="live" account_id="0"><vrm>' + plate + '</vrm><make><![CDATA[BMW]]></make><model><![CDATA[320I SE]]></model><body><![CDATA[COUPE]]></body><colour><![CDATA[BLACK]]></colour><fuel><![CDATA[PETROL]]></fuel><engine_size><![CDATA[1995]]></engine_size><first_registered><![CDATA['+firstRegistrationDate+']]></first_registered></result>';

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

      car.registration.firstAt.should.equal('2007-01-01');
      car.plate.value.should.equal('HD11JMA');
      car.plate.country.should.equal('uk');
      car.vin.should.equal('ABC123456789DEF');

      done();
    });

  });
});