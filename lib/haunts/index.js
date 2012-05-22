// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================

var async  = require('async');
var events = require('events');

var spec = { 'main': require('./spec') }

var HauntRunner = function (repo, issues) {
  this.repo   = repo;
  this.issues = issues;
};

HauntRunner.prototype = Object.create(events.EventEmitter.prototype);

HauntRunner.prototype.constructor = HauntRunner;

HauntRunner.prototype.haunt = function () {

  var issues = this.issues.map(function (issue) {
    return spec.main.bind(this, issue, this.repo);
  }.bind(this));

  async.parallel(issues, this.emit.bind(this, 'end'));

};

module.exports = HauntRunner;