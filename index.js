var loggly = require('loggly');

function Bunyan2Loggly(logglyConfig, bufferLength, bufferTimeout){
    if(!logglyConfig || !logglyConfig.token || !logglyConfig.subdomain){
        throw new Error('bunyan-loggly requires a config object with token and subdomain');
    }

    logglyConfig.json = true;

    this.logglyClient = loggly.createClient(logglyConfig);

    this._buffer = [];
    this.bufferLength = bufferLength || 1;
    this.bufferTimeout = bufferTimeout;
}

Bunyan2Loggly.prototype.write = function(data){
    if (typeof data !== 'object') {
        throw new Error('bunyan-loggly requires a raw stream. Please define the type as raw when setting up the bunyan stream.');
    }

    // loggly prefers timestamp over time
    if (data.time) {
        data = JSON.parse(JSON.stringify(data));
        data.timestamp = data.time;
        delete data.time;
    }

    this._buffer.push(data);

    this._checkBuffer();
};

Bunyan2Loggly.prototype._processBuffer = function(){
    clearTimeout(this._timeoutId);

    var content = this._buffer.slice();
    this._buffer = [];

    if (content.length == 1) {
        content = content[0];
    }
    this.logglyClient.log(content);
};

Bunyan2Loggly.prototype._checkBuffer = function(){
    var bunyan2Loggly = this;

    if (!this._buffer.length) {
        return;
    }

    if(this._buffer.length >= this.bufferLength){
        return this._processBuffer();
    }

    if(this.bufferTimeout){
        clearTimeout(this._timeoutId);

        this._timeoutId = setTimeout(
            function(){
                bunyan2Loggly._processBuffer();
            },
            this.bufferTimeout
        );
    }
};

module.exports = Bunyan2Loggly;
