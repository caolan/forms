'use strict';

var is = require('is');
var keys = require('object-keys');
var tag = require('./tag');

var dataRegExp = /^data-[a-z]+([-][a-z]+)*$/;
var ariaRegExp = /^aria-[a-z]+$/;
var legalAttrs = ['autocomplete', 'autocorrect', 'autofocus', 'autosuggest', 'checked', 'dirname', 'disabled', 'tabindex', 'list', 'max', 'maxlength', 'min', 'novalidate', 'pattern', 'placeholder', 'readonly', 'required', 'size', 'step'];
var ignoreAttrs = ['id', 'name', 'class', 'classes', 'type', 'value', 'multiple'];
var getUserAttrs = function (opt) {
    return keys(opt).reduce(function (attrs, k) {
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

var choiceValueEquals = function (value1, value2) {
    return !is.array(value1) && !is.array(value2) && String(value1) === String(value2);
};

var isSelected = function (value, choice) {
    return value && (is.array(value) ? value.some(choiceValueEquals.bind(null, choice)) : choiceValueEquals(value, choice));
};

var renderChoices = function (choices, renderer) {
    return choices.reduce(function (partialRendered, choice) {
        var isNested = is.array(choice[1]);
        var renderData = isNested ?
            { isNested: true, label: choice[0], choices: choice[1] } :
            { isNested: false, value: choice[0], label: choice[1] };
        return partialRendered + renderer(renderData);
    }, '');
};

var isScalar = function (value) {
    return !value || is.string(value) || is.number(value) || is.bool(value);
};

var unifyChoices = function (choices, nestingLevel) {
    if (nestingLevel < 0) {
        throw new RangeError('choices nested too deep');
    }

    var unifyChoiceArray = function (arrayChoices, currentLevel) {
        return arrayChoices.reduce(function (result, choice) {
            if (!is.array(choice) || choice.length !== 2) {
                throw new TypeError('choice must be array with two elements');
            }
            if (isScalar(choice[0]) && isScalar(choice[1])) {
                result.push(choice);
            } else if (isScalar(choice[0]) && (is.array(choice[1]) || is.object(choice[1]))) {
                result.push([choice[0], unifyChoices(choice[1], currentLevel - 1)]);
            } else {
                throw new TypeError('expected primitive value as first and primitive value, object, or array as second element');
            }
            return result;
        }, []);
    };

    var unifyChoiceObject = function (objectChoices, currentLevel) {
        return keys(objectChoices).reduce(function (result, key) {
            var label = objectChoices[key];
            if (isScalar(label)) {
                result.push([key, label]);
            } else if (is.array(label) || is.object(label)) {
                result.push([key, unifyChoices(label, currentLevel - 1)]);
            } else {
                throw new TypeError('expected primitive value, object, or array as object value');
            }
            return result;
        }, []);
    };

    return is.array(choices) ? unifyChoiceArray(choices, nestingLevel) : unifyChoiceObject(choices, nestingLevel);
};

var select = function (isMultiple) {
    return function (options) {
        var opt = options || {};
        var w = {
            classes: opt.classes,
            type: isMultiple ? 'multipleSelect' : 'select'
        };
        var userAttrs = getUserAttrs(opt);
        w.toHTML = function (name, field) {
            var f = field || {};
            var choices = unifyChoices(f.choices, 1);
            var optionsHTML = renderChoices(choices, function render(choice) {
                if (choice.isNested) {
                    return tag('optgroup', { label: choice.label }, renderChoices(choice.choices, render), true);
                } else {
                    return tag('option', { value: choice.value, selected: !!isSelected(f.value, choice.value) }, choice.label);
                }
            });
            var attrs = {
                name: name,
                id: f.id === false ? false : (f.id || true),
                classes: w.classes
            };
            if (isMultiple) {
                attrs.multiple = true;
            }
            return tag('select', [attrs, userAttrs, w.attrs || {}], optionsHTML, true);
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

exports.select = select(false);
exports.multipleSelect = select(true);

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
        var choices = unifyChoices(f.choices, 0);
        return renderChoices(choices, function (choice) {
            // input element
            var id = f.id === false ? false : (f.id ? f.id + '_' + choice.value : 'id_' + name + '_' + choice.value);
            var checked = isSelected(f.value, choice.value);

            var attrs = {
                type: 'checkbox',
                name: name,
                id: id,
                classes: w.classes,
                value: choice.value,
                checked: !!checked
            };
            var inputHTML = tag('input', [attrs, userAttrs, w.attrs || {}]);

            // label element
            var labelHTML = tag('label', { 'for': id, classes: w.labelClasses }, choice.label);

            return inputHTML + labelHTML;
        });
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
        var choices = unifyChoices(f.choices, 0);
        return renderChoices(choices, function (choice) {
            // input element
            var id = f.id === false ? false : (f.id ? f.id + '_' + choice.value : 'id_' + name + '_' + choice.value);
            var checked = isSelected(f.value, choice.value);
            var attrs = {
                type: 'radio',
                name: name,
                id: id,
                classes: w.classes,
                value: choice.value,
                checked: !!checked
            };
            var inputHTML = tag('input', [attrs, userAttrs, w.attrs || {}]);
            // label element
            var labelHTML = tag('label', { 'for': id, classes: w.labelClasses }, choice.label);

            return inputHTML + labelHTML;
        });
    };
    return w;
};
