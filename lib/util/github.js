// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 @fat
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================

var request     = require('request');
var querystring = require('querystring');

var github = function (path, options, callback) {
    var username = 'haunt';
    var password = 'pa$$w0rd';
    var tokens   = path.match(/:[^\/]+/g);
    var method   = options.method || 'get';

    if (typeof options == 'function') {
        callback = options;
        options  = {};
    }

    delete options.method;

    tokens && tokens.forEach(function (token) {
        var key = token.substr(1);
        path = path.replace(token, options[key]);
        delete options[key];
    });

    if (Object.keys(options).length) path += '?' + querystring.stringify(options);

    request({ 
        url: 'https://api.github.com' + path, 
        json:true,
        headers: { 
            'Host': 'api.github.com', 
            'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64') 
        }
    }, function (err, response, body) { callback(err, body); });
}


// fetch all repos for authed user
module.exports.getRepos = function (callback, page, results) {
    page    = page || 1;
    results = results || [];

    github('/user/repos', {
        page: page,
        per_page: '50'
    }, function (err, result) {
        result  = result || [];
        results = results.concat(result);
        if (result.length == 50) module.exports.getRepos(callback, page++, results);
        else callback(err, results);
    });
}


// fetch all pull requests for a repo
module.exports.getPullRequests = function (username, reponame, page, issues, callback) {
    if (typeof page == 'function') {
        callback = page;
        issues   = [];
        page     = 1;
    }

    var options = {
        user: username,
        repo: reponame,
        state: 'open',
        per_page: 50,
        page: page
    }

    github('/repos/:user/:repo/pulls', options, function (err, result) {
        if (err) return callback(err);
        result = issues.concat(result);
        if (result.length === 50) module.exports.getIssues(username, reponame, page + 1, result, callback);
        else callback(err, result);
    });
}


// fetches all issues for a repo
module.exports.getIssues = function (username, reponame, page, issues, callback) {
    if (typeof page == 'function') {
        callback = page;
        issues   = [];
        page     = 1;
    }

    var options = {
        user: username,
        repo: reponame,
        state: 'open',
        per_page: 50,
        page: page
    }

    github('/repos/:user/:repo/issues', options, function (err, result) {
        if (err) return callback(err);
        result = issues.concat(result);
        if (result.length === 50) module.exports.getIssues(username, reponame, page + 1, result, callback);
        else callback(err, result);
    });
};


// fetches as many comments as possible
module.exports.getComments = function (username, reponame, number, page, comments, callback) {
    if (typeof page == 'function') {
        callback = page;
        comments = [];
        page     = 1;
    }

    var options = {
        user: username,
        repo: reponame,
        number: number,
        per_page: '50',
        page: page
    };

    github("/repos/:user/:repo/issues/:number/comments", options, function (err, result) {
        if (err) return callback(err);
        result = comments.concat(result);
        if (result.length === 50) module.exports.getIssues(username, reponame, number, page + 1, result, callback);
        else callback(err, result);
    });
};


// fetches as many files as possible
module.exports.getFiles = function (username, reponame, number, page, comments, callback) {
    if (typeof page == 'function') {
        callback = page;
        comments = [];
        page     = 1;
    }

    var options = {
        user: username,
        repo: reponame,
        number: number,
        per_page: '50',
        page: page
    };

    github("/repos/:user/:repo/pulls/:number/files", options, function (err, result) {
        if (err) return callback(err);
        result = comments.concat(result);
        if (result.length === 50) module.exports.getFiles(username, reponame, number, page + 1, result, callback);
        else callback(err, result);
    });
};


// fetches as many commits as possible
module.exports.getCommits = function (username, reponame, number, page, comments, callback) {
    if (typeof page == 'function') {
        callback = page;
        comments = [];
        page     = 1;
    }

    var options = {
        user: username,
        repo: reponame,
        number: number,
        per_page: '50',
        page: page
    };

    github("/repos/:user/:repo/pulls/:number/commits", options, function (err, result) {
        if (err) return callback(err);
        result = comments.concat(result);
        if (result.length === 50) module.exports.getCommits(username, reponame, number, page + 1, result, callback);
        else callback(err, result);
    });
};

// module.exports.label = function (label, callback) {

//     github('issues/label/add/:user/:repo/:label/:number', {
//         user: user,
//         repo: repo,
//         label: label,
//         number: number
//     }, callback);

// };
