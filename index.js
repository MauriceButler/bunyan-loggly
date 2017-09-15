var loggly = require('loggly');
var stringifySafe = require('json-stringify-safe');
var noop = function () {};

var levels = {
    10: 'TRACE',
    20: 'DEBUG',
    30: 'INFO',
    40: 'WARN',
    50: 'ERROR',
    60: 'FATAL'
}

function Bunyan2Loggly(logglyConfig, bufferLength, bufferTimeout, callback) {
    if (!logglyConfig || !logglyConfig.token || !logglyConfig.subdomain) {
        throw new Error('bunyan-loggly requires a config object with token and subdomain');
    }

    logglyConfig.json = true;

    this.logglyClient = loggly.createClient(logglyConfig);

    this._buffer = [];
    this.bufferLength = bufferLength || 1;
    this.bufferTimeout = bufferTimeout;
    this.callback = callback || noop;
}

Bunyan2Loggly.prototype.write = function (data) {
    if (typeof data !== 'object') {
        throw new Error('bunyan-loggly requires a raw stream. Please define the type as raw when setting up the bunyan stream.');
    }

    // loggly prefers timestamp over time
    if (data.time) {
        data = JSON.parse(stringifySafe(data, null, null, noop));
        data.timestamp = data.time;
        delete data.time;
    }

    // replace level number with string
    if (data.level && Number.isInteger(data.level) && levels[data.level]) {
        data.level = levels[data.level]
    }

    this._buffer.push(data);

    this._checkBuffer();
};

Bunyan2Loggly.prototype._processBuffer = function () {
    clearTimeout(this._timeoutId);

    var content = this._buffer.slice();

    this._buffer = [];

    if (content.length === 1) {
        content = content[0];
    }

    this.logglyClient.log(content, function (error, result) {
        this.callback(error, result, content);
    }.bind(this));
};

Bunyan2Loggly.prototype._checkBuffer = function () {
    var bunyan2Loggly = this;

    if (!this._buffer.length) {
        return;
    }

    if (this._buffer.length >= this.bufferLength) {
        return this._processBuffer();
    }

    if (this.bufferTimeout) {
        clearTimeout(this._timeoutId);

        this._timeoutId = setTimeout(
            function () {
                bunyan2Loggly._processBuffer();
            },
            this.bufferTimeout
        );
    }
};

module.exports = Bunyan2Loggly;
