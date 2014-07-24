(function () {
    "use strict";

     require('./test/test-fields');
     // require('./test/test-form'); // disabled until server-specific tests are split out
     require('./test/test-forms');
     require('./test/test-render');
     require('./test/test-tag');
     // require('./test/test-validators'); // disabled until this unicode fix is merged: https://github.com/substack/testling/pull/35
     require('./test/test-widgets');
}());

