/*jslint node: true */
'use strict';

var util  = require('util')
  , forms = require('./forms');

function getMessagesFromOpts(opts) {
    var locale;

    if (typeof opts !== 'object' || !opts.hasOwnProperty('locale')) {
        locale = 'en';
    }
    else {
        locale = opts.locale;
    }

    return forms.loadLocale(locale);
}

exports.matchField = function (match_field) {
    return function (form, field, callback, opts) {
        if (form.fields[match_field].data !== field.data) {
            callback(util.format(getMessagesFromOpts(opts).matchField, match_field));
        } else {
            callback();
        }
    };
};

exports.min = function (val) {
    return function (form, field, callback, opts) {
        if (field.data >= val) {
            callback();
        } else {
            callback(util.format(getMessagesFromOpts(opts).min, val));
        }
    };
};

exports.max = function (val) {
    return function (form, field, callback, opts) {
        if (field.data <= val) {
            callback();
        } else {
            callback(util.format(getMessagesFromOpts(opts).max, val));
        }
    };
};

exports.range = function (min, max) {
    return function (form, field, callback, opts) {
        if (field.data >= min && field.data <= max) {
            callback();
        } else {
            callback(util.format(getMessagesFromOpts(opts).range, min, max));
        }
    };
};

exports.minlength = function (val) {
    return function (form, field, callback, opts) {
        if (field.data.length >= val) {
            callback();
        } else {
            callback(util.format(getMessagesFromOpts(opts).minlength, val));
        }
    };
};

exports.maxlength = function (val) {
    return function (form, field, callback, opts) {
        if (field.data.length <= val) {
            callback();
        } else {
            callback(util.format(getMessagesFromOpts(opts).maxlength, val));
        }
    };
};

exports.rangelength = function (min, max) {
    return function (form, field, callback, opts) {
        if (field.data.length >= min && field.data.length <= max) {
            callback();
        } else {
            callback(util.format(getMessagesFromOpts(opts).rangelength, min, max));
        }
    };
};

exports.regexp = function (re, message) {
    re = (typeof re === 'string') ? new RegExp(re) : re;
    return function (form, field, callback, opts) {
        if (re.test(field.data)) {
            callback();
        } else {
            callback(message || getMessagesFromOpts(opts).regexp);
        }
    };
};

exports.color = function () {
    var re = /^#([0-9A-F]{8}|[0-9A-F]{6}|[0-9A-F]{3})$/i;
    return function (form, field, callback, opts) {
        if (re.test(field.data)) {
            callback();
        } else {
            callback(getMessagesFromOpts(opts).color);
        }
    };
};


exports.email = function () {
    // regular expression by Scott Gonzalez:
    // http://projects.scottsplayground.com/email_address_validation/
    return exports.regexp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i, getMessagesFromOpts({}).email);
};

exports.url = function (include_localhost) {
    // regular expression by Scott Gonzalez:
    // http://projects.scottsplayground.com/iri/
    var external_regex = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
        with_localhost_regex = /^(https?|ftp):\/\/(localhost|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
    return exports.regexp(include_localhost ? with_localhost_regex : external_regex, getMessagesFromOpts({}).url);
};

exports.date = function () {
    var numberRegex = /^[0-9]+$/,
        invalidDate = new Date('z');
    return function (form, field, callback, opts) {
        var parts = field.data ? field.data.split('-') : [],
            allNumbers = parts.every(function (part) { return numberRegex.test(part); }),
            date = allNumbers && parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : invalidDate;
        if (!isNaN(date.getTime())) {
            callback();
        } else {
            callback(getMessagesFromOpts(opts).date);
        }
    };
};

