/*jslint node: true */

// generates a string for common widget attributes
var attrs = function (a) {
    var html = ' name="' + a.name + '"';
    html += ' id=' + (a.id ? '"' + a.id + '"' : '"id_' + a.name + '"');
    html += a.classes.length > 0 ? ' class="' + a.classes.join(' ') + '"' : '';
    return html;
};

// used to generate different input elements varying only by type attribute
var input = function (type) {
    return function (opt) {
        opt = opt || {};
        var w = {};
        var legalOpts = ['autocomplete', 'dirname', 'list', 'readonly', 'size', 'required', 'multiple', 'maxlength', 'pattern', 'min', 'max', 'placeholder', 'step'];
        var ignoreOpts = ['id', 'name', 'class', 'classes'];
        w.classes = opt.classes || [];
        w.type = type;
        w.toHTML = function (name, f) {
            f = f || {};
            var html = '<input';
            html += ' type="' + type + '"';
            html += attrs({name: name, id: f.id, classes: w.classes});
            html += f.value ? ' value="' + f.value + '"' : '';
            html += Object.keys(opt).reduce(function (html, k) {
                if (ignoreOpts.indexOf(k) === -1) {
                    if (legalOpts.indexOf(k) !== -1 ||
                        (/data-[a-z]/.test(k)) ||
                        (/aria-[a-z]/.test(k)))
                    {
                        return html + ' ' + k + '="' + opt[k].replace(/\"/g, '&quot;') + '"';
                    }
                }

                return html;
            }, '');
            return html + ' />';
        };
        return w;
    };
};

exports.text = input('text');
exports.password = input('password');
exports.hidden = input('hidden');

exports.checkbox = function (opt) {
    opt = opt || {};
    var w = {};
    w.classes = opt.classes || [];
    w.type = 'checkbox';
    w.toHTML = function (name, f) {
        f = f || {};
        var html = '<input type="checkbox"';
        html += attrs({name: name, id: f.id, classes: w.classes});
        html += f.value ? ' checked="checked"' : '';
        return html + ' />';
    };
    return w;
};

exports.select = function (opt) {
    opt = opt || {};
    var w = {};
    w.classes = opt.classes || [];
    w.type = 'select';
    w.toHTML = function (name, f) {
        f = f || {};
        var html = '<select' + attrs({
            name: name,
            id: f.id,
            classes: w.classes
        }) + '>';
        html += Object.keys(f.choices).reduce(function (html, k) {
            return html + '<option value="' + k + '"' + ((f.value && f.value === k) ? ' selected="selected"' : '') + '>' + f.choices[k] + '</option>';
        }, '');
        return html + '</select>';
    };
    return w;
};

exports.textarea = function (opt) {
    opt = opt || {};
    var w = {};
    w.classes = opt.classes || [];
    w.type = 'textarea';
    w.toHTML = function (name, f) {
        f = f || {};
        var html = ['<textarea' + attrs({
                name: name,
                id: f.id,
                classes: w.classes
            })];
        html.push(opt.rows ? ' rows="' + opt.rows + '"' : '');
        html.push(opt.cols ? ' cols="' + opt.cols + '"' : '');
        html.push('>');
        html.push(f.value || '');
        return html.join('') + '</textarea>';
    };
    return w;
};

exports.multipleCheckbox = function (opt) {
    opt = opt || {};
    var w = {};
    w.classes = opt.classes || [];
    w.type = 'multipleCheckbox';
    w.toHTML = function (name, f) {
        f = f || {};
        return Object.keys(f.choices).reduce(function (html, k) {
            // input element
            html += '<input type="checkbox"';
            html += ' name="' + name + '"';

            var id = f.id ? f.id + '_' + k : 'id_' + name + '_' + k;
            html += ' id="' + id + '"';

            if (w.classes.length) {
                html += ' class="' + w.classes.join(' ') + '"';
            }

            html += ' value="' + k + '"';

            if (Array.isArray(f.value)) {
                if (f.value.some(function (v) { return v === k; })) {
                    html += ' checked="checked"';
                }
            } else {
                html += f.value === k ? ' checked="checked"' : '';
            }

            html += '>';

            // label element
            html += '<label for="' + id + '">' + f.choices[k] + '</label>';

            return html;
        }, '');
    };
    return w;
};

exports.multipleRadio = function (opt) {
    opt = opt || {};
    var w = {};
    w.classes = opt.classes || [];
    w.type = 'multipleRadio';
    w.toHTML = function (name, f) {
        f = f || {};
        return Object.keys(f.choices).reduce(function (html, k) {
            // input element
            html += '<input type="radio"';
            html += ' name="' + name + '"';

            var id = f.id ? f.id + '_' + k : 'id_' + name + '_' + k;
            html += ' id="' + id + '"';

            if (w.classes.length) {
                html += ' class="' + w.classes.join(' ') + '"';
            }

            html += ' value="' + k + '"';

            if (Array.isArray(f.value)) {
                if (f.value.some(function (v) { return v === k; })) {
                    html += ' checked="checked"';
                }
            } else {
                html += f.value === k ? ' checked="checked"' : '';
            }

            html += '>';

            // label element
            html += '<label for="' + id + '">' + f.choices[k] + '</label>';

            return html;
        }, '');
    };
    return w;
};

exports.multipleSelect = function (opt) {
    opt = opt || {};
    var w = {};
    w.classes = opt.classes || [];
    w.type = 'multipleSelect';
    w.toHTML = function (name, f) {
        f = f || {};
        var html = '<select multiple="mulitple"' + attrs({
            name: name,
            id: f.id,
            classes: w.classes
        }) + '>';
        html += Object.keys(f.choices).reduce(function (html, k) {
            html += '<option value="' + k + '"';
            if (Array.isArray(f.value)) {
                if (f.value.some(function (v) { return v === k; })) {
                    html += ' selected="selected"';
                }
            } else if (f.value && f.value === k) {
                html += ' selected="selected"';
            }
            html += '>' + f.choices[k] + '</option>';
            return html;
        }, '');
        return html + '</select>';
    };
    return w;
};
