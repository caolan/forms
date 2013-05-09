/*jslint node: true */
'use strict';
var forms = require('../lib/forms');

exports.loadLocale = function (test) {
    test.equals(
        forms.loadLocale('lorem').min,
        'Lorem ipsum min %s.'
    );
    test.done();
};

exports.create = function (test) {
    var f = forms.create({
        field1: forms.fields.string(),
        field2: forms.fields.string()
    });
    test.equals(
        f.toHTML(),
        '<div class="field">' +
            '<label for="id_field1">Field1</label>' +
            '<input type="text" name="field1" id="id_field1" />' +
        '</div>' +
        '<div class="field">' +
            '<label for="id_field2">Field2</label>' +
            '<input type="text" name="field2" id="id_field2" />' +
        '</div>'
    );
    test.done();
};

