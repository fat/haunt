// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================

var github = require('./util/github');
var Repo   = require('./core/repo');

var spook = function () {

  // fetch all github repos with haunt
  github.getRepos(function (err, repos) {
    if (err) throw err;

    repos.forEach(function (item) {

      var repo = new Repo(item);

      repo.getTests(function (err, tests) {

      });

      // github.getIssues(repo.owner.login, repo.name, function (err, issues) {
      //   if (err) throw err;
      //   new Haunt(repo, issues).spook();
      // });
    });

  });

}


spook();