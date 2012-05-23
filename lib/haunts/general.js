// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================
// + if more than 5 +1 comments, tag as
//   important
// + check for duplicate issues
// + check if the issue has been fixed, or
//   feature implemented
// ==========================================

var github = require('../util/github');

module.exports.isRelevant = function (issue) {
  return true;
}

module.exports.tests = [

  function testDuplicates (issue, next) {
    // todo: implement duplicate tests
    next();
  },

  function testFixed (issue, next) {
    // todo: implement already fixed tests
    next();
  },

  function testImportance (issue, next) {
    if (this.issue.comments < 5) return next();

    github.getComments(this.repo.owner.login, this.repo.name, this.issue.number, function () {
      var count = 0;

      comments.forEach(function (comment) {
        if (/\b\+1\b)/.test(comment.body)) count++;
      });

      if (count > 5) {
        github.tag('important', next);
      }
    });
  }

];