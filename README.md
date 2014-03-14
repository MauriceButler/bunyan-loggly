bunyan-loggly
=============

A bunyan stream to send logs through to loggly.

bunyan-loggly is under early development. So far, it's simply but it works. I will be adding the following:

- support for error reporting when node-loggly fails to transfer to loggly
- basic buffering support

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
				subdomain: 'your-sub-domain',
				auth: {
					username: 'your-username',
					password: 'your-password'
				}
			})
		}
	]
});

logger.info({});
```

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
				subdomain: 'your-sub-domain',
				auth: {
					username: 'your-username',
					password: 'your-password'
				}
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