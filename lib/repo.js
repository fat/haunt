// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 @fat
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================

var request = require('request');
var async   = require('async');
var path    = require('path');
var vm      = require('vm');

var github       = require('./util/github');
var PullRequest  = require('./pull-request');
var Issue        = require('./issue');

var Repo = function (data) {
    this.data = data;
};

Repo.prototype.getData = function (callback) {

    async.parallel([
        this.getTests.bind(this),
        this.getPullRequests.bind(this),
        this.getIssues.bind(this)
    ], function () {

        this.pullRequests = this.pullRequests.map(function (pullRequest) {
            return new PullRequest(pullRequest, this);
        }.bind(this));

        this.issues = this.issues.map(function (issue) {
            return new Issue(issue, this);
        }.bind(this));

        async.forEach(this.issues.concat(this.pullRequests), function (issue, next) {
            issue.setExport(next);
        }, callback);

    }.bind(this));

    return this;

}

Repo.prototype.getTests = function (callback) {

    request('https://raw.github.com/' + this.data.full_name + '/master/haunt.js', function (err, res, body) {
        if (err) return callback(err);

        var sandbox = { module: { exports: {} } };
        vm.runInNewContext(body, sandbox, 'haunt.js');
        this.tests = sandbox.module.exports;
        callback(null, this.tests);
    }.bind(this));

};

Repo.prototype.getPullRequests = function (callback) {

    github.getPullRequests(this.data.owner.login, this.data.name, function (err, pullRequests) {
        if (err) return callback(err);
        this.pullRequests = pullRequests;
        callback(err, pullRequests);
    }.bind(this));

}

Repo.prototype.getIssues = function (callback) {

    github.getIssues(this.data.owner.login, this.data.name, function (err, issues) {
        if (err) return callback(err);
        this.issues = issues
            .map(function (issue) { return !issue.pull_request.html_url && issue  })
            .filter(function (issue) { return issue });

        callback(err, issues);
    }.bind(this));

}

module.exports = Repo;