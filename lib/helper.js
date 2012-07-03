// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 @fat
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================
// Helper
// + Helper.tag - (accepts a tagname) tags an issue/pull-request
// + Helper.close - closes an issue/pull-request
// + Helper.assign - (accepts a username) assigns an issue/pull-request
// + Helper.comment - (accepts a string) comments on an issue/pull-request
// + Helper.comment.failure - (accepts an array of failed tests) generic test failure message, which notifies a user what failed.
// + Helper.comment.warning - (accepts an array of failed tests) generic test warning message, which notifies a user what failed.
// ==========================================

var fs     = require('fs');
var path   = require('path');
var hogan  = require('hogan.js');
var github = require('./util/github');

var templates = {
    issues: {
        failure: hogan.compile(fs.readFileSync(path.join(__dirname, '../views/issues/failure.mustache'), 'utf-8')),
        warning: hogan.compile(fs.readFileSync(path.join(__dirname, '../views/issues/warning.mustache'), 'utf-8'))
    }
}

var Helper = function (obj) {
    for (var key in obj) this[key] = obj[key];
}

Helper.prototype.tag = function (label, callback) {
    github.tagIssue(this.repo.data.owner.login, this.repo.data.name, label, this.data.number, callback);
}

Helper.prototype.close = function (callback) {
    github.closeIssue(this.repo.data.owner.login, this.repo.data.name, this.data.number, callback);
}

Helper.prototype.assign = function (assignee, callback) {
    github.assignIssue(this.repo.data.owner.login, this.repo.data.name, this.data.number, assignee, callback);
}

Helper.prototype.comment = function (body, callback) {
    github.commentOnIssue(this.repo.data.owner.login, this.repo.data.name, this.data.number, body, callback);
}

Helper.prototype.comment.failure = function (callback) {
    var body = templates.issues.failure.render(this.failures);
    github.commentOnIssue(this.repo.data.owner.login, this.repo.data.name, this.data.number, body, callback);
}

Helper.prototype.comment.warning = function () {
    var body = templates.issues.warning.render(this.failures);
    github.commentOnIssue(this.repo.data.owner.login, this.repo.data.name, this.data.number, body, callback);
}

module.exports = Helper;