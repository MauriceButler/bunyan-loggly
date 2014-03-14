
var loggly = require('loggly'),
	util = require('util');

function Bunyan2Loggly (logglyConfig) {

	this.logglyConfig = logglyConfig || {};

	// define the log as being json (because bunyan is a json logger)
	this.logglyConfig.json = true;

	// add the https tag by default, just to make the loggly source setup work as expect
	this.logglyConfig.tags = this.logglyConfig.tags || [];
	this.logglyConfig.tags.push('https');

	// create the client
	this.client = loggly.createClient(logglyConfig);

}

Bunyan2Loggly.prototype.write = function(rec) {

	if (typeof rec === 'object') {

		// loggly prefers timestamp over time
		if (rec.time !== undefined) {
			rec.timestamp = rec.time;
			delete rec.time;
		}

	}

	this.client.log(rec);

};

module.exports.Bunyan2Loggly = Bunyan2Loggly;