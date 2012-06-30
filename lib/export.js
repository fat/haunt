// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 @fat
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================
// Export
// + obj.tag - (accepts a tagname) tags an issue/pull-request
// + obj.close - closes an issue/pull-request
// + obj.assign - (accepts a username) assigns an issue/pull-request
// + obj.comment - (accepts a string) comments on an issue/pull-request
// + obj.comment.failure - (accepts an array of failed tests) generic test failure message, which notifies a user what failed.
// + obj.comment.warning - (accepts an array of failed tests) generic test warning message, which notifies a user what failed.
// ==========================================

var Export = function () {}

Export.prototype.tag = function () {}
Export.prototype.close = function () {}
Export.prototype.assign = function () {}
Export.prototype.comment = function () {}
Export.prototype.comment.failure = function () {}
Export.prototype.comment.warning = function () {}

module.exports = Export;