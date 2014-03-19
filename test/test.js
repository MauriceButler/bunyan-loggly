var should = require('should'),
	bunyan = require('bunyan'),
	Bunyan2Loggly = require('../').Bunyan2Loggly,
	helpers = require('./helpers'),
	config = helpers.loadConfig();

describe('bunyan-loggly', function () {

	it('should throw if token and subdomain aren\'t provided', function () {

		(function () {
			new Bunyan2Loggly({})
		}).should.throw();

	});

	it('should throw if not used as a raw stream', function () {

		var logger = new Bunyan2Loggly({
			token: config.token,
			subdomain: config.subdomain
		});

		(function () {
			logger.write(JSON.stringify({}))
		}).should.throw();

	});

	describe('when using the buffer', function () {

		var logger,
			loggerBufferFive,
			log;

		before(function () {

			logger = new Bunyan2Loggly({
				name: 'bunyan-loggly',
				token: config.token,
				subdomain: config.subdomain
			});

			loggerBufferFive = new Bunyan2Loggly({
				name: 'bunyan-loggly',
				token: config.token,
				subdomain: config.subdomain
			}, 5);

			log = {
				time: new Date()
			};

		});

		it('should default to sending logs upon every write', function () {

			logger._buffer.should.have.lengthOf(0);
			logger.write(log);
			logger._buffer.should.have.lengthOf(0);

		});

		it('should allow buffering', function () {

			loggerBufferFive._buffer.should.have.lengthOf(0);

			loggerBufferFive.write(log);
			loggerBufferFive._buffer.should.have.lengthOf(1);

			loggerBufferFive.write(log);
			loggerBufferFive._buffer.should.have.lengthOf(2);

			loggerBufferFive.write(log);
			loggerBufferFive._buffer.should.have.lengthOf(3);

			loggerBufferFive.write(log);
			loggerBufferFive._buffer.should.have.lengthOf(4);

			loggerBufferFive.write(log);
			loggerBufferFive._buffer.should.have.lengthOf(0);

		})

	})

});