'use strict';

var util = require('util');
var is = require('is');
var trim = require('string.prototype.trim');

var format = function format(message) {
    if (arguments.length < 2 || message.lastIndexOf('%s') >= 0) {
        return util.format.apply(null, [message].concat(Array.prototype.slice.call(arguments, 1)));
    } else {
        return message;
    }
};

var formatFieldName = function formatFieldName(field) {
    var defaultFieldName = 'This field';

    // in regular use, labelText is a defined function, but it's not when running tests.
    if (typeof field.labelText === 'function') {
        return field.name ? field.labelText(field.name) : defaultFieldName;
    } else {
        return field.name || defaultFieldName;
    }
};

exports.matchField = function (match_field, message) {
    var msg = message || 'Does not match %s.';
    return function (form, field, callback) {
        if (form.fields[match_field].data !== field.data) {
            callback(format(msg, match_field));
        } else {
            callback();
        }
    };
};

exports.matchValue = function (valueGetter, message) {
    if (!is.fn(valueGetter)) {
        throw new TypeError('valueGetter must be a function');
    }
    var msg = message || '%s does not match expected value: "%s"';
    return function (form, field, callback) {
        var expected = valueGetter();
        if (field.data !== expected) {
            callback(format(msg, formatFieldName(field), expected));
        } else {
            callback();
        }
    };
};

exports.required = function (message) {
    var msg = message || '%s is required.';
    return function (form, field, callback) {
        if (trim(field.data || '').length === 0) {
            callback(format(msg, formatFieldName(field)));
        } else {
            callback();
        }
    };
};

exports.requiresFieldIfEmpty = function (alternate_field, message) {
    var msg = message || 'One of %s or %s is required.';
    var validator = function (form, field, callback) {
        var alternateBlank = trim(form.fields[alternate_field].data || '').length === 0;
        var fieldBlank = trim(field.data || '').length === 0;
        if (alternateBlank && fieldBlank) {
            callback(format(msg, formatFieldName(field), alternate_field));
        } else {
            callback();
        }
    };
    validator.forceValidation = true;
    return validator;
};

exports.min = function (val, message) {
    var msg = message || 'Please enter a value greater than or equal to %s.';
    return function (form, field, callback) {
        if (field.data >= val) {
            callback();
        } else {
            callback(format(msg, val));
        }
    };
};

exports.max = function (val, message) {
    var msg = message || 'Please enter a value less than or equal to %s.';
    return function (form, field, callback) {
        if (field.data <= val) {
            callback();
        } else {
            callback(format(msg, val));
        }
    };
};

exports.range = function (min, max, message) {
    var msg = message || 'Please enter a value between %s and %s.';
    return function (form, field, callback) {
        if (field.data >= min && field.data <= max) {
            callback();
        } else {
            callback(format(msg, min, max));
        }
    };
};

exports.minlength = function (val, message) {
    var msg = message || 'Please enter at least %s characters.';
    return function (form, field, callback) {
        if (field.data.length >= val) {
            callback();
        } else {
            callback(format(msg, val));
        }
    };
};

exports.maxlength = function (val, message) {
    var msg = message || 'Please enter no more than %s characters.';
    return function (form, field, callback) {
        if (field.data.length <= val) {
            callback();
        } else {
            callback(format(msg, val));
        }
    };
};

exports.rangelength = function (min, max, message) {
    var msg = message || 'Please enter a value between %s and %s characters long.';
    return function (form, field, callback) {
        if (field.data.length >= min && field.data.length <= max) {
            callback();
        } else {
            callback(format(msg, min, max));
        }
    };
};

exports.regexp = function (regex, message) {
    var msg = message || 'Invalid format.';
    var re = new RegExp(regex);
    return function (form, field, callback) {
        if (re.test(field.data)) {
            callback();
        } else {
            callback(msg);
        }
    };
};

exports.color = function (message) {
    var msg = message || 'Inputs of type "color" require hex notation, e.g. #FFF or #ABC123.';
    var re = /^#([0-9A-F]{8}|[0-9A-F]{6}|[0-9A-F]{3})$/i;
    return function (form, field, callback) {
        if (re.test(field.data)) {
            callback();
        } else {
            callback(msg);
        }
    };
};

exports.email = function (message) {
    var msg = message || 'Please enter a valid email address.';
    // regular expression by Scott Gonzalez:
    // http://projects.scottsplayground.com/email_address_validation/
    // eslint-disable-next-line no-control-regex, no-useless-escape
    return exports.regexp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i, msg);
};

exports.url = function (include_localhost, message) {
    var msg = message || 'Please enter a valid URL.';
    // regular expression by Scott Gonzalez:
    // http://projects.scottsplayground.com/iri/
    // eslint-disable-next-line no-control-regex, no-useless-escape
    var external_regex = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
    // eslint-disable-next-line no-useless-escape
    var with_localhost_regex = /^(https?|ftp):\/\/(localhost|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
    return exports.regexp(include_localhost ? with_localhost_regex : external_regex, msg);
};

exports.date = function (message) {
    var msg = message || 'Inputs of type "date" must be valid dates in the format "yyyy-mm-dd"';
    var numberRegex = /^[0-9]+$/,
        invalidDate = new Date('z');
    return function (form, field, callback) {
        var parts = field.data ? field.data.split('-') : [];
        var allNumbers = parts.every(function (part) { return numberRegex.test(part); });
        var date = allNumbers && parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : invalidDate;
        if (!isNaN(date.getTime())) {
            callback();
        } else {
            callback(msg);
        }
    };
};

exports.alphanumeric = function (message) {
    return exports.regexp(/^[a-zA-Z0-9]*$/, message || 'Letters and numbers only.');
};

exports.digits = function (message) {
    return exports.regexp(/^\d+$/, message || 'Numbers only.');
};

exports.integer = function (message) {
    return exports.regexp(/^-?\d+$/, message || 'Please enter an integer value.');
};
