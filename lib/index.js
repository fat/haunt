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

module.exports = {

    allRepos: function (callback) {
        github.getRepos(function (err, repos) {
            if (err) return;

            async.forEach(repos, function (repo, next) {

                repo = new Repo(repo).getData(function (err) {
                    err || repo.spook();
                });

            }.bind(this));

        }.bind(this));
    },


    // These methods are really only for testing shiz
    // ==============================================

    repo: function (repoPath, callback) {
        /([^\/:]*)\/([^\/:]*)$/.exec(repoPath);
        github.getRepo(RegExp.$1,  RegExp.$2, function (err, repo) {
            repo = new Repo(repo).getData(function (err) {
                err || repo.spook();
            });
        });
    },

    repoWithTests: function (repoPath, testPath, callback) {
        /([^\/:]*)\/([^\/:]*)$/.exec(repoPath);
        github.getRepo(RegExp.$1, RegExp.$2, function (err, repo) {
            repo = new Repo(repo);
            repo.getTests = function (callback) {
                repo.tests = require(testPath);
                callback(null, repo.tests);
            }
            repo.getData(function (err) {
                err || repo.spook();
            });
        });
    }

}