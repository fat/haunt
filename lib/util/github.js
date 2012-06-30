// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 @fat
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================

var GitHub = require('github');
var github = new GitHub({ version: '3.0.0' });

github.authenticate({
  type:     'basic',
  username: 'haunt',
  password: 'pa$$w0rd'
});

module.exports.label      = function (label, callback) {};
module.exports.comments   = function (repo, issue, message, callback) {};
module.exports.closeIssue = function () {};


// fetches as many repos as possible
module.exports.getRepos = function (callback, page, results) {
  page    = page || 1;
  results = results || [];

  github.repos.getAll({ type: 'all', page: page, per_page: '50' }, function (err, response) {
    response = response || [];
    results  = results.concat(response);
    if (response.length == 50) {
      module.exports.getRepos(callback, page++, results);
    } else {
      callback(err, results);
    }
  });
};


// fetches as many pullRequests as possible
module.exports.getPullRequests = function (username, reponame, page, issues, callback) {
  if (typeof page == 'function') {
    callback = page;
    issues   = [];
    page     = 1;
  }

  var options = {
    user: username,
    repo: reponame,
    state: 'open',
    page: page,
    per_page: 50
  };

  github.pullRequests.getAll(options, function (err, result) {
    if (err) return callback(err);
    result = issues.concat(result);
    if (result.length === 50) module.exports.getIssues(username, reponame, page + 1, result, callback);
    else callback(err, result);
  });
};


// fetches as many issues as possible
module.exports.getIssues = function (username, reponame, page, issues, callback) {
  if (typeof page == 'function') {
    callback = page;
    issues   = [];
    page     = 1;
  }

  var options = {
    user: username,
    repo: reponame,
    state: 'open',
    page: page,
    per_page: 50
  };

  github.issues.repoIssues(options, function (err, result) {
    if (err) return callback(err);
    result = issues.concat(result);
    if (result.length === 50) module.exports.getIssues(username, reponame, page + 1, result, callback);
    else callback(err, result);
  });
};


// fetches as many comments as possible
module.exports.getComments = function (username, reponame, number, page, comments, callback) {
  if (typeof page == 'function') {
    callback = page;
    comments = [];
    page     = 1;
  }

  var options = {
    user:     username,
    repo:     reponame,
    page:     page,
    number:   number,
    per_page: '50'
  };

  github.issues.getComments(options, function (err, result) {
    if (err) return callback(err);
    result = comments.concat(result);
    if (result.length === 50) module.exports.getIssues(username, reponame, number, page + 1, result, callback);
    else callback(err, result);
  });
};


// fetches as many files as possible
module.exports.getFiles = function (username, reponame, number, page, comments, callback) {
  if (typeof page == 'function') {
    callback = page;
    comments = [];
    page     = 1;
  }

  var options = {
    user:     username,
    repo:     reponame,
    page:     page,
    number:   number,
    per_page: '50'
  };

  github.pullRequests.getFiles(options, function (err, result) {
    if (err) return callback(err);
    result = comments.concat(result);
    if (result.length === 50) module.exports.getFiles(username, reponame, number, page + 1, result, callback);
    else callback(err, result);
  });
};


// fetches as many commits as possible
module.exports.getCommits = function (username, reponame, number, page, comments, callback) {
  if (typeof page == 'function') {
    callback = page;
    comments = [];
    page     = 1;
  }

  var options = {
    user:     username,
    repo:     reponame,
    page:     page,
    number:   number,
    per_page: '50'
  };

  github.pullRequests.getCommits(options, function (err, result) {
    if (err) return callback(err);
    result = comments.concat(result);
    if (result.length === 50) module.exports.getCommits(username, reponame, number, page + 1, result, callback);
    else callback(err, result);
  });
};