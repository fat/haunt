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

    var username = github.username;
    var password = github.password;

    if (!username || !password) throw new Error('Please provide a username and password!');

    var tokens   = path.match(/:[^\/]+/g);
    var method   = options.method || 'get';
    var req = {};
    var params;

    if (typeof options == 'function') {
        callback = options;
        options  = {};
    }

    if (github.stub && method != 'get') return callback && callback();

    delete options.method;

    tokens && tokens.forEach(function (token) {
        var key = token.substr(1);
        path = path.replace(token, options[key]);
        delete options[key];
    });

    if (Object.keys(options).length) {
        if (method == 'get') path += '?' + querystring.stringify(options);
        else req.body = JSON.stringify(options);
    }

    req.url     = 'https://api.github.com' + path;
    req.json    = true;
    req.method  = method;
    req.headers = {
        'Host': 'api.github.com',
        'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
    }

    request(req, function (err, response, body) { callback && callback(err, body); });
}

module.exports.auth = function (username, password) {
    github.username = username;
    github.password = password;
}

module.exports.stub = function () {
    github.stub = true;
}

// fetch a repos from path
module.exports.getRepo = function (user, repo, callback) {

    github('/repos/:user/:repo', {
        user: user,
        repo: repo
    }, callback);

}


// fetch all pull requests for a repo
module.exports.getPullRequests = function (user, repo, page, pulls, callback) {
    if (typeof page == 'function') {
        callback = page;
        pulls    = [];
        page     = 1;
    }

    var options = {
        user: user,
        repo: repo,
        page: page,
        state: 'open',
        per_page: 50
    }

    github('/repos/:user/:repo/pulls', options, function (err, result) {
        if (err) return callback(err);
        pulls = pulls.concat(result);
        if (result.length === 50) module.exports.getIssues(user, repo, page + 1, pulls, callback);
        else callback(err, pulls);
    });
}


// fetches all issues for a repo
module.exports.getIssues = function (user, repo, page, issues, callback) {
    if (typeof page == 'function') {
        callback = page;
        issues   = [];
        page     = 1;
    }

    var options = {
        user: user,
        repo: repo,
        page: page,
        state: 'open',
        per_page: 50
    }

    github('/repos/:user/:repo/issues', options, function (err, result) {
        if (err) return callback(err);
        issues = issues.concat(result);
        if (result.length === 50) module.exports.getIssues(user, repo, page + 1, issues, callback);
        else callback(err, issues);
    });
};


// fetches as many comments as possible
module.exports.getComments = function (user, repo, number, page, comments, callback) {
    if (typeof page == 'function') {
        callback = page;
        comments = [];
        page     = 1;
    }

    var options = {
        user: user,
        repo: repo,
        page: page,
        number: number,
        per_page: '50'
    };

    github('/repos/:user/:repo/issues/:number/comments', options, function (err, result) {
        if (err) return callback(err);
        comments = comments.concat(result);
        if (result.length === 50) module.exports.getComments(user, repo, number, page + 1, comments, callback);
        else callback(err, comments);
    });
};

// fetches comments on all files in a pull request
module.exports.getReviewComments = function (user, repo, number, callback) {
    var page = 1;
    var comments = [];
    (function getReviewComments() {
        var options = {
            user: user,
            repo: repo,
            number: number,
            page: page,
            per_page: 50
        };
        github('/repos/:user/:repo/pulls/:number/comments', options, function (err, result) {
            if (err) return callback(err);
            comments = comments.concat(result);
            page++;
            if (result.length === options.per_page) getReviewComments();
            else callback(err, comments);
        });
    }());
};

// fetches as many files as possible
module.exports.getFiles = function (user, repo, number, page, files, callback) {
    if (typeof page == 'function') {
        callback = page;
        files    = [];
        page     = 1;
    }

    var options = {
        user: user,
        repo: repo,
        page: page,
        number: number,
        per_page: '50'
    };

    github('/repos/:user/:repo/pulls/:number/files', options, function (err, result) {
        if (err) return callback(err);
        files = files.concat(result);
        files.map(function(file) { return file.comment = commentOnFile(user, repo, number); });
        if (result.length === 50) module.exports.getFiles(user, repo, number, page + 1, files, callback);
        else callback(err, files);
    });
};

// fetches as many commits as possible
module.exports.getCommits = function (user, repo, number, page, commits, callback) {
    if (typeof page == 'function') {
        callback = page;
        commits  = [];
        page     = 1;
    }

    var options = {
        user: user,
        repo: repo,
        page: page,
        number: number,
        per_page: '50'
    };

    github('/repos/:user/:repo/pulls/:number/commits', options, function (err, result) {
        if (err) return callback(err);
        commits = commits.concat(result);
        if (result.length === 50) module.exports.getCommits(user, repo, number, page + 1, commits, callback);
        else callback(err, commits);
    });
};

module.exports.tagIssue = function (user, repo, label, number, callback) {
    github('/repos/:user/:repo/issues/:number/labels', {
        user: user,
        repo: repo,
        label: label,
        number: number,
        method: "POST"
    }, callback);
};

module.exports.closeIssue = function (user, repo, number, callback) {
    github('/repos/:user/:repo/issues/:number', {
        state: 'closed',
        user: user,
        repo: repo,
        number: number,
        method: 'PATCH'
    }, callback);
}

module.exports.assignIssue = function (user, repo, number, assignee, callback) {
    github('/repos/:user/:repo/issues/:number', {
        user: user,
        repo: repo,
        number: number,
        method: 'PATCH',
        assignee: assignee
    }, callback);
}

module.exports.commentOnIssue = function (user, repo, number, body, callback) {
    github('/repos/:user/:repo/issues/:number/comments', {
        user: user,
        repo: repo,
        body: body,
        number: number,
        method: 'POST'
    }, callback);
}

module.exports.replyToReviewComment = function(user, repo, number, comment_id, body, callback) {
    github('/repos/:user/:repo/pulls/:number/comments', {
        user: user,
        repo: repo,
        number: number,
        body: body,
        in_reply_to: comment_id,
        method: 'POST'
    }, callback);
}

function commentOnFile(user, repo, number) {
    return function(body, position, callback) {
        github('/repos/:user/:repo/pulls/:number/comments', {
            user: user,
            repo: repo,
            number: number,
            body: body,
            position: position,
            commit_id: this.sha,
            path: this.filename,
            method: 'POST'
        }, callback);
    }
}