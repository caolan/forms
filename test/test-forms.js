/*jslint node: true */
'use strict';
var forms = require('../lib/forms');
var test = require('tape');

test('create', function (t) {
    var f = forms.create({
        field1: forms.fields.string(),
        field2: forms.fields.string()
    });
    t.equals(
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
    t.end();
});

