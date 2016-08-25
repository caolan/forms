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

test('nested validation errors', function (t) {
    var form = forms.create(
        {
            userDetails: {
                username: forms.fields.string({ required: true }),
                password: forms.fields.password({ required: true })
            }
        },
        { validatePastFirstError: true }
    );

    t.test('with subobject specified', function (st) {
        st.plan(3);
        form.handle({ userDetails: {} }, {
            success: function (f) {
                st.fail('Unexpected success callback');
                st.notOk(f.isValid(), 'Form should not be valid');
            },
            other: function (f) {
                st.equal(f.fields.userDetails.fields.username.error, 'Username is required.', 'validation failure on username field');
                st.equal(f.fields.userDetails.fields.password.error, 'Password is required.', 'validation failure on password field');
                st.notOk(f.isValid(), 'Form should not be valid');
            }
        });
    });

    t.test('with no subobject specified', function (st) {
        st.plan(3);
        form.handle({ foo: 'bar' }, {
            success: function (f) {
                st.fail('Unexpected success callback');
                st.notOk(f.isValid(), 'Form should not be valid');
            },
            other: function (f) {
                st.equal(f.fields.userDetails.fields.username.error, 'Username is required.', 'validation failure on username field');
                st.equal(f.fields.userDetails.fields.password.error, 'Password is required.', 'validation failure on password field');
                st.notOk(f.isValid(), 'Form should not be valid');
            }
        });
    });

    t.end();
});
