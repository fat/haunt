// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 @fat
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================
// PULL-REQUEST (exports same as ISSUE +)
// + issue.diff o- the complete diff of a pull-request
// + issue.files - an array of the files changed in a commit
// + issue.files[*].patch - the patch for a specific file
// + issue.files[*].filename - the filename changed
// + issue.files[*].status - the status of the file (modified, deleted, etc.)
// + issue.files[*].changes - the number of changes made in a file
// + issue.files[*].deletions - the number of deletions made in a file
// + issue.commits - an array of git commits
// + issue.commits[*].sha - the commit sha
// + issue.commits[*].commit - a commit object
// + issue.commits[*].commit.tree - a commit tree obj
// + issue.commits[*].commit.message - the commit message
// + issue.commits[*].commit.url - permalink for a given commit
// + issue.commits[*].author - a github user object for the committing author
// + issue.commits[*].committer - a github user object for the committer
// + issue.base - an object representing the branch the pull-request is being made into
// + issue.base.label - an object representing the branch the pull-request is being made into
// + issue.base.ref - the name of the branch being referenced
// + issue.base.sha - the sha
// + issue.base.user - the github user object who own the requesting repo
// + issue.base.repo - a github repo object
// + issue.head - an object representing the branch the the pull-request is being made from
// + issue.head.label - an object representing the branch the pull-request is being made into
// + issue.head.ref - the name of the branch being referenced
// + issue.head.sha - the sha
// + issue.head.user - the github user object who own the requesting repo
// + issue.head.repo - a github repo object
// ==========================================

var util    = require('util');
var async   = require('async');
var request = require('request');

var github = require('./util/github');
var Issue  = require('./issue');

var PullRequest = function (issue, repo) {
    this.data = issue;
    this.repo = repo;
};

util.inherits(PullRequest, Issue);

var setIssueExport = PullRequest.prototype.setExport;

PullRequest.prototype.setExport = function (callback) {

    setIssueExport.call(this, function (err) {
        if (err) callback(err);

        this.exports.type = 'pull-request';
        this.exports.base = this.data.base;
        this.exports.head = this.data.head;

        async.parallel([
            this.getDiff.bind(this),
            this.getPaths.bind(this),
            this.getCommits.bind(this)
        ], callback);

    }.bind(this));
}

PullRequest.prototype.getDiff = function (callback) {
    var req = {};
    req.url = this.data.diff_url;
    if (process.env.http_proxy) {
        req.proxy = process.env.http_proxy;
    }

    request(req, function (err, res, body) {
        if (err) return callback(err);
        this.exports.diff = body;
        callback(null, body);
    }.bind(this));

}

PullRequest.prototype.getPaths = function (callback) {

    github.getFiles(this.repo.data.owner.login, this.repo.data.name, this.data.number, function (err, files) {
        if (err) return callback(err);

        github.getReviewComments(this.repo.data.owner.login, this.repo.data.name, this.data.number, function(err, comments) {
            files = attachCommentsToFile.call(this, files, comments);
            this.exports.files = files;
            callback(null, files);
        }.bind(this));

    }.bind(this));

}

PullRequest.prototype.getCommits = function (callback) {

    github.getCommits(this.repo.data.owner.login, this.repo.data.name, this.data.number, function (err, commits) {
        if (err) return callback(err);
        this.exports.commits = commits;
        callback(null, commits);
    }.bind(this));

}

// attach review comments to the related file
function attachCommentsToFile(files, comments) {
    return files.filter(function(file) {
        return file.comments = comments.filter(function(comment) {
            if (file.filename === comment.path) {
                return comment.reply = attachCommentReply.call(this, comment);
            }
        }.bind(this));
    }.bind(this));
}

// reply to a comment on a diff
function attachCommentReply(comment) {
    return function reply(body, callback) {
        github.replyToReviewComment(this.repo.data.owner.login, this.repo.data.name, this.data.number, comment.id, body, callback);
    }.bind(this);
}

module.exports = PullRequest;