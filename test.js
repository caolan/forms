#!/usr/local/bin/node

// require.paths.push(__dirname);
// require.paths.push(__dirname + '/deps');
// require.paths.push(__dirname + '/lib');
/* Note: require.paths is removed in node v0.5 and later. Use 'NODE_PATH=`pwd`:`pwd`/deps/:`pwd`/lib/ node test.js' to run tests. */

try {
    var testrunner = require('nodeunit').testrunner;
} catch(e) {
    var util = require('util');
    util.puts("Cannot find nodeunit module.");
    util.puts("You can download submodules for this project by doing:");
    util.puts("");
    util.puts("    git submodule init");
    util.puts("    git submodule update");
    util.puts("");
    process.exit();
}

process.chdir(__dirname);
testrunner.run(['test']);
