// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 @fat
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================

var github = require('./util/github');
var Repo   = require('./core/repo');

github.getRepos(function (err, repos) {
  if (err) throw err;

  repos.forEach(function (data) {

    var repo = new Repo(data);

    repo.getTests(function (err) {

      if (err) return; // todo: maybe send an email? and/or have an image thing like travis?

      repo.getIssues(function (err) {

        if (err) return; // todo: something?

        repo.haunt();

      });

    });

  });

});