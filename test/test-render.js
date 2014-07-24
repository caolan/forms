/*jslint node: true */
'use strict';
var forms = require('../lib/forms');
var test = require('tape');

var testWrap = function (tag) {
    test(tag, function (t) {
        var f = forms.create({fieldname: forms.fields.string()});
        t.equal(
            f.toHTML(forms.render[tag]),
            '<' + tag + ' class="field">' +
                '<label for="id_fieldname">Fieldname</label>' +
                '<input type="text" name="fieldname" id="id_fieldname" />' +
            '</' + tag + '>'
        );
        t.end();
    });

    test(tag + ' required', function (t) {
        var f = forms.create({
            fieldname: forms.fields.string({required: true})
        });
        t.equal(
            f.toHTML(forms.render[tag]),
            '<' + tag + ' class="field required">' +
                '<label for="id_fieldname">Fieldname</label>' +
                '<input type="text" name="fieldname" id="id_fieldname" />' +
            '</' + tag + '>'
        );
        t.end();
    });

    test(tag + ' bound', function (t) {
        t.plan(1);
        var f = forms.create({name: forms.fields.string()});
        f.bind({name: 'val'}).validate(function (err, f) {
            t.equal(
                f.toHTML(forms.render[tag]),
                '<' + tag + ' class="field">' +
                    '<label for="id_name">Name</label>' +
                    '<input type="text" name="name" id="id_name" value="val" />' +
                '</' + tag + '>'
            );
            t.end();
        });
    });

    test(tag + ' bound error', function (t) {
        t.plan(4);
        var f = forms.create({
            field_name: forms.fields.string({
                validators: [function (form, field, callback) {
                    callback('validation error');
                }]
            }),
            field_name_error_after: forms.fields.string({
                errorAfterField: true,
                validators: [function (form, field, callback) {
                    callback('validation error after field');
                }]
            })
        });
        f.bind({field_name: 'val', field_name_error_after: 'foo'}).validate(function (err, f) {
            t.equal(
                f.toHTML(forms.render[tag]),
                '<' + tag + ' class="field error">' +
                    '<p class="error_msg">validation error</p>' +
                    '<label for="id_field_name">Field name</label>' +
                    '<input type="text" name="field_name" id="id_field_name" value="val" />' +
                '</' + tag + '>' +
                '<' + tag + ' class="field error">' +
                    '<label for="id_field_name_error_after">Field name error after</label>' +
                    '<input type="text" name="field_name_error_after" id="id_field_name_error_after" value="foo" />' +
                    '<p class="error_msg">validation error after field</p>' +
                '</' + tag + '>'
            );
        });

        // Error rendering disabled
        var f = forms.create({
            field_name: forms.fields.string({
                hideError: true,
                validators: [function (form, field, callback) {
                    callback('validation error');
                }]
            }),
            field_name_error_after: forms.fields.string({
                hideError: true,
                errorAfterField: true,
                validators: [function (form, field, callback) {
                    callback('validation error after field');
                }]
            })
        });
        f.bind({field_name: 'val', field_name_error_after: 'foo'}).validate(function (err, f) {
            t.equal(
                f.toHTML(forms.render[tag]),
                '<' + tag + ' class="field error">' +
                    '<label for="id_field_name">Field name</label>' +
                    '<input type="text" name="field_name" id="id_field_name" value="val" />' +
                '</' + tag + '>' +
                '<' + tag + ' class="field error">' +
                    '<label for="id_field_name_error_after">Field name error after</label>' +
                    '<input type="text" name="field_name_error_after" id="id_field_name_error_after" value="foo" />' +
                '</' + tag + '>'
            );

            t.equal(f.fields.field_name.errorHTML(),
                '<p class="error_msg">validation error</p>'
            );

            t.equal(f.fields.field_name_error_after.errorHTML(),
                '<p class="error_msg">validation error after field</p>'
            );
        });

        t.end();
    });

    test(tag + ' multipleCheckbox', function (t) {
        var f = forms.create({
            fieldname: forms.fields.string({
                choices: {one: 'item one'},
                widget: forms.widgets.multipleCheckbox(),
                legendClasses: ['test1', 'test2'],
                fieldsetClasses: ['test3', 'test4']
            })
        });
        t.equal(
            f.toHTML(forms.render[tag]),
            '<' + tag + ' class="field">' +
                '<fieldset class="test3 test4">' +
                    '<legend class="test1 test2">Fieldname</legend>' +
                    '<input type="checkbox" name="fieldname" id="id_fieldname_one" value="one" />' +
                    '<label for="id_fieldname_one">item one</label>' +
                '</fieldset>' +
            '</' + tag + '>'
        );
        t.end();
    });

    test(tag + ' multipleRadio', function (t) {
        var f = forms.create({
            fieldname: forms.fields.string({
                choices: {one: 'item one'},
                widget: forms.widgets.multipleRadio(),
                legendClasses: ['test1', 'test2'],
                fieldsetClasses: ['test3', 'test4']
            })
        });
        t.equal(
            f.toHTML(forms.render[tag]),
            '<' + tag + ' class="field">' +
                '<fieldset class="test3 test4">' +
                    '<legend class="test1 test2">Fieldname</legend>' +
                    '<input type="radio" name="fieldname" id="id_fieldname_one" value="one" />' +
                    '<label for="id_fieldname_one">item one</label>' +
                '</fieldset>' +
            '</' + tag + '>'
        );
        t.end();
    });

    test(tag + ' label custom id', function (t) {
        var f = forms.create({
            fieldname: forms.fields.string({
                id: 'custom-id'
            })
        });
        t.equal(
            f.toHTML(forms.render[tag]),
            '<' + tag + ' class="field">' +
                '<label for="custom-id">Fieldname</label>' +
                '<input type="text" name="fieldname" id="custom-id" />' +
            '</' + tag + '>'
        );
        t.end();
    });

    test(tag + ' label no id', function (t) {
        var f = forms.create({
            fieldname: forms.fields.string({
                id: false
            })
        });
        t.equal(
            f.toHTML(forms.render[tag]),
            '<' + tag + ' class="field">' +
                '<label>Fieldname</label>' +
                '<input type="text" name="fieldname" />' +
            '</' + tag + '>'
        );
        t.end();
    });

    test(tag + ' hidden label', function (t) {
        var f = forms.create({
            fieldname: forms.fields.string({
                widget: forms.widgets.hidden()
            })
        });
        t.equal(
            f.toHTML(forms.render[tag]),
            '<' + tag + ' class="field">' +
                '<input type="hidden" name="fieldname" id="id_fieldname" />' +
            '</' + tag + '>'
        );
        t.end();
    });
};

