var loggly = require('node-loggly-bulk');
var stringifySafe = require('json-stringify-safe');
var noop = function () {};

function Bunyan2Loggly(logglyConfig, bufferLength, bufferTimeout, callback) {
    if (!logglyConfig || !logglyConfig.token || !logglyConfig.subdomain) {
        throw new Error('bunyan-loggly requires a config object with token and subdomain');
    }

    logglyConfig.json = true;
    logglyConfig.isBulk = true;

    this.logglyClient = loggly.createClient(logglyConfig);

    this._buffer = [];
    this.bufferLength = bufferLength || 1;
    this.bufferTimeout = bufferTimeout;
    this.callback = callback || noop;
}

Bunyan2Loggly.prototype.write = function (originalData) {
    if (typeof originalData !== 'object') {
        throw new Error('bunyan-loggly requires a raw stream. Please define the type as raw when setting up the bunyan stream.');
    }

    var data = originalData;

    // loggly prefers timestamp over time
    if (data.time) {
        data = JSON.parse(stringifySafe(data, null, null, noop));
        data.timestamp = data.time;
        delete data.time;
    }

    this._buffer.push(data);

    this._checkBuffer();
};

Bunyan2Loggly.prototype._processBuffer = function () {
    var bunyan2Loggly = this;
    clearTimeout(bunyan2Loggly._timeoutId);

    var content = bunyan2Loggly._buffer.slice();

    bunyan2Loggly._buffer = [];

    bunyan2Loggly.logglyClient.log(content, function (error, result) {
        bunyan2Loggly.callback(error, result, content);
    });
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
