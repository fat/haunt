var request = require('request');
var Module  = require('module');
var vm      = require('vm');

var sandbox = { module: { exports: {} } }; //shitty sandboxed context to limit the amount of scaryness

request('https://raw.github.com/documentcloud/underscore/master/underscore.js', function (err, res, body) {
  vm.runInNewContext(body, sandbox, 'myfile.vm');
  console.log(sandbox);
});