'use strict';

var is = require('is');
var some = require('array.prototype.some');
var async = require('async');
var assign = require('object.assign');

var forms = require('./forms');
var tag = require('./tag');
var validators = require('./validators');

var coerceArray = function (arr) {
    return is.array(arr) && arr.length > 0 ? arr : [];
};
var nameSeparatorRegExp = /[_-]/g;

exports.string = function (options) {
    var opt = options || {};

    var f = assign({}, opt);
    f.widget = f.widget || forms.widgets.text(opt.attrs || {});

    f.parse = function (raw_data) {
        if (typeof raw_data !== 'undefined' && raw_data !== null) {
            return String(raw_data);
        }
        return '';
    };
    f.bind = function (raw_data) {
        var b = assign({}, f); // clone field object:
        b.value = raw_data;
        b.data = b.parse(raw_data);
        b.validate = function (form, callback) {
            var forceValidation = some(b.validators || [], function (validator) {
                return validator.forceValidation;
            });
            if (!forceValidation && (raw_data === '' || raw_data === null || typeof raw_data === 'undefined')) {
                // don't validate empty fields, but check if required
                if (b.required) {
                    var validator = is.fn(b.required) ? b.required : validators.required();
                    validator(form, b, function (v_err) {
                        b.error = v_err ? String(v_err) : null;
                        callback(v_err, b);
                    });
                } else {
                    process.nextTick(function () {
                        callback(null, b);
                    });
                }
            } else {
                async.forEachSeries(b.validators || [], function (v, asyncCallback) {
                    if (!b.error) {
                        v(form, b, function (v_err) {
                            b.error = v_err ? String(v_err) : null;
                            asyncCallback(null);
                        });
                    } else {
                        asyncCallback(null);
                    }
                }, function (err) {
                    callback(err, b);
                });
            }
        };
        return b;
    };
    f.errorHTML = function () {
        var classes = typeof this.cssClasses !== 'undefined' ? coerceArray(this.cssClasses.error) : [];
        return this.error ? tag('p', { classes: ['error_msg'].concat(classes) }, this.error) : '';
    };
    f.labelText = function (name) {
        var text = this.label;
        if (!text && name) {
            text = name.charAt(0).toUpperCase() + name.slice(1).replace(nameSeparatorRegExp, ' ').replace(/([a-z])([A-Z])/g, function (match, firstLetter, secondLetter) {
                return firstLetter + ' ' + secondLetter.toLowerCase();
            });
        }
        return text || '';
    };
    f.labelHTML = function (name, id) {
        if (this.widget.type === 'hidden') {
            return '';
        }
        var forID = id === false ? false : id || 'id_' + name;
        return forms.widgets.label({
            classes: typeof this.cssClasses !== 'undefined' ? coerceArray(this.cssClasses.label) : [],
            content: this.labelText(name, id)
        }).toHTML(forID, f);
    };
    f.classes = function () {
        var r = ['field'];
        if (this.error) {
            r.push('error');
        }
        if (this.required) {
            r.push('required');
        }
        if (typeof this.cssClasses !== 'undefined') {
            r = r.concat(coerceArray(this.cssClasses.field));
        }
        return r;
    };
    f.toHTML = function (name, iterator) {
        return (iterator || forms.render.div)(name || this.name, this, opt);
    };

    return f;
};

exports.number = function (opt) {
    var opts = assign({}, opt);
    var f = exports.string(opts);

    f.parse = function (raw_data) {
        if (raw_data === null || raw_data === '') {
            return NaN;
        }
        return Number(raw_data);
    };
    return f;
};

exports['boolean'] = function (opt) {
    var opts = assign({}, opt);
    var f = exports.string(opts);

    f.widget = opts.widget || forms.widgets.checkbox(opts.attrs || {});
    f.parse = function (raw_data) {
        return !!raw_data;
    };
    return f;
};

exports.email = function (opt) {
    var opts = assign({}, opt);
    if (!opts.widget) {
        opts.widget = forms.widgets.email(opts.attrs || {});
    }
    var f = exports.string(opts);
    if (f.validators) {
        f.validators.unshift(forms.validators.email());
    } else {
        f.validators = [forms.validators.email()];
    }
    return f;
};

exports.tel = function (opt) {
    var opts = assign({}, opt);
    if (!opts.widget) {
        opts.widget = forms.widgets.tel(opts.attrs || {});
    }
    return exports.string(opts);
};

exports.password = function (opt) {
    var opts = assign({}, opt);
    var f = exports.string(opts);
    f.widget = opts.widget || forms.widgets.password(opts.attrs || {});
    return f;
};

exports.url = function (opt) {
    var opts = assign({}, opt);
    var f = exports.string(opts);
    if (f.validators) {
        f.validators.unshift(forms.validators.url());
    } else {
        f.validators = [forms.validators.url()];
    }
    return f;
};

exports.array = function (opt) {
    var opts = assign({}, opt);
    var f = exports.string(opts);
    f.parse = function (raw_data) {
        if (typeof raw_data === 'undefined') {
            return [];
        }
        return is.array(raw_data) ? raw_data : [raw_data];
    };
    return f;
};

exports.date = function (opt) {
    var opts = assign({}, opt);
    var f = exports.string(opts);
    if (f.validators) {
        f.validators.unshift(forms.validators.date());
    } else {
        f.validators = [forms.validators.date()];
    }
    return f;
};

exports.object = function (fields, opts) {
    return forms.create(fields || {}, opts);
};
