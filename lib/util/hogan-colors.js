// ==========================================
// Haunt: The Github Issue Bot
// ==========================================
// Copyright 2012 @fat
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================

var colors = require('colors');
var hogan  = require('hogan.js');
var _      = require('underscore');

module.exports = hogan.Template.prototype.renderWithColors = function (context, partials, indent) {
  context = _.extend({
    magenta : function (s) { return s.magenta },
    yellow  : function (s) { return s.yellow  },
    green   : function (s) { return s.green   },
    cyan    : function (s) { return s.cyan    },
    grey    : function (s) { return s.grey    },
    red     : function (s) { return s.red     }
  }, context);
  return this.ri([context], partials || {}, indent);
};