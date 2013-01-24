/*jslint node: true */

var forms = require('./forms'),
    async = require('async'),
	copy = function (original) {
		return Object.keys(original).reduce(function (copy, key) {
			copy[key] = original[key];
			return copy;
		}, {});
	};


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
            if (raw_data === '' || raw_data === null || typeof raw_data === 'undefined') {
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
        return this.error ? '<p class="error_msg">' + this.error + '</p>' : '';
    };
    f.labelText = function (name) {
        return this.label || name[0].toUpperCase() + name.substr(1).replace('_', ' ');
    };
    f.labelHTML = function (name, id) {
        if (this.widget.type === 'hidden') { return ''; }
        var label = '<label for="' + (id || 'id_' + name) + '"';
        if (typeof this.cssClasses !== 'undefined' && Array.isArray(this.cssClasses.label) && this.cssClasses.label.length > 0) {
            label += ' class="' + this.cssClasses.label.join(' ') + '"';
        }
        label += '>' + this.labelText(name, id) + '</label>'
        return label;
    };
    f.classes = function () {
        var r = ['field'];
        if (this.error) { r.push('error'); }
        if (this.required) { r.push('required'); }
        if (typeof this.cssClasses !== 'undefined' && Array.isArray(this.cssClasses.field) && this.cssClasses.field.length > 0) {
            r = r.concat(this.cssClasses.field);
        }
        return r;
    };
    f.toHTML = function (name, iterator) {
        return (iterator || forms.render.div)(name || this.name, this);
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
    if (!opt) { opt = {}; }
    var f = exports.string(opt);
    if (f.validators) {
        f.validators.unshift(forms.validators.email());
    } else {
        f.validators = [forms.validators.email()];
    }
    return f;
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
