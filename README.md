# HAUNT

### Note: 

This isn't done yet. And basically will only create the issue and pull request objects at this point.

### TODO
+ add bin executable for locally testing: `haunt ./path/to/local/haunt.js github.com/project/to_haunt`
+ Decide how to mark issue has consumed (so that same issue isn't reprocessed)
+ move haunt onto some sort of cron/interval thing
+ web service front end?

---

### What it is?

Haunt is a small bot which helps keep your github issues under control. It does this by patrol your github repo, and exposing an api to you for easily closing, sorting, and commenting on all your issues!

Ultimately, Haunt's aim is to reduce the number of manual steps in github issue curation and give you more time to code :)


### How it's done?

Every ~15 minutes haunt pulls new issues from your repo and runs a series of tests against the content of each issue. You than take action based on the results of your tests.


### Where to start?

Getting started with haunt is *dead* simple (zing :D). Just add him as a collaborator to your project and he will start processing your issues right away.

Tired of haunt? Just remove him from your repo! Simple as that.

If you have any bugs or issues, please report them on our github page [here](https://github.com/fat/haunt)!


### haunt.js

Haunt runs unit tests defined by a haunt.js file in the root of your directory. All tests are assumed to be syncronous.

A basic haunt.js file exports a single object with the two optional properties `pull-request` and `issue`. This looks something like this:

```js
module.exports = {
    'pull-request': { … }
    'issue': { … }
}
```

Each optional object (`pull-request` and `issue`) may include a series of tests to be ran against the specified issue type. In addition to the tests you may also specifiy a before and after property. Before will be executed before tests are ran, after will be executed after tests have ran. The before and after methods are passed one argument, the haunt object.

+ haunt - an object which contains an interface into a github issue or pull-request.

Tests however are passed two arguments:

+ assert - node's assert module (used for simple assertions)
+ haunt  - a javascript object which contains an inteface into a github issue or pull-request.

A simple issue object might look like this:

```js
module.exports = {
    'issue': { 

        'should include a <3 in the description': function (assert, haunt) {
            assert.ok(/<3/.test(haunt.description));
        },

        'after': function (haunt) {
            if (!haunt.failed.length) haunt.tag('<3');
        }

    }
}
```

##### Pull Request

The haunt object will contain the following properties when testing is made against a pull request:

+ haunt.user - the user opening the pull-request
+ haunt.title - the title of the pull request
+ haunt.description - the description of a pull request
+ haunt.branches.from - the branch the pull-request is being made from
+ haunt.branches.into - the branch the pull-request is being made into
+ haunt.diff o- the diff of the pull-request
+ haunt.comments - an array of github comment objects
+ haunt.commits - an array of git commits
+ haunt.paths - an array of the paths changed in a commit


##### Issues

When made against an issue, haunt will contain the following properties.

+ haunt.user - the user opening the pull-request
+ haunt.title - the title of the pull request
+ haunt.description - the description of a pull request
+ haunt.comments - an array of github comment objects


#### Before

When executed before an issue, the haunt contain everything made available to a regular test

#### After

When executed after an issue, the haunt will contain eferything made available to a regular test, with the addition of the following properties:

+ haunt.failed - an array of the failed tests
+ haunt.passed - an array of the passed tests

##### Methods

The following convenience methods are made available on all haunt objects. You can call these at any time - though I recommend you only really use then in after methods.

+ haunt.tag - (accepts a tagname) tags an issue/pull-request
+ haunt.close - closes an issue/pull-request
+ haunt.assign - (accepts a username) assigns an issue/pull-request
+ haunt.comment - (accepts a string) comments on an issue/pull-request
+ haunt.comment.failure - (accepts an array of failed tests) generic test failure message, which notifies a user what failed.
+ haunt.comment.warning - (accepts an array of failed tests) generic test warning message, which notifies a user what failed.

##### Examples 

Here's the simple Bootstrap haunt.js file that I wrote - it saves me sooooo much time!: 

```js

module.exports = {

    'pull-request': {

        'should always be made against -wip branches': function (assert, haunt) {
            assert.ok(/\-wip$/.test(haunt.branches.to.test));
        },

        'should always include a unit test if changing js files': function (assert, haunt) {
            var hasJS    = false;
            var hasTests = false;

            haunt.paths.forEach(function (path) {
                if (/\/js\/[^./]+.js/.test(path))            hasJS = true;
                if (/\/js\/test\/unit\/[^.]+.js/.test(path)) hasTests = true;
            })

            assert.ok(!hasJS || hasJS && hasTests);
        },

        'after': function (haunt) {
            if (haunt.failed.length) {
                haunt.comment.failure(haunt.failed).close();
            }
        }
    }

    'issue': {

        'should always include a tag definition': function (assert, haunt) {
            assert.ok(/tag: \w+/.test(haunt.description))
        }

        'after': function (haunt) {
            // tag as popular if > 5 +1's
            var plusOne = 0;

            haunt.comments.forEach(function (comment) {
                if (/\+1/.test(comment.text)) plusOne++;
            });

            if (plusOne > 5) haunt.tag('Popular')

            // apply user defined tags
            var tags = /tag: ([\w, ]+)/.exec(haunt.description)[1].replace(/\s+/, '').split(',');

            tags.forEach(haunt.tag);
        }


    }

}
```