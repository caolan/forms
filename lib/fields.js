/*jslint node: true */
'use strict';

var forms = require('./forms'),
    async = require('async'),
    htmlEscape = require('./htmlEscape'),
    coerceArray = function (arr) {
        return Array.isArray(arr) && arr.length > 0 ? arr : [];
    },
    copy = function (original) {
        return Object.keys(original).reduce(function (copy, key) {
            copy[key] = original[key];
            return copy;
        }, {});
    },
    underscoreRegExp = /_/g;


exports.string = function (opt) {
    if (!opt) { opt = {}; }

    var f = copy(opt);
    f.widget = f.widget || forms.widgets.text(opt.attrs || {});

    f.parse = function (raw_data) {
        if (typeof raw_data !== 'undefined' && raw_data !== null) {
            return String(raw_data);
        }
        return '';
    };
    f.bind = function (raw_data) {
        var b = copy(f); // clone field object:
        b.value = raw_data;
        b.data = b.parse(raw_data);
        b.validate = function (form, callback) {
            var forceValidation = (b.validators || []).some(function (validator) {
                return validator.forceValidation;
            });
            if (!forceValidation && (raw_data === '' || raw_data === null || typeof raw_data === 'undefined')) {
                // don't validate empty fields, but check if required
                if (b.required) { b.error = 'This field is required.'; }
                process.nextTick(function () { callback(null, b); });
            } else {
                async.forEachSeries(b.validators || [], function (v, callback) {
                    if (!b.error) {
                        v(form, b, function (v_err) {
                            b.error = v_err ? v_err.toString() : null;
                            callback(null);
                        });
                    } else {
                        callback(null);
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
        return this.error ? '<p class="' + htmlEscape(['error_msg'].concat(classes).join(' ')) + '">' + this.error + '</p>' : '';
    };
    f.labelText = function (name) {
        return this.label || (name ? name[0].toUpperCase() + name.substr(1).replace(underscoreRegExp, ' ') : '');
    };
    f.labelHTML = function (name, id) {
        if (this.widget.type === 'hidden') { return ''; }
        var forID = id || 'id_' + name;
        return forms.widgets.label({
            classes: typeof this.cssClasses !== 'undefined' ? coerceArray(this.cssClasses.label) : [],
            content: this.labelText(name, id)
        }).toHTML(forID, f);
    };
    f.classes = function () {
        var r = ['field'];
        if (this.error) { r.push('error'); }
        if (this.required) { r.push('required'); }
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
    if (!opt) { opt = {}; }
    var f = exports.string(opt);

    f.parse = function (raw_data) {
        if (raw_data === null || raw_data === '') {
            return NaN;
        }
        return Number(raw_data);
    };
    return f;
};

exports.boolean = function (opt) {
    if (!opt) { opt = {}; }
    var f = exports.string(opt);

    f.widget = opt.widget || forms.widgets.checkbox(opt.attrs || {});
    f.parse = function (raw_data) {
        return !!raw_data;
    };
    return f;
};

exports.email = function (opt) {
    var opts = opt ? copy(opt) : {};
    if (!opts.widget) { opts.widget = forms.widgets.email(opts.attrs || {}); }
    var f = exports.string(opts);
    if (f.validators) {
        f.validators.unshift(forms.validators.email());
    } else {
        f.validators = [forms.validators.email()];
    }
    return f;
};

exports.tel = function (opt) {
    var opts = opt ? copy(opt) : {};
    if (!opts.widget) { opts.widget = forms.widgets.tel(opts.attrs || {}); }
    return exports.string(opts);
};

exports.password = function (opt) {
    if (!opt) { opt = {}; }
    var f = exports.string(opt);
    f.widget = opt.widget || forms.widgets.password(opt.attrs || {});
    return f;
};

exports.url = function (opt) {
    if (!opt) { opt = {}; }
    var f = exports.string(opt);
    if (f.validators) {
        f.validators.unshift(forms.validators.url());
    } else {
        f.validators = [forms.validators.url()];
    }
    return f;
};

exports.array = function (opt) {
    if (!opt) { opt = {}; }
    var f = exports.string(opt);
    f.parse = function (raw_data) {
        if (typeof raw_data === 'undefined') { return []; }
        return Array.isArray(raw_data) ? raw_data : [raw_data];
    };
    return f;
};

exports.date = function (opt) {
    if (!opt) { opt = {}; }
    var f = exports.string(opt);
    if (f.validators) {
        f.validators.unshift(forms.validators.date());
    } else {
        f.validators = [forms.validators.date()];
    }
    return f;
};

exports.object = function (fields, opts) {
    return forms.create(fields || {});
};

