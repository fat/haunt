# HAUNT

---

### What it is?

Haunt is a small, invite only, web service which helps keep your github issues under control. It does this by patroling your github repo and closing, sorting, and commenting on your issues as it sees fit.

Ultimately, Haunt's aim is to reduce the number of manual steps in github issue curation.



### How it's done?

Every 15 minutes haunt pulls new issues from your repo and runs a series of tests against the content of each issue.

- **If tests fail** the issue is closed and a comment is made to alert the issue creator why their issue was closed.
- **If tests pass** the issue is tagged and assigned.

In Tests are based on @necolas's guide here.



### Where to start?

Getting started with haunt is dead simple. Just add him as a collaborator to your project and he will start processing your issues right away.

Tired of haunt? Just remove him from your repo! Simple as that.

If you have any bugs or issues, please report them on our github page [here](https://github.com/fat/haunt)!