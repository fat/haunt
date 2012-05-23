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
  'general': require('./haunts/general'),
  'bugs':    require('./haunts/bugs')
}

var Haunt = function (repo, issues) {
  this.repo   = repo;
  this.issues = issues;
};

Haunt.prototype = Object.create(events.EventEmitter.prototype);

Haunt.prototype.constructor = Haunt;

Haunt.prototype.spook = function () {

  var issues = this.issues.map(function (issue, next) {
    var tests    = [];
    var failures = [];
    var warnings = [];

    Object.keys(spec).forEach(function (key) {
      if (spec[key].isRelevant(issue)) tests.concat(spec[key].tests);
    });

    async.forEach(tests, function (result, next) {
      if (result.type == 'failure') failures.push(result);
      if (result.type == 'warning') warnings.push(result);
    }, function () {
      if (failures.length) return this.renderFailures(issue, failures);
      if (warnings.length) return this.renderWarnings(issue, warnings);
    }.bind(this));

  }.bind(this));

  async.parallel(issues, this.emit.bind(this, 'end'));
};

Haunt.prototype.renderFailure = function (issue, failures) {
  var context = {
    name: this.repo.name,
    failures: failures,
    guideline_url: 'hauntapp.com/' + this.repo.name
  };

  fs.readFile('../views/issues/failure', 'utf-8', function (err, file) {
    var message = Hogan.compile(file).render(context);
    github.comment(this.repo, issue, message);
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
        new Haunt(repo, issues)
          .on('error', function (err) { throw err; })
          .on('data',  function () { console.log('data', arguments); })
          .on('end',   function () { console.log('end', arguments);  })
          .spook();
      });
    });
  });
};