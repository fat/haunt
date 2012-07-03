// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================

var path   = require('path');
var async  = require('async');

var Repo   = require('./repo');
var github = require('./util/github');

module.exports = {

    auth: function (username, password) {
        github.auth(username, password);
        return this;
    },

    repo: function (repoPath, testPath, callback) {

        if (typeof testPath == 'function') {
            callback = testPath;
            testPath = null;
        }

        /([^\/:]*)\/([^\/:]*)$/.exec(repoPath);

        github.getRepo(RegExp.$1, RegExp.$2, function (err, repo) {
            if (err) throw err;

            if (repo.message) throw new Error (repo.message);

            repo = new Repo(repo);

            if (testPath) {
                repo.getTests = function (callback) {
                    repo.tests = require(path.join(process.cwd(), testPath));
                    callback(null, repo.tests);
                }
            }

            repo.getData(function (err) {
                if (err) throw err;
                repo.spook();
            });
        });

        return this;
    }

}