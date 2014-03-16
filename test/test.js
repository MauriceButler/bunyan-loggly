var assert = require('assert'),
	should = require('should'),
	bunyan = require('bunyan'),
	Bunyan2Loggly = require('../').Bunyan2Loggly;

describe('bunyan-loggly', function () {

	it('should throw if token and subdomain aren\'t provider', function () {

		(function () {
			new Bunyan2Loggly({})
		}).should.throw();

	});

});