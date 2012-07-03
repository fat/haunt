// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================

var path   = require('path');
var async  = require('async');

var Repo     = require('./repo');
var github   = require('./util/github');

module.exports = {

    auth: function (username, password) {
        github.auth(username, password);
        return this;
    },

    repo: function (options, callback) {

        if (typeof options == 'string') options = { repo: options };

        if (options.stub) github.stub();

        /([^\/:]*)\/([^\/:]*)$/.exec(options.repo);

        github.getRepo(RegExp.$1, RegExp.$2, function (err, repo) {
            if (err) throw err;

            if (repo.message) throw new Error (repo.message);

            repo = new Repo(repo, options);

            if (options.tests) {
                repo.getTests = function (callback) {
                    repo.tests = options.tests;
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