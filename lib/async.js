'use strict';

var forEachSeries = function (values, asyncCallback, finalCallback) {
    if (values.length === 0) {
        process.nextTick(function () {
            finalCallback(null);
        });
    } else {
        asyncCallback(values[0], function (err) {
            if (err) {
                finalCallback(err);
            } else {
                forEachSeries(values.slice(1), asyncCallback, finalCallback);
            }
        });
    }
};

var forEach = function (values, asyncCallback, finalCallback) {
    if (values.length === 0) {
        process.nextTick(function () {
            finalCallback(null);
        });
    } else {
        asyncCallback(values[0], function (err) {
            if (err) {
                finalCallback(err);
            } else {
                forEach(values.slice(1), asyncCallback, finalCallback);
            }
        });
    }
};

module.exports = {
    forEach: forEach,
    forEachSeries: forEachSeries
};
