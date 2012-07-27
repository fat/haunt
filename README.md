# HAUNT

### What is it?

**Haunt helps you keep your github issues under control.** It does this by allowing you to run unit tests against github issues and pull-requests, then make contextual decisions about closing, sorting, tagging, and commenting.

---
### How it's done?

Haunt pulls all open issues/pull-requests from your repo and gathers a bunch of data about them from github's api. It then runs a series of tests (which you define). Each test is provided a special haunt object which contains all the issue data as well as an api to act directly on the issue.

---
### Real Life Examples

I run Haunt occasionally against [bootstrap's](//github.com/twitter/bootstrap) issues/pull requests to keep them in order and to keep the ticketing process sane. Initially haunt closed 48 of 54 pull requests and about 65+ issues. It also tagged a number of issues as popular (accomplished with a small `before` filter which checks for +1 comments).

Here's [a link](https://github.com/twitter/bootstrap/pull/4165) to an actual pull request it closed. If you look at the bottom you can see that haunt made a comment explaining why the pull request was invalid, before closing it. Closing an issue of course is optional, we're just doing this in bootstrap to weed out people who file issues and never come back.

The tests I ran against bootstrap are literally the same that are in the [examples dir](https://github.com/fat/haunt/blob/master/examples/basic.js) of this repo. The only difference is i've named them `.issue-guidlines.js` [in bootstrap]( https://github.com/twitter/bootstrap/blob/2.1.0-wip/.issue-guidelines.js).

---
### Where to start?

You can use haunt from the command line or programatically.

##### CLI

To use Haunt from the command line, install like so:

    $ npm install haunt -g

This will give you a haunt command you can use from terminal.

    $ haunt

Running haunt with no arguments will output some simple cli documentation.


    Usage:

        haunt <test-path> <github-path>

    Flags:

        --stub     - (-s)      stubs the github api, so that requests aren't actually made to live github data
        --user     - (-u u:p)  specify a username and password for an account to make issue changes on behalf of
        --reporter - (-r Spec) specify a mocha reporter for test output formatting. If not specified, nothing will be output.

    Example:

        $ haunt .issue_guidelines.js http://github.com/twitter/bootstrap

    General Help:

        http://git.io/haunt


To run some local tests against a remote repo, you might do something like this:

    $ haunt ./path/to/my/local/tests.js http://github.com/my/repo

**Note:** haunt will prompt you for a username and password. Alternatively, you can specify them as an option by using the `--user` or `-u` flag. We use this to authenticate against the github api. All actions performed by your tests will be made on behalf of the authenticated user.

It's also worth noting that if you don't provide a local test file, haunt will look for a remote `.issue-guidelines.js` file in the root of the remote repo. This might look something like:

    $ haunt http://github.com/my/repo

##### Programatic API

You may want to use the programatic api to build out a service, or something which routinely runs to keep your issues under control at a more consistent interval (like a bot).

To use haunt programmatically, just do something like:

```js
var haunt = require('haunt');

haunt.auth('user', 'pass');
haunt.repo('http://github.com/my/repo', callback);

// haunt.repo also can take an options object.
// This can contain things like:
// + stub     - (boolean) stubs the github api write requests
// + tests    - (object)  a haunt test object
// + reporter - (object)  a mocha test reporter type

haunt.repo({
    repo: 'http://github.com/my/repo',
    tests: myTests,
    reporter: 'Landing',
    stub: true
}, callback);
```

---
### Writing Tests

All haunt tests are assumed to be synchronous.

A basic haunt test file exports a single object with the two optional properties `pull-request` and `issue`. This looks something like this:

```js
module.exports = {
    'pull-requests' : { … },
    'issues'        : { … }
}
```

Each optional object (`pull-request` and `issue`) should include a series of tests to be ran against the specified issue type. In addition to the tests you may also specify a before and after property. Before will be executed before all tests are ran, after will be executed after all tests have ran. All methods are passed a single argument which contains an interface into a github issue or pull-request.

A simple issue test file might look like this:

```js
var assert = require('assert');

module.exports = {

    'issues': {

        'should be prefixed with the word bug': function (issue) {
            assert.ok(/^bug/.test(issue.title));
        },

        'after': function (issue) {

            if (issue.reporter.stats.failures) {
                issue.reportFailures(issue.close.bind(issue));
            }

        }

    }

}
```

##### Issues

When testing issues, your function will be passed an object with the following properties:

+ issue.created_at - the created_at time of an issue
+ issue.updated_at - the updated_at time of an issue
+ issue.milestone - the assigned milestone of an issue
+ issue.assignee - the assignee of an issue
+ issue.labels - the labels for an issue
+ issue.number - the issue number
+ issue.title - the issue title
+ issue.body - the issue description body
+ issue.user - a user object for the person who filed an issue
+ issue.user.gravatar_id - a gravatar id for the user
+ issue.user.login - a user's github handle
+ issue.user.url - the url for a user's github page
+ issue.user.avatar_url - an avatar url
+ issue.user.id - a user's id number
+ issue.id - the issue's id
+ issue.comments - an array of github comment objects
+ issue.comments[x].created_at - the created_at time for a comment
+ issue.comments[x].updated_at - the updated_at time for a comment
+ issue.comments[x].user[*] - a user object for the person posting a comment (same properties as issue user obj)
+ issue.comments[x].body - the text body of a comment
+ issue.comments[x].id - the comment id
+ issue.comments[x].url - the permalink url for a particular comment


##### Pull-Request

When testing pull-requests, your function will be passed an object with the following properties (in addition to all properties provided to a normal issue as specified above):

+ issue.diff o- the complete diff of a pull-request
+ issue.files - an array of the files changed in a commit
+ issue.files[*].patch - the patch for a specific file
+ issue.files[*].filename - the filename changed
+ issue.files[*].status - the status of the file (modified, deleted, etc.)
+ issue.files[*].changes - the number of changes made in a file
+ issue.files[*].deletions - the number of deletions made in a file
+ issue.commits - an array of git commits
+ issue.commits[*].sha - the commit sha
+ issue.commits[*].commit - a commit object
+ issue.commits[*].commit.tree - a commit tree obj
+ issue.commits[*].commit.message - the commit message
+ issue.commits[*].commit.url - permalink for a given commit
+ issue.commits[*].author - a github user object for the committing author
+ issue.commits[*].committer - a github user object for the committer
+ issue.base - an object representing the branch the pull-request is being made into
+ issue.base.label - an object representing the branch the pull-request is being made into
+ issue.base.ref - the name of the branch being referenced
+ issue.base.sha - the sha
+ issue.base.user - the github user object who own the requesting repo
+ issue.base.repo - a github repo object
+ issue.head - an object representing the branch the the pull-request is being made from
+ issue.head.label - an object representing the branch the pull-request is being made into
+ issue.head.ref - the name of the branch being referenced
+ issue.head.sha - the sha
+ issue.head.user - the github user object who own the requesting repo
+ issue.head.repo - a github repo object

##### Before

Before methods will be passed an object with the same properties as an issue/pull-request.

##### After

After methods will be passed an object with the same properties as an issue/pull-request, with the addition of a mocha reporter object:

+ issue.reporter.stats - a mocha stat object
+ issue.reporter.stats.tests - the number of tests run
+ issue.reporter.stats.passes - the number of tests passed
+ issue.reporter.stats.failures - the number of tests failed
+ issue.reporter.failures - an array of failed test object
+ issue.reporter.failures[*].title - the title of the failed test

##### Methods

The following convenience methods are made available on all haunt objects. You can call these at any time - though I recommend you only really use them in `after` methods.

+ issue.tag - (accepts a tagname) tags an issue/pull-request
+ issue.close - closes an issue/pull-request
+ issue.assign - (accepts a username) assigns an issue/pull-request
+ issue.comment - (accepts a string) comments on an issue/pull-request
+ issue.files[*].comment - (accepts an comment and line number) comment on a given line number in a diff of a pull-request
+ issue.reportFailures - generic test failure message, which notifies a user what failed based on mocha reporter.