testWrap('div');
testWrap('p');
testWrap('li');

test('table', function (t) {
    var f = forms.create({fieldname: forms.fields.string()});
    t.equal(
        f.toHTML(forms.render.table),
        '<tr class="field">' +
            '<th><label for="id_fieldname">Fieldname</label></th>' +
            '<td>' +
                '<input type="text" name="fieldname" id="id_fieldname" />' +
            '</td>' +
        '</tr>'
    );
    t.end();
});

test('table required', function (t) {
    var f = forms.create({
        fieldname: forms.fields.string({required: true})
    });
    t.equal(
        f.toHTML(forms.render.table),
        '<tr class="field required">' +
            '<th><label for="id_fieldname">Fieldname</label></th>' +
            '<td>' +
                '<input type="text" name="fieldname" id="id_fieldname" />' +
            '</td>' +
        '</tr>'
    );
    t.end();
});

test('table bound', function (t) {
    t.plan(1);
    var f = forms.create({name: forms.fields.string()});
    f.bind({name: 'val'}).validate(function (err, f) {
        t.equal(
            f.toHTML(forms.render.table),
            '<tr class="field">' +
                '<th><label for="id_name">Name</label></th>' +
                '<td>' +
                    '<input type="text" name="name" id="id_name" value="val" />' +
                '</td>' +
            '</tr>'
        );
        t.end();
    });
});

test('table bound error', function (t) {
    t.plan(4);
    var f = forms.create({
        field_name: forms.fields.string({
            validators: [function (form, field, callback) {
                callback('validation error');
            }]
        }),
        field_name_error_after: forms.fields.string({
            errorAfterField: true,
            validators: [function (form, field, callback) {
                callback('validation error after field');
            }]
        })
    });
    f.bind({field_name: 'val', field_name_error_after: 'foo'}).validate(function (err, f) {
        t.equal(
            f.toHTML(forms.render.table),
            '<tr class="field error">' +
                '<th><label for="id_field_name">Field name</label></th>' +
                '<td>' +
                    '<p class="error_msg">validation error</p>' +
                    '<input type="text" name="field_name" id="id_field_name" value="val" />' +
                '</td>' +
            '</tr>' +
            '<tr class="field error">' +
                '<th><label for="id_field_name_error_after">Field name error after</label></th>' +
                '<td>' +
                    '<input type="text" name="field_name_error_after" id="id_field_name_error_after" value="foo" />' +
                    '<p class="error_msg">validation error after field</p>' +
                '</td>' +
            '</tr>'
        );
    });

    // Error rendering disabled
    var f = forms.create({
        field_name: forms.fields.string({
            hideError: true,
            validators: [function (form, field, callback) {
                callback('validation error');
            }]
        }),
        field_name_error_after: forms.fields.string({
            errorAfterField: true,
            hideError: true,
            validators: [function (form, field, callback) {
                callback('validation error after field');
            }]
        })
    });
    f.bind({field_name: 'val', field_name_error_after: 'foo'}).validate(function (err, f) {
        t.equal(
            f.toHTML(forms.render.table),
            '<tr class="field error">' +
                '<th><label for="id_field_name">Field name</label></th>' +
                '<td>' +
                    '<input type="text" name="field_name" id="id_field_name" value="val" />' +
                '</td>' +
            '</tr>' +
            '<tr class="field error">' +
                '<th><label for="id_field_name_error_after">Field name error after</label></th>' +
                '<td>' +
                    '<input type="text" name="field_name_error_after" id="id_field_name_error_after" value="foo" />' +
                '</td>' +
            '</tr>'
        );

        t.equal(f.fields.field_name.errorHTML(),
            '<p class="error_msg">validation error</p>'
        );
        t.equal(f.fields.field_name_error_after.errorHTML(),
            '<p class="error_msg">validation error after field</p>'
        );
    });

    t.end();
});

