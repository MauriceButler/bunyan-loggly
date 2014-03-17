var path = require('path'),
	fs = require('fs'),
	util = require('util');

var helpers = exports;

helpers.validConfig = function (config) {

	return config
		&& config.token !== 'token'
		&& config.subdomain !== 'subdomain';

};

helpers.loadConfig = function () {

	try {

		var config = require('./test-config.json');

		if (!helpers.validConfig(config)) {
			util.puts('\nConfig file test-config.json must be updated with valid data before running tests');
			process.exit();
		}

		return config;

	} catch (e) {

		util.puts('Error parsing test-config.json');
		e.stack.split('\n').forEach(function (line) {
			util.puts(line)
		});

		process.exit();

	}

};