'use strict';

var tag = require('./tag');
var wrapWith = function (tagName) {
    return function (name, field, options) {
        var opt = options || {};
        var wrappedContent = [];
        var errorHTML = opt.hideError ? '' : field.errorHTML();
        if (field.widget.type === 'multipleCheckbox' || field.widget.type === 'multipleRadio') {
            var fieldsetAttrs = { classes: [] };
            if (opt.fieldsetClasses) {
                fieldsetAttrs.classes = fieldsetAttrs.classes.concat(opt.fieldsetClasses);
            }
            var legendAttrs = { classes: [] };
            if (opt.legendClasses) {
                legendAttrs.classes = legendAttrs.classes.concat(opt.legendClasses);
            }

            var fieldset = tag('fieldset', fieldsetAttrs, [
                tag('legend', legendAttrs, field.labelText(name)),
                opt.errorAfterField ? '' : errorHTML,
                field.widget.toHTML(name, field),
                opt.errorAfterField ? errorHTML : ''
            ].join(''), true);
            wrappedContent.push(fieldset);
        } else {
            var fieldHTMLs = [field.labelHTML(name, field.id), field.widget.toHTML(name, field)];
            if (opt.labelAfterField) {
                fieldHTMLs.reverse();
            }
            if (opt.errorAfterField) {
                fieldHTMLs.push(errorHTML);
            } else {
                fieldHTMLs.unshift(errorHTML);
            }
            wrappedContent = wrappedContent.concat(fieldHTMLs);
        }
        return tag(tagName, { classes: field.classes() }, wrappedContent.join(''), true);
    };
};
exports.div = wrapWith('div');
exports.p = wrapWith('p');
exports.li = wrapWith('li');

exports.table = function (name, field, options) {
    var opt = options || {};

    var th = tag('th', {}, field.labelHTML(name, field.id), true);

    var tdContent = field.widget.toHTML(name, field);

    if (!opt.hideError) {
        var errorHTML = field.errorHTML();
        if (opt.errorAfterField) {
            tdContent += errorHTML;
        } else {
            tdContent = errorHTML + tdContent;
        }
    }

    var td = tag('td', {}, tdContent, true);

    return tag('tr', { classes: field.classes() }, th + td, true);
};
