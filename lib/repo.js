// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 @fat
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================

var request = require('request');
var mocha   = require('mocha');
var async   = require('async');
var path    = require('path');
var vm      = require('vm');

var PullRequest  = require('./pull-request');
var github       = require('./util/github');
var Helper       = require('./helper');
var Issue        = require('./issue');

var Repo = function (data) {
    this.data = data;
};

Repo.typeMap = {
    'pull-request': 'pullRequests',
    'issue'       : 'issues'
}

Repo.prototype.spook = function (callback) {

    for (var type in this.tests) {
        
        var issues = this[Repo.typeMap[type]];

        if (!issues.length) continue;
   
        issues.forEach(function (issue) {

            var suite    = new mocha.Suite('haunt.js', new mocha.Context);
            var runner   = new mocha.Runner(suite);
            var reporter = new mocha.reporters.Base(runner);

            for (var key in this.tests[type]) {

                var fn = this.tests[type][key];
           
                switch (key) {
                    case 'before':
                        suite.beforeAll(fn.bind(fn, new Helper));
                        break;
                    case 'after':
                        suite.afterAll(fn.bind(fn, new Helper({reporter: reporter})));
                        break;
                    default:
                        suite.addTest(new mocha.Test(key, fn.bind(fn, issue.exports)));
                }

            }

            runner.run(callback);

        }.bind(this));
    }

}

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