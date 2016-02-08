# bunyan-loggly

A bunyan stream to send logs through to loggly.

## Configuration

bunyan-loggly uses node-loggly under the hood. As such, when configuring bunyan-loggly as a stream for bunyan, you need to pass in the standard and required node-loggly configuration object.

For example:

```javascript
{
	token: "your-really-long-input-token",
	subdomain: "your-subdomain"
}
```

## Usage

This is a basic usage example.

```javascript
var bunyan = require('bunyan'),
	Bunyan2Loggly = require('bunyan-loggly'),
	logglyConfig = {
		token: 'your-account-token',
		subdomain: 'your-sub-domain'
	},
	logglyStream = new Bunyan2Loggly(logglyConfig);

// create the logger
var logger = bunyan.createLogger({
	name: 'logglylog',
	streams: [
		{
			type: 'raw',
			stream: logglyStream
		}
	]
});

logger.info({});
```

> Please note: you MUST define `type: 'raw'` as bunyan-loggly expects to receive objects so that certain values can be changed as required by loggly (i.e. time to timestamp).

## Buffering

bunyan-loggly supports basic buffering and when setup, will only send your logs through to loggly on every x logs. To setup buffering, just pass an integer as the second parameter when creating a new instance of Bunyan2Loggly:

```javascript
var bunyan = require('bunyan'),
	Bunyan2Loggly = require('bunyan-loggly'),
	logglyConfig = {
		token: 'your-account-token',
		subdomain: 'your-sub-domain'
	},
	bufferLength = 5,
	logglyStream = new Bunyan2Loggly(logglyConfig, bufferLength);

// create the logger
var logger = bunyan.createLogger({
	name: 'logglylog',
	streams: [
		{
			type: 'raw',
			stream: logglyStream
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

### Buffer Timeout

When buffering, a timeout can be provided to force flushing the buffer after a period of time. To setup a flush timeout, pass a timeout value (in ms) as the third parameter when creating a new instance of Bunyan2Loggly:

```javascript
var bunyan = require('bunyan'),
	Bunyan2Loggly = require('bunyan-loggly'),
	logglyConfig = {
		token: 'your-account-token',
		subdomain: 'your-sub-domain'
	},
	bufferLength = 5,
	bufferTimeout = 500,
	logglyStream = new Bunyan2Loggly(logglyConfig, bufferLength, bufferTimeout);

// create the logger
var logger = bunyan.createLogger({
	name: 'logglylog',
	streams: [
		{
			type: 'raw',
			stream: logglyStream
		}
	]
});

logger.info({});	// will be sent to loggly in 500ms if buffer threshold is not reached
```
