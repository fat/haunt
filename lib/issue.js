// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 @fat
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================
// ISSUE
// + issue.created_at - the created_at time of an issue
// + issue.updated_at - the updated_at time of an issue
// + issue.milestone - the assigned milestone of an issue
// + issue.assignee - the assignee of an issue
// + issue.labels - the labels for an issue
// + issue.number - the issue number
// + issue.title - the issue title
// + issue.body - the issue description body
// + issue.user - a user object for the person who filed an issue
// + issue.user.gravatar_id - a gravatar id for the user
// + issue.user.login - a user's github handle
// + issue.user.url - the url for a user's github page
// + issue.user.avatar_url - an avatar url
// + issue.user.id - a user's id number
// + issue.id - the issue's id
// + issue.comments - an array of github comment objects
// + issue.comments[x].created_at - the created_at time for a comment
// + issue.comments[x].updated_at - the updated_at time for a comment
// + issue.comments[x].user[*] - a user object for the person posting a comment (same properties as issue user obj)
// + issue.comments[x].body - the text body of a comment
// + issue.comments[x].id - the comment id
// + issue.comments[x].url - the permalink url for a particular comment
// ==========================================

var github = require('./util/github');
var Helper = require('./helper')

var Issue = function (issue, repo) {
    this.data    = issue;
    this.repo    = repo;
};

Issue.prototype.setExport = function (callback) {

    this.exports = new Helper({
        created_at : this.data.created_at,
        updated_at : this.data.updated_at,
        milestone  : this.data.milestone,
        assignee   : this.data.assignee,
        labels     : this.data.labels,
        number     : this.data.number,
        title      : this.data.title,
        body       : this.data.body,
        user       : this.data.user,
        id         : this.data.id,
        comments   : []
    });

    if (!this.data.comments) return callback();
    
    this.getComments(function (err, comments) {
        this.exports.comments = comments;
        callback(err);
    }.bind(this));

};

Issue.prototype.getComments = function (callback) {
    
    github.getComments(this.repo.data.owner.login, this.repo.data.name, this.data.number, function (err, comments) {
        if (err) throw callback(err);
        callback(null, comments);
    }.bind(this));

};

module.exports = Issue;