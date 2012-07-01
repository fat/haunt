// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 @fat
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================
// Helper
// + Helper.tag - (accepts a tagname) tags an issue/pull-request
// + Helper.close - closes an issue/pull-request
// + Helper.assign - (accepts a username) assigns an issue/pull-request
// + Helper.comment - (accepts a string) comments on an issue/pull-request
// + Helper.comment.failure - (accepts an array of failed tests) generic test failure message, which notifies a user what failed.
// + Helper.comment.warning - (accepts an array of failed tests) generic test warning message, which notifies a user what failed.
// ==========================================

var Helper = function () {}

Helper.prototype.tag = function () {}
Helper.prototype.close = function () {}
Helper.prototype.assign = function () {}
Helper.prototype.comment = function () {}
Helper.prototype.comment.failure = function () {}
Helper.prototype.comment.warning = function () {}

module.exports = Helper;