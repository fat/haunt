// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================

var github  = require('./util/github');
var events  = require('events');
var Hogan   = require('hogan.js');
var async   = require('async');
var fs      = require('fs');

var spec = {
  'bugs':         require('./haunts/bugs'),
  'general':      require('./haunts/general'),
  'enhancements': require('./haunts/enhancements')
}

var Haunt = function (repo, issues) {
  this.repo   = repo;
  this.issues = issues;
};

Haunt.prototype.spook = function () {

  async.parallel(this.issues.map(function (issue) {

    return function (next) {
      var tests = [];

      Object.keys(spec).forEach(function (key) {
        if (spec[key].isRelevant(issue)) tests.concat(spec[key].tests);
      });

      tests = tests.map(function (test) {
        return test.bind(this, issue);
      });

      async.parallel(tests, function (err, results) {

        var failures = [];
        var warnings = [];

        results.forEach(function (result) {
          if (result.type == 'failure') return failures.push(result);
          if (result.type == 'warning') return warnings.push(result);
        });

        if (failures.length) return this.renderFailures(issue, failures, next);
        if (warnings.length) return this.renderWarnings(issue, warnings, next);

      }.bind(this));

    }.bind(this);

  }.bind(this)));

};

Haunt.prototype.renderFailure = function (issue, failures) {
  var context = {
    name: this.repo.name,
    failures: failures,
    guideline_url: 'hauntapp.com/' + this.repo.name
  };

  fs.readFile('../views/issues/failure', 'utf-8', function (err, file) {
    var message = Hogan.compile(file).render(context);
    github.comment(this.repo, issue, message, github.closeIssue.bind(this, this.repo, issue));
  });
}

Haunt.prototype.renderWarnings = function (issue, warnings) {
  var context = {
    name: this.repo.name,
    warnings: warnings,
    guideline_url: 'hauntapp.com/' + this.repo.name
  };

  fs.readFile('../views/issues/warning', 'utf-8', function (err, file) {
    var message = Hogan.compile(file).render(context);
    github.comment(this.repo, issue, message);
  });
}

module.exports = function () {
  github.getRepos(function (err, repos) {
    if (err) throw err;
    repos.forEach(function (repo) {
      github.getIssues(repo.owner.login, repo.name, function (err, issues) {
        if (err) throw err;
        new Haunt(repo, issues).spook();
      });
    });
  });
};