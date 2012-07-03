var assert = require('assert');

module.exports = {

    'issue': {

        'issues should be prefixed with the word bug': function (issue) {
            assert.ok(/^bug/.test(issue.title));
        },

        'after': function (issue) {

            if (issue.reporter.stats.failures) {
                issue.raise(issue.close.bind(issue));
            }

        }

    }

}