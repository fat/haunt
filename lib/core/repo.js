// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 @fat
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================

var request = require('request');
var path    = require('path');
var vm      = require('vm');

var github  = require('../util/github');
var Haunt   = require('../core/haunt');

var Repo = function (data) {
    this.data = data;
};

Repo.prototype.getTests = function (callback) {

    request('https://raw.github.com/' + this.data.full_name + '/master/haunt.js', function (err, res, body) {
        if (err) return callback(err);

        var sandbox = { module: { exports: {} } };
        vm.runInNewContext(body, sandbox, 'haunt.js');
        this.tests = sandbox.module.exports;
        callback(null, this.tests);
    });

};

Repo.prototype.getIssues = function (callback) {

	github.getIssues(this.data.owner.login, this.data.name, function (err, issues) {
    	if (err) throw callback(err);
    	this.issues = issues;
        callback(null, this.issues);
    });

}

Repo.prototype.haunt = function (callback) {

    this.issues.forEach(function (issue) {
        new Haunt(issue, repo);
    });

}

module.exports = Repo;