var should = require('should'),
	bunyan = require('bunyan'),
	Bunyan2Loggly = require('../').Bunyan2Loggly,
	helpers = require('./helpers'),
	config = helpers.loadConfig(),
	assert = require('assert');

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

		});

		describe('when using the buffer flush timeout', function() {

      var loggerBufferTimeout;

  		before(function () {

        loggerBufferTimeout = new Bunyan2Loggly({
          name: 'bunyan-loggly',
          token: config.token,
          subdomain: config.subdomain
        }, 5, 50);

      });

      it('should flush the buffer when the timeout is exceeded', function(done) {

        loggerBufferTimeout._buffer.should.have.lengthOf(0);

        loggerBufferTimeout.write(log);
			  loggerBufferTimeout._buffer.should.have.lengthOf(1);

        setTimeout(function() {
          loggerBufferTimeout._buffer.should.have.lengthOf(0);
          done();
        }, 51);

      });

      it('should only set one active timeout', function(done) {
        var timeout;

        loggerBufferTimeout._buffer.should.have.lengthOf(0);

        loggerBufferTimeout.write(log);
        timeout = loggerBufferTimeout._timeout;
			  loggerBufferTimeout._buffer.should.have.lengthOf(1);

        loggerBufferTimeout.write(log);
        loggerBufferTimeout._timeout.should.not.equal(timeout);
			  loggerBufferTimeout._buffer.should.have.lengthOf(2);

        timeout = setTimeout(function() {
          loggerBufferTimeout._buffer.should.have.lengthOf(0);
          done();
        }, 51);

      });

      it('should clear the timeout if the buffer length is met', function() {

        loggerBufferTimeout.write(log);
			  loggerBufferTimeout._timeout.should.not.be.undefined;

        loggerBufferTimeout.write(log);
        loggerBufferTimeout.write(log);
        loggerBufferTimeout.write(log);
        loggerBufferTimeout.write(log);
			  loggerBufferTimeout.should.have.property('_timeout').equal(undefined);

      });

    });

	})

});
