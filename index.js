
var loggly = require('loggly'),
	util = require('util');

function Bunyan2Loggly (logglyConfig, buffer) {

	this.logglyConfig = logglyConfig || {};

	// define the log as being json (because bunyan is a json logger)
	this.logglyConfig.json = true;

	// define the buffer count, unless one has already been defined
	this.buffer = buffer || 1;
	this._buffer = [];

	// add the https tag by default, just to make the loggly source setup work as expect
	this.logglyConfig.tags = this.logglyConfig.tags || [];
	this.logglyConfig.tags.push('https');

	// create the client
	this.client = loggly.createClient(logglyConfig);

}

Bunyan2Loggly.prototype.write = function(rec) {

	if (typeof rec !== 'object' && !Array.isArray(rec)) {
		throw new Error('bunyan-loggly requires a raw stream. Please define the type as raw when setting up the bunyan stream.');
	}

	if (typeof rec === 'object') {

		// loggly prefers timestamp over time
		if (rec.time !== undefined) {
			rec.timestamp = rec.time;
			delete rec.time;
		}

	}

	// write to our array buffer
	this._buffer.push(rec);

	// check the buffer, we may or may not need to send to loggly
	this.checkBuffer();

};

Bunyan2Loggly.prototype.checkBuffer = function () {

	if (this._buffer.length < this.buffer) {
		return;
	}

	// duplicate the array, because it could be modified before our HTTP call succeeds
	var content = this._buffer.slice();
	this._buffer = [];

	// log multiple (or single) requests with loggly
	this.client.log(content);

};

module.exports.Bunyan2Loggly = Bunyan2Loggly;