(function () {
    "use strict";

    var reporter = require('nodeunit-browser-tap');

    reporter.run({
        fields: require('./test/test-fields'),
        // form: require('./test/test-form'), disabled until server-specific tests are split out
        forms: require('./test/test-forms'),
        render: require('./test/test-render'),
        // validators: require('./test/test-validators'), disabled until this unicode fix is merged: https://github.com/substack/testling/pull/35
        widgets: require('./test/test-widgets')
    });
}());

