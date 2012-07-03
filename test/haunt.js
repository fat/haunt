var assert = require('assert');

module.exports = {


    'issue': {

        'should include a <3 in the description': function (haunt) {
            assert.ok(/<3/.test(haunt.description));
        }

    }


}