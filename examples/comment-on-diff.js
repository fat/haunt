// COMMENT ON DIFF EXAMPLE
// =======================

var assert = require('assert');

module.exports = {

    'pull-requests': {

        'should not use deprecated path.exists(Sync)': function (pull) {
            pull.files.forEach(function (file) {
                findOnLine(/path\.exists|path\.existsSync/, file.patch, function(err, lineNum) {

                    file.comment(
                        'Yo dude path.exists(Sync) has been deprecated in nodejs v0.8, use fs.exists(Sync) instead.',
                        lineNum
                    )

                })
            })
        }

    }

}

// find stuff in a diff and return the line number
function findOnLine(find, patch, cb) {
    if (find.test(patch)) {
        var lineNum = 0
        patch.split('\n').forEach(function(line) {
            var range = /\@\@ \-\d+,\d+ \+(\d+),\d+ \@\@/g.exec(line)
            if (range) {
                lineNum = Number(range[1]) - 1
            } else if (line.substr(0, 1) !== '-') {
                lineNum++
            }
            if (find.test(line)) {
                return cb(null, lineNum)
            }
        })
    }
}
