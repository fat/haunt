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

var init = function () {

  github.getRepos(function (err, repos) {
    if (err) return;

    async.forEach(repos, function (repo, next) {

    	repo = new Repo(repo).getData(function (err) {
    		err || repo.spook(next);
    	});

    }.bind(this));

  }.bind(this));

}

init();