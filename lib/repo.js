// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 @fat
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================

var request = require('request');
var colors  = require('colors');
var mocha   = require('mocha');
var async   = require('async');
var path    = require('path');
var vm      = require('vm');

var PullRequest  = require('./pull-request');
var template     = require('./util/hogan-colors');
var github       = require('./util/github');
var Issue        = require('./issue');

var Repo = function (data, options) {
    this.data    = data;
    this.options = options;
};

Repo.typeMap = {
    'pull-requests' : 'pullRequests',
    'pull-request'  : 'pullRequests',
    'issues'        : 'issues',
    'issue'         : 'issues'
}

Repo.prototype.spook = function (callback) {

    var reporterType = this.options.reporter || 'Base';

    if (!mocha.reporters[reporterType]) {
        return template.render('errors/invalid-reporter', {
            name: reporterType,
            names: Object.keys(mocha.reporters).join(', ')
        });
    }

    var total = {
        'issues': this.issues.length,
        'pullRequests': this.pullRequests.length,
        'totalBatches': this.tests.length
    }

    if (reporterType != 'Base') console.log('');

    var batchTotal = {
        'current-batch': 0
    };
    async.forEachSeries(this.tests, function (test, nextBatch) {

        batchTotal['current-batch']++;
        batchTotal['failing-issues'] = 0;
        batchTotal['failing-pullRequests'] = 0;

        async.forEachSeries(Object.keys(test), function (type, next) {

            var issues = this[Repo.typeMap[type]];

            if (!issues.length) return next();

            async.forEachSeries(issues, function (issue, nextIssue) {

                reporterType != 'Base' && template.render('events/test-title', { type: type, url: issue.data.html_url });

                var suite = new mocha.Suite(type, new mocha.Context);

                for (var key in test[type]) {

                    var fn = test[type][key];

                    switch (key) {
                        case 'before':
                            suite.beforeAll(fn.bind(fn, issue.exports));
                            break;
                        case 'after':
                            suite.afterAll(fn.bind(fn, issue.exports));
                            break;
                        default:
                            suite.addTest(new mocha.Test(key, fn.bind(fn, issue.exports)));
                    }

                }

                var runner   = new mocha.Runner(suite);
                var reporter = new mocha.reporters[reporterType](runner);

                issue.exports.reporter = reporter;

                runner.run(function () {
                    if (reporter.stats.failures) {
                        batchTotal['failing-' + Repo.typeMap[type]]++;
                    }
                    nextIssue();
                });

            }.bind(this), next);

        }.bind(this), function () {
            if (this.tests.length > 1) {
                template.render('events/test-announce', { batch_total: total.totalBatches, batch_current: batchTotal['current-batch'] });
            }
            template.render('events/test-summary', { total: total, batch_total: batchTotal });
            nextBatch();
        }.bind(this));
    }.bind(this), callback);
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

    request('https://raw.github.com/' + this.data.full_name + '/master/.issue-guidelines.js', function (err, res, body) {
        if (err) return callback(err);

        var sandbox = { module: { exports: {} }, require: require };
        vm.runInNewContext(body, sandbox, '.issue-guidelines.js');
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

        if (!issues[0].pull_request) {
            issues = [];
        }

        this.issues = issues
            .map(function (issue) { return !issue.pull_request.html_url && issue  })
            .filter(function (issue) { return issue });

        callback(err, issues);
    }.bind(this));

}

module.exports = Repo;