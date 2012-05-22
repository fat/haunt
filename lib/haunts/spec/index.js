// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================

var github = require('../../util/github');

module.exports = function (issue, repo, callback) {

  // if more than 5 +1 comments, tag as important
  // check for duplicate issues
  // check if the issue has been fixed, or feature implemented

  var testImportance = function (err, comments) {
    var count = 0;

    comments.forEach(function (comment) {
      if (/\b\+1\b)/.test(comment.body)) count++;
    });

    if (count > 5) {
      github.tag('important');
    }
  }

  if (issue.comments > 5) {
    github.getComments(repo.owner.login, repo.name, issue.number, testImportance);
  }

}