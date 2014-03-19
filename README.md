bunyan-loggly
=============

A bunyan stream to send logs through to loggly.

## Configuration

bunyan-loggly uses node-loggly under the hood. As such, when configuring bunyan-loggly as a stream for bunyan, you need to pass in the standard and required node-loggly configuration object.

For example:

```javascript
{
	token: "your-really-long-input-token",
	subdomain: "your-subdomain",
	auth: {
    	username: "your-username",
    	password: "your-password"
	}
}
```
> Please note: auth values are NOT required to simply send logs through to loggly.

## Usage

This is a basic usage example.

```javascript
var bunyan = require('bunyan'),
	Bunyan2Loggly = require('bunyan-loggly').Bunyan2Loggly,
	logger;

// create the logger
logger = bunyan.createLogger({
	name: 'logglylog',
	streams: [
		{
			type: 'raw',
			stream: new Bunyan2Loggly({
				token: 'your-account-token',
				subdomain: 'your-sub-domain'
			})
		}
	]
});

logger.info({});
```

> Please note: you MUST define `type: 'raw'` as bunyan-loggly expects to recieve objects so that certain values can be changed as required by loggly (i.e. time to timestamp).

### Express logging

This is an example of using bunyan-loggly to store express.js request logs.

```javascript
var path = require('path'),
	bunyan = require('bunyan'),
	serializerRequest = require('../lib/serializer-request'),
	Bunyan2Loggly = require('bunyan-loggly').Bunyan2Loggly,
	request;

// create the logger
request = bunyan.createLogger({
	name: 'request',
	serializers: { req: bunyan.stdSerializers.req },
	streams: [
		{
			type: 'raw',
			stream: new Bunyan2Loggly({
				token: 'your-account-token',
				subdomain: 'your-sub-domain'
			})
		}
	]
});

// export the middleware
module.exports = function () {

	return function (req, res, next) {

		// move on straight away
		next();

		// log this request
		request.info({
			req : req,
			production: process.env.NODE_ENV === 'production'
		});

	}

}
```

## Buffering

bunyan-loggly supports basic buffering and when setup, will only send your logs through to loggly on every x logs. To setup buffering, just pass an integer as the second parameter when creating a new instance of Bunyan2Loggly:

```javascript
var bunyan = require('bunyan'),
	Bunyan2Loggly = require('bunyan-loggly').Bunyan2Loggly,
	logger;

// create the logger
logger = bunyan.createLogger({
	name: 'logglylog',
	streams: [
		{
			type: 'raw',
			stream: new Bunyan2Loggly({
				token: 'your-account-token',
				subdomain: 'your-sub-domain'
			}, 5)
		}
	]
});

logger.info({});	// won't send to loggly
logger.info({});	// won't send to loggly
logger.info({});	// won't send to loggly
logger.info({});	// won't send to loggly
logger.info({});	// will send to loggly
logger.info({});	// won't send to loggly
```

Changes
-------

Most recent change, v0.0.4.

- bunyan-loggly now requires to be setup as a [raw stream][rawstream]

[You can read about all changes.][bunyanlogglyhistory]

[rawstream]: https://github.com/trentm/node-bunyan#stream-type-raw "Bunyan raw stream"
[bunyanlogglyhistory]: https://github.com/smebberson/bunyan-loggly/blob/master/History.md "bunyan-loggly history"
