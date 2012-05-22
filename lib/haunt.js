// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================

var github  = require('./util/github');
var Haunter = require('./haunts');

var hauntDat = function (repo) {
  github.getIssues(repo.owner.login, repo.name, function (err, issues) {
    if (err) throw err;
    new Haunter(repo, issues)
      .on('error', function (err) { throw err; })
      .on('data',  function () { console.log('data', arguments); })
      .on('end',   function () { console.log('end', arguments);  })
      .haunt();
  });
};

module.exports.spook = function () {
  // todo: setInterval 15 minutes
  github.getRepos(function (err, repos) {
    if (err) throw err;
    repos.forEach(hauntDat);
  });
};