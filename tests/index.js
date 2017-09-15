var test = require('tape');
var proxyquire = require('proxyquire');
var testConfig = {
    token: 'foo',
    subdomain: 'bar',
};

function getBaseMocks() {
    return {
        loggly: {
            createClient: function () {
                return {
                    log: function () {},
                };
            },
        },
    };
}

test('Bunyan2Loggly Exists', function (t) {
    t.plan(1);

    var Bunyan2Loggly = proxyquire('../', getBaseMocks());

    t.equal(typeof Bunyan2Loggly, 'function', 'Bunyan2Loggly is a function');
});

test('Bunyan2Loggly throws on bad config', function (t) {
    t.plan(4);

    var Bunyan2Loggly = proxyquire('../', getBaseMocks());
    var exceptionMessage = /bunyan-loggly requires a config object with token and subdomain/;

    t.throws(function () { new Bunyan2Loggly(); }, exceptionMessage, 'throws on bad config');
    t.throws(function () { new Bunyan2Loggly({}); }, exceptionMessage, 'throws on bad config');
    t.throws(function () { new Bunyan2Loggly({ token: 'foo' }); }, exceptionMessage, 'throws on bad config');
    t.throws(function () { new Bunyan2Loggly({ subdomain: 'foo' }); }, exceptionMessage, 'throws on bad config');
});

test('Bunyan2Loggly creates loggly client', function (t) {
    t.plan(3);

    var mocks = getBaseMocks();

    mocks.loggly.createClient = function (config) {
        t.equal(config.token, testConfig.token, 'correct token');
        t.equal(config.subdomain, testConfig.subdomain, 'correct subdomain');
        t.equal(config.json, true, 'correct json');
    };

    var Bunyan2Loggly = proxyquire('../', mocks);

    new Bunyan2Loggly(testConfig);
});

test('Bunyan2Loggly sets default bufferLength', function (t) {
    t.plan(1);

    var Bunyan2Loggly = proxyquire('../', getBaseMocks());
    var bunyan2Loggly = new Bunyan2Loggly(testConfig);

    t.equal(bunyan2Loggly.bufferLength, 1, 'bufferLength defaulted correctly');
});

test('Bunyan2Loggly sets bufferLength if provided', function (t) {
    t.plan(1);

    var Bunyan2Loggly = proxyquire('../', getBaseMocks());
    var bunyan2Loggly = new Bunyan2Loggly(testConfig, 123);

    t.equal(bunyan2Loggly.bufferLength, 123, 'bufferLength set correctly');
});

test('Bunyan2Loggly sets bufferTimeout if provided', function (t) {
    t.plan(1);

    var Bunyan2Loggly = proxyquire('../', getBaseMocks());
    var bunyan2Loggly = new Bunyan2Loggly(testConfig, null, 123);

    t.equal(bunyan2Loggly.bufferTimeout, 123, 'bufferTimeout set correctly');
});

test('Bunyan2Loggly throws if write alled with non raw stream', function (t) {
    t.plan(2);

    var Bunyan2Loggly = proxyquire('../', getBaseMocks());
    var bunyan2Loggly = new Bunyan2Loggly(testConfig);
    var exceptionMessage = /bunyan-loggly requires a raw stream. Please define the type as raw when setting up the bunyan stream./;

    t.throws(function () { bunyan2Loggly.write(); }, exceptionMessage, 'throws on bad stream');
    t.throws(function () { bunyan2Loggly.write('foo'); }, exceptionMessage, 'throws on bad stream');
});

test('Bunyan2Loggly adds data to buffer and calls check buffer', function (t) {
    t.plan(4);

    var Bunyan2Loggly = proxyquire('../', getBaseMocks());
    var bunyan2Loggly = new Bunyan2Loggly(testConfig);
    var testData = { foo: 'bar' };

    bunyan2Loggly._checkBuffer = function () {
        t.pass('checkbuffer called');
    };

    t.equal(bunyan2Loggly._buffer.length, 0, 'started with empty buffer');

    bunyan2Loggly.write(testData);

    t.equal(bunyan2Loggly._buffer.length, 1, 'something was added to buffer');

    t.deepEqual(bunyan2Loggly._buffer[0], testData, 'data was added to buffer');
});

test('Bunyan2Loggly changes time to timestamp', function (t) {
    t.plan(1);

    var Bunyan2Loggly = proxyquire('../', getBaseMocks());
    var bunyan2Loggly = new Bunyan2Loggly(testConfig);
    var testData = { foo: 'bar', time: 'nao' };

    bunyan2Loggly._checkBuffer = function () {};

    bunyan2Loggly.write(testData);

    t.deepEqual(bunyan2Loggly._buffer[0], { foo: 'bar', timestamp: 'nao' }, 'time changed to timestamp');
});

