'use strict';

var is = require('is');
var tag = require('./tag');

var dataRegExp = /^data-[a-z]+([-][a-z]+)*$/;
var ariaRegExp = /^aria-[a-z]+$/;
var legalAttrs = ['autocomplete', 'autocorrect', 'autofocus', 'autosuggest', 'checked', 'dirname', 'disabled', 'tabindex', 'list', 'max', 'maxlength', 'min', 'multiple', 'novalidate', 'pattern', 'placeholder', 'readonly', 'required', 'size', 'step'];
var ignoreAttrs = ['id', 'name', 'class', 'classes', 'type', 'value'];
var getUserAttrs = function (opt) {
    return Object.keys(opt).reduce(function (attrs, k) {
        if ((ignoreAttrs.indexOf(k) === -1 && legalAttrs.indexOf(k) > -1) || dataRegExp.test(k) || ariaRegExp.test(k)) {
            attrs[k] = opt[k];
        }
        return attrs;
    }, {});
};

// used to generate different input elements varying only by type attribute
var input = function (type) {
    return function (opts) {
        var opt = opts || {};
        var userAttrs = getUserAttrs(opt);
        var w = {
            classes: opt.classes,
            type: type,
            formatValue: function (value) {
                return (value || value === 0) ? value : null;
            }
        };
        w.toHTML = function (name, field) {
            var f = field || {};
            var attrs = {
                type: type,
                name: name,
                id: f.id === false ? false : (f.id || true),
                classes: w.classes,
                value: w.formatValue(f.value)
            };
            return tag('input', [attrs, userAttrs, w.attrs || {}]);
        };
        return w;
    };
};

exports.text = input('text');
exports.email = input('email');
exports.number = input('number');
exports.hidden = input('hidden');
exports.color = input('color');
exports.tel = input('tel');

var passwordWidget = input('password');
var passwordFormatValue = function () { return null; };
exports.password = function (opt) {
    var w = passwordWidget(opt);
    w.formatValue = passwordFormatValue;
    return w;
};

var dateWidget = input('date');
exports.date = function (opt) {
    var w = dateWidget(opt);
    w.formatValue = function (value) {
        if (!value) {
            return null;
        }

        var date = is.date(value) ? value : new Date(value);

        if (isNaN(date.getTime())) {
            return null;
        }

        return date.toISOString().slice(0, 10);
    };
    return w;
};

exports.checkbox = function (options) {
    var opt = options || {};
    var w = {
        classes: opt.classes,
        type: 'checkbox'
    };
    var userAttrs = getUserAttrs(opt);
    w.toHTML = function (name, field) {
        var f = field || {};
        var attrs = {
            type: 'checkbox',
            name: name,
            id: f.id === false ? false : (f.id || true),
            classes: w.classes,
            checked: !!f.value,
            value: 'on'
        };
        return tag('input', [attrs, userAttrs, w.attrs || {}]);
    };
    return w;
};

exports.select = function (options) {
    var opt = options || {};
    var w = {
        classes: opt.classes,
        type: 'select'
    };
    var userAttrs = getUserAttrs(opt);
    w.toHTML = function (name, field) {
        var f = field || {};
        var optionsHTML = Object.keys(f.choices).reduce(function (html, k) {
            return html + tag('option', {
                value: k,
                selected: !!(f.value && String(f.value) === String(k))
            }, f.choices[k]);
        }, '');
        var attrs = {
            name: name,
            id: f.id === false ? false : (f.id || true),
            classes: w.classes
        };
        return tag('select', [attrs, userAttrs, w.attrs || {}], optionsHTML);
    };
    return w;
};

exports.textarea = function (options) {
    var opt = options || {};
    var w = {
        classes: opt.classes,
        type: 'textarea'
    };
    var userAttrs = getUserAttrs(opt);
    w.toHTML = function (name, field) {
        var f = field || {};
        var attrs = {
            name: name,
            id: f.id === false ? false : (f.id || true),
            classes: w.classes,
            rows: opt.rows || null,
            cols: opt.cols || null
        };
        return tag('textarea', [attrs, userAttrs, w.attrs || {}], f.value || '');
    };
    return w;
};

exports.multipleCheckbox = function (options) {
    var opt = options || {};
    var w = {
        classes: opt.classes,
        labelClasses: opt.labelClasses,
        type: 'multipleCheckbox'
    };
    var userAttrs = getUserAttrs(opt);
    w.toHTML = function (name, field) {
        var f = field || {};
        return Object.keys(f.choices).reduce(function (html, k) {
            // input element
            var id = f.id === false ? false : (f.id ? f.id + '_' + k : 'id_' + name + '_' + k);
            var checked = f.value && (Array.isArray(f.value) ? f.value.some(function (v) { return String(v) === String(k); }) : String(f.value) === String(k));

            var attrs = {
                type: 'checkbox',
                name: name,
                id: id,
                classes: w.classes,
                value: k,
                checked: !!checked
            };
            var inputHTML = tag('input', [attrs, userAttrs, w.attrs || {}]);

            // label element
            var labelHTML = tag('label', { 'for': id, classes: w.labelClasses }, f.choices[k]);

            return html + inputHTML + labelHTML;
        }, '');
    };
    return w;
};

exports.label = function (options) {
    var opt = options || {};
    var w = { classes: opt.classes || [] };
    var userAttrs = getUserAttrs(opt);
    w.toHTML = function (forID) {
        var attrs = {
            'for': forID,
            classes: w.classes
        };
        return tag('label', [attrs, userAttrs, w.attrs || {}], opt.content);
    };
    return w;
};

exports.multipleRadio = function (options) {
    var opt = options || {};
    var w = {
        classes: opt.classes,
        labelClasses: opt.labelClasses,
        type: 'multipleRadio'
    };
    var userAttrs = getUserAttrs(opt);
    w.toHTML = function (name, field) {
        var f = field || {};
        return Object.keys(f.choices).reduce(function (html, k) {
            // input element
            var id = f.id === false ? false : (f.id ? f.id + '_' + k : 'id_' + name + '_' + k);
            var checked = f.value && (Array.isArray(f.value) ? f.value.some(function (v) { return String(v) === String(k); }) : String(f.value) === String(k));
            var attrs = {
                type: 'radio',
                name: name,
                id: id,
                classes: w.classes,
                value: k,
                checked: !!checked
            };
            var inputHTML = tag('input', [attrs, userAttrs, w.attrs || {}]);
            // label element
            var labelHTML = tag('label', { 'for': id, classes: w.labelClasses }, f.choices[k]);

            return html + inputHTML + labelHTML;
        }, '');
    };
    return w;
};

exports.multipleSelect = function (options) {
    var opt = options || {};
    var w = {
        classes: opt.classes,
        type: 'multipleSelect'
    };
    var userAttrs = getUserAttrs(opt);
    w.toHTML = function (name, field) {
        var f = field || {};
        var optionsHTML = Object.keys(f.choices).reduce(function (html, k) {
            var selected = f.value && (Array.isArray(f.value) ? f.value.some(function (v) { return String(v) === String(k); }) : String(f.value) === String(k));
            return html + tag('option', {
                value: k,
                selected: !!selected
            }, f.choices[k]);
        }, '');
        var attrs = {
            multiple: true,
            name: name,
            id: f.id === false ? false : (f.id || true),
            classes: w.classes
        };
        return tag('select', [attrs, userAttrs, w.attrs || {}], optionsHTML);
    };
    return w;
};
