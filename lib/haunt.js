// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================

var GitHub      = require('github');
var HauntRunner = require('./haunts');


// initialize github v3.0.0 instance for haunt
var github = new GitHub({
  version: '3.0.0'
});

github.authenticate({
  type: 'basic',
  username: 'haunt',
  password: 'pa$$w0rd'
});


// get all repos haunt has been added to
var getRepos = function (callback) {
  github.repos.getAll({
    type: "all",
    page: "1",
    per_page: "50"
  }, callback);
};


// fetch all open issues recursively
var getIssues = function (username, reponame, page, issues, callback) {
  if (typeof page == 'function') {
    callback = page;
    page     = 1;
    issues   = [];
  }

  github.issues.repoIssues({
    user: username,
    repo: reponame,
    page: page,
    per_page: '50'
  }, function (err, result) {
    if (err) return callback(err);
    if (result.length === 50) getIssues(username, reponame, page + 1, issues.concat(result), callback);
    else callback(err, result);
  });
};


// process a repo
var processRepo = function (repo) {
  getIssues(repo.owner.login, repo.name, function (err, issues) {
    if (err) throw err;
    new HauntRunner(repo, issues)
      .on('error')
      .on('success')
      .on('end')
      .haunt();
  });
};


// initialize haunt
module.exports.spook = function () {
  // todo: setInterval 15 minutes
  getRepos(function (err, repos) {
    if (err) throw err;
    repos.forEach(processRepo);
  });
};