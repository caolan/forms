/*jslint node: true */

var wrapWith = function (tag) {
    return function (name, field) {
        var html = ['<' + tag + ' class="' + field.classes().join(' ') + '">'];
        if (field.widget.type === 'multipleCheckbox' || field.widget.type === 'multipleRadio') {
            html = html.concat([
                '<fieldset>',
                '<legend>', field.labelText(name), '</legend>',
                field.errorHTML(),
                field.widget.toHTML(name, field),
                '</fieldset>'
            ]);
        } else {
            html.push(field.errorHTML() + field.labelHTML(name, field.id) + field.widget.toHTML(name, field));
        }
        return html.join('') + '</' + tag + '>';
    };
};
exports.div = wrapWith('div');
exports.p = wrapWith('p');
exports.li = wrapWith('li');

exports.table = function (name, field) {
    return [
        '<tr class="', field.classes().join(' '), '">',
        '<th>', field.labelHTML(name), '</th>',
        '<td>',
        field.errorHTML(),
        field.widget.toHTML(name, field),
        '</td>',
        '</tr>'
    ].join('');
};
