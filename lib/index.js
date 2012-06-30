// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================

var async  = require('async');

var github = require('./util/github');
var Repo   = require('./repo');

var spook = function () {

  github.getRepos(function (err, repos) {
    if (err) throw err;

    async.forEach(repos, function (repo, next) {
        repo = new Repo(repo).getData(function () {
            console.log(repo);
        });
    }.bind(this));

  }.bind(this));

}


spook();