test('Bunyan2Loggly changes level to string', function (t) {
    var levels = {
        10: 'TRACE',
        20: 'DEBUG',
        30: 'INFO',
        40: 'WARN',
        50: 'ERROR',
        60: 'FATAL'
    };

    t.plan(Object.keys(levels).length);


    var Bunyan2Loggly = proxyquire('../', getBaseMocks());
    var bunyan2Loggly = new Bunyan2Loggly(testConfig);
    Object.keys(levels).forEach(function(level) {
        var testData = { foo: 'bar', level: parseInt(level) };

        bunyan2Loggly._checkBuffer = function () {};

        bunyan2Loggly.write(testData);
        t.deepEqual(bunyan2Loggly._buffer[bunyan2Loggly._buffer.length - 1], { foo: 'bar', level: levels[level] }, 'level ' + level + ' to ' + levels[level]);
    });
});

test('Bunyan2Loggly leaves level unchanged if no match', function (t) {
    t.plan(1);

    var Bunyan2Loggly = proxyquire('../', getBaseMocks());
    var bunyan2Loggly = new Bunyan2Loggly(testConfig);
    var testData = { foo: 'bar', level: 25 };

    bunyan2Loggly._checkBuffer = function () {};

    bunyan2Loggly.write(testData);
    t.deepEqual(bunyan2Loggly._buffer[0], { foo: 'bar', level: 25 }, 'level 25 unchanged');
});

test('Bunyan2Loggly sends data to loggly', function (t) {
    t.plan(1);

    var mocks = getBaseMocks();
    var Bunyan2Loggly = proxyquire('../', mocks);
    var testData = { foo: 'bar' };

    mocks.loggly.createClient = function () {
        return {
            log: function (data) {
                t.deepEqual(data, testData, 'data sent to loggly');
            },
        };
    };

    var bunyan2Loggly = new Bunyan2Loggly(testConfig);

    bunyan2Loggly.write(testData);
});

test('Bunyan2Loggly uses logglyCallback if provided', function (t) {
    t.plan(3);

    var mocks = getBaseMocks();
    var Bunyan2Loggly = proxyquire('../', mocks);
    var testData = { foo: 'bar' };
    var testError = 'testError';
    var testResult = 'testResult';

    function logglyCallback(error, result, content) {
        t.equal(error, testError, 'correct error');
        t.equal(result, testResult, 'correct result');
        t.deepEqual(content, testData, 'correct content');
    }

    mocks.loggly.createClient = function () {
        return {
            log: function (data, callback) {
                callback(testError, testResult);
            },
        };
    };

    var bunyan2Loggly = new Bunyan2Loggly(testConfig, null, null, logglyCallback);

    bunyan2Loggly.write(testData);
});

test('Bunyan2Loggly handles circular references', function (t) {
    t.plan(2);

    var mocks = getBaseMocks();
    var Bunyan2Loggly = proxyquire('../', mocks);
    var testData = { time: 'nao' };

    testData.x = testData;

    mocks.loggly.createClient = function () {
        return {
            log: function (data) {
                t.notEqual(data, testData, 'original data was not mutated');
                t.deepEqual(data, { timestamp: 'nao' }, 'changed to timestamp');
            },
        };
    };

    var bunyan2Loggly = new Bunyan2Loggly(testConfig);

    bunyan2Loggly.write(testData);
});

test('Bunyan2Loggly sends data to loggly once buffer limit is reached', function (t) {
    t.plan(1);

    var mocks = getBaseMocks();
    var Bunyan2Loggly = proxyquire('../', mocks);
    var testData = { foo: 'bar' };
    var sent = 0;

    mocks.loggly.createClient = function () {
        return {
            log: function (data) {
                if (!sent) {
                    t.fail('should not have sent until buffer limit reached');
                }
                t.deepEqual(data, [testData, testData], 'data sent to loggly');
            },
        };
    };

    var bunyan2Loggly = new Bunyan2Loggly(testConfig, 2);

    bunyan2Loggly.write(testData);
    sent++;
    bunyan2Loggly.write(testData);
});

test('Bunyan2Loggly sends data to loggly after bufferTimeout even if not reached bufferLimit', function (t) {
    t.plan(1);

    var mocks = getBaseMocks();
    var Bunyan2Loggly = proxyquire('../', mocks);
    var testData = { foo: 'bar' };
    var waitedABit = false;

    mocks.loggly.createClient = function () {
        return {
            log: function (data) {
                if (!waitedABit) {
                    t.fail('should not have sent until buffer limit reached');
                }
                t.deepEqual(data, testData, 'data sent to loggly');
            },
        };
    };

    var bunyan2Loggly = new Bunyan2Loggly(testConfig, 2, 500);

    bunyan2Loggly.write(testData);

    setTimeout(function () {
        waitedABit = true;
    }, 200);
});
