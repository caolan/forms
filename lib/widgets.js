/*jslint node: true */
'use strict';

var is = require('is');
var tag = require('./tag');

// used to generate different input elements varying only by type attribute
var input = function (type) {
    var dataRegExp = /^data-[a-z]+([-][a-z]+)*$/,
        ariaRegExp = /^aria-[a-z]+$/,
        legalAttrs = ['autocomplete', 'autocorrect', 'autofocus', 'autosuggest', 'checked', 'dirname', 'disabled', 'tabindex', 'list', 'max', 'maxlength', 'min', 'multiple', 'novalidate', 'pattern', 'placeholder', 'readonly', 'required', 'size', 'step'],
        ignoreAttrs = ['id', 'name', 'class', 'classes', 'type', 'value'],
        getUserAttrs = function (opt) {
            return Object.keys(opt).reduce(function (attrs, k) {
                if ((ignoreAttrs.indexOf(k) === -1 && legalAttrs.indexOf(k) > -1) || dataRegExp.test(k) || ariaRegExp.test(k)) {
                    attrs[k] = opt[k];
                }
                return attrs;
            }, {});
        };
    return function (opt) {
        if (!opt) { opt = {}; }
        var userAttrs = getUserAttrs(opt);
        var w = {
            classes: opt.classes,
            type: type,
            formatValue: function (value) {
                return value || null;
            }
        };
        w.toHTML = function (name, f) {
            if (!f) { f = {}; }
            return tag('input', [{
                type: type,
                name: name,
                id: f.id || true,
                classes: w.classes,
                value: w.formatValue(f.value)
            }, userAttrs, w.attrs || {}]);
        };
        w.getDataRegExp = function () {
            return dataRegExp;
        };
        w.getAriaRegExp = function () {
            return ariaRegExp;
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
var passwordFormatValue = function (value) { return null; };
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

exports.checkbox = function (opt) {
    if (!opt) { opt = {}; }
    var w = {
        classes: opt.classes,
        type: 'checkbox'
    };
    w.toHTML = function (name, f) {
        if (!f) { f = {}; }
        return tag('input', [{
            type: 'checkbox',
            name: name,
            id: f.id || true,
            classes: w.classes,
            checked: !!f.value,
            value: 'on'
        }, w.attrs || {}]);
    };
    return w;
};

exports.select = function (opt) {
    if (!opt) { opt = {}; }
    var w = {
        classes: opt.classes,
        type: 'select'
    };
    w.toHTML = function (name, f) {
        if (!f) { f = {}; }
        var optionsHTML = Object.keys(f.choices).reduce(function (html, k) {
            return html + tag('option', {
                value: k,
                selected: !!(f.value && String(f.value) === String(k))
            }, f.choices[k]);
        }, '');
        return tag('select', [{
            name: name,
            id: f.id || true,
            classes: w.classes
        }, w.attrs || {}], optionsHTML);
    };
    return w;
};

exports.textarea = function (opt) {
    if (!opt) { opt = {}; }
    var w = {
        classes: opt.classes,
        type: 'textarea'
    };
    w.toHTML = function (name, f) {
        if (!f) { f = {}; }
        return tag('textarea', [{
            name: name,
            id: f.id || true,
            classes: w.classes,
            rows: opt.rows || null,
            cols: opt.cols || null,
            placeholder: opt.placeholder || null
        }, w.attrs || {}], f.value || '');
    };
    return w;
};

exports.multipleCheckbox = function (opt) {
    if (!opt) { opt = {}; }
    var w = {
        classes: opt.classes,
        labelClasses: opt.labelClasses,
        type: 'multipleCheckbox'
    };
    w.toHTML = function (name, f) {
        if (!f) { f = {}; }
        return Object.keys(f.choices).reduce(function (html, k) {
            // input element
            var id = f.id ? f.id + '_' + k : 'id_' + name + '_' + k;
            var checked = f.value && (Array.isArray(f.value) ? f.value.some(function (v) { return String(v) === String(k); }) : String(f.value) === String(k));

            html += tag('input', [{
                type: 'checkbox',
                name: name,
                id: id,
                classes: w.classes,
                value: k,
                checked: !!checked
            }, w.attrs || {}]);

            // label element
            html += tag('label', {'for': id, classes: w.labelClasses}, f.choices[k]);

            return html;
        }, '');
    };
    return w;
};

exports.label = function (opt) {
    if (!opt) { opt = {}; }
    var w = {
        classes: opt.classes || []
    };
    w.toHTML = function (forID, f) {
        return tag('label', [{
            for: forID,
            classes: w.classes
        }, w.attrs || {}], opt.content);
    };
    return w;
};

exports.multipleRadio = function (opt) {
    if (!opt) { opt = {}; }
    var w = {
        classes: opt.classes,
        labelClasses: opt.labelClasses,
        type: 'multipleRadio'
    };
    w.toHTML = function (name, f) {
        if (!f) { f = {}; }
        return Object.keys(f.choices).reduce(function (html, k) {
            // input element
            var id = f.id ? f.id + '_' + k : 'id_' + name + '_' + k;
            var checked = f.value && (Array.isArray(f.value) ? f.value.some(function (v) { return String(v) === String(k); }) : String(f.value) === String(k));

            html += tag('input', [{
                type: 'radio',
                name: name,
                id: id,
                classes: w.classes,
                value: k,
                checked: !!checked
            }, w.attrs || {}]);
            // label element
            html += tag('label', {'for': id, classes: w.labelClasses}, f.choices[k]);

            return html;
        }, '');
    };
    return w;
};

exports.multipleSelect = function (opt) {
    if (!opt) { opt = {}; }
    var w = {
        classes: opt.classes,
        type: 'multipleSelect'
    };
    w.toHTML = function (name, f) {
        if (!f) { f = {}; }
        var optionsHTML = Object.keys(f.choices).reduce(function (html, k) {
            var selected = f.value && (Array.isArray(f.value) ? f.value.some(function (v) { return String(v) === String(k); }) : String(f.value) === String(k));
            return html + tag('option', {
                value: k,
                selected: !!selected
            }, f.choices[k]);
        }, '');
        return tag('select', [{
            multiple: true,
            name: name,
            id: f.id || true,
            classes: w.classes
        }, w.attrs || {}], optionsHTML);
    };
    return w;
};
