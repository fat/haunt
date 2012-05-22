// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================

"use strict";

var express = require('express');
var hogan   = require('express-hogan.js'); // require('express-hogan.js')
var haunt   = require('./lib/haunt');

var app = express.createServer();

app.configure(function () {
  app.set('views', __dirname + '/views');
  app.register('.mustache', hogan);
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.get('/', function(req, res) {
  return res.render('pages/index.mustache');
});

app.get('*', function(req, res) {
  res.render('pages/404.mustache');
});

haunt.spook();

app.listen(3000);

console.log('Express server listening on port 3000');