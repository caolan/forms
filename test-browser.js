(function () {
    "use strict";
    var tape = require('tape');
    var tapeDOM = require('tape-dom');
    tapeDOM.installCSS();
    tapeDOM.stream(tape);

     require('./test/test-fields');
     // require('./test/test-form'); // disabled until server-specific tests are split out
     require('./test/test-forms');
     require('./test/test-render');
     require('./test/test-tag');
     // require('./test/test-validators'); // disabled until this unicode fix is merged: https://github.com/substack/testling/pull/35
     require('./test/test-widgets');
}());

