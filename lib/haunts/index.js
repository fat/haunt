// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================

var async = require('async');

var spec = {
  'bug':          require('./spec/bug'),
  'enhancement':  require('./spec/enhancement'),
  'pull-request': require('./spec/pull-request')
}

var HauntRunner = function (repo, issues) {
  this.repo   = repo;
  this.issues = issues;
};

HauntRunner.prototype = Object.create(events.EventEmitter.prototype);

HauntRunner.prototype.constructor = HauntRunner;

HauntRunner.prototype.haunt = function () {

  async.parallel(this.issues, function (issue, issueComplete) {

    if (!issue.labels.length) {
      return this.emit('error', new Error('Please provide a label for this issue.'));
    }

    if (issue.pull_request && issue.pull_request.patch_url) {
      issue.labels.push('pull-request');
    }

    async.forEach(issue.labels, function (label, labelComplete) {
      if (!label = spec[label]) return labelComplete();
      label(this, issue, labelComplete);
    }, issueComplete);

  }.bind(this), this.emit.bind(this, 'end'));

};

module.exports = HauntRunner;