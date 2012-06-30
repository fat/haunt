// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================

var request = require('request');
var path    = require('path');
var vm      = require('vm');

var Repo = function (data) {
    this.data = data;
};

Repo.prototype.getTests = function (callback) {

    request(path.join('http://github.com', this.data.full_name, 'haunt.js'), function (err, res, body) {
        if (err) return callback(err);

        var sandbox = { module: { exports: {} } }; //shitty sandboxed context to limit the amount of scaryness
        vm.runInNewContext(body, sandbox, 'haunt.js');
        this.tests = sandbox.module.exports;

        callback(null, this.tests);
    });

};

module.exports = Repo;