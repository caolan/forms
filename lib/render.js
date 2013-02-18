/*jslint node: true */
'use strict';

var htmlEscape = require('./htmlEscape');
var wrapWith = function (tag) {
    return function (name, field, opt) {
        if (!opt) { opt = {}; }
        var html = ['<' + tag + ' class="' + htmlEscape(field.classes().join(' ')) + '">'],
            errorHTML = field.errorHTML();
        if (field.widget.type === 'multipleCheckbox' || field.widget.type === 'multipleRadio') {
            html = html.concat([
                '<fieldset>',
                '<legend>', field.labelText(name), '</legend>',
                opt.errorAfterField ? '' : errorHTML,
                field.widget.toHTML(name, field),
                opt.errorAfterField ? errorHTML : '',
                '</fieldset>'
            ]);
        } else {
            html = html.concat([
                opt.errorAfterField ? '' : errorHTML,
                field.labelHTML(name, field.id),
                field.widget.toHTML(name, field),
                opt.errorAfterField ? errorHTML : '',
            ]);
        }
        return html.join('') + '</' + tag + '>';
    };
};
exports.div = wrapWith('div');
exports.p = wrapWith('p');
exports.li = wrapWith('li');

exports.table = function (name, field, opt) {
    if (!opt) { opt = {}; }
    var errorHTML = field.errorHTML();
    return [
        '<tr class="', htmlEscape(field.classes().join(' ')), '">',
        '<th>', field.labelHTML(name, field.id), '</th>',
        '<td>',
        opt.errorAfterField ? '' : errorHTML,
        field.widget.toHTML(name, field),
        opt.errorAfterField ? errorHTML : '',
        '</td>',
        '</tr>'
    ].join('');
};

