/*jslint node: true */
'use strict';
var forms = require('../lib/forms');
var is = require('is');
var fields = forms.fields;
var stringField = fields.string();
var stringHTML = stringField.toHTML().toString();
var fn1 = function () { return 'one'; };
var fn2 = function () { return 'two'; };
var test = require('tape');

var testField = function (field) {

    test(field + ' options', function (t) {
        t.plan(6);

        var f = fields[field]({
            required: true,
            label: 'test label',
            validators: [fn1],
            widget: 'some widget',
            choices: {one: 'option one', two: 'option two'}
        });

        t.equal(f.required, true);
        t.equal(f.label, 'test label');
        t.equal(f.validators[f.validators.length - 1], fn1);
        t.equal(f.widget, 'some widget');
        t.deepEqual(f.choices, {one: 'option one', two: 'option two'});
        t.equal(f.validate, undefined);
        t.end();
    });

    test(field + ' bind', function (t) {
        t.plan(7);

        var f = fields[field]({
            label: 'test label',
            validators: [
                function (form, field, callback) {
                    t.ok(false, 'validators should not be called');
                }
            ]
        });
        f.parse = function (data) {
            t.equal(data, 'some data');
            return 'some data parsed';
        };
        var bound = f.bind('some data');
        t.equal(bound.label, 'test label');
        t.equal(bound.value, 'some data');
        t.equal(bound.data, 'some data parsed');
        t.equal(bound.error, undefined);
        t.ok(is.fn(bound.validate));
        t.notEqual(bound, f, 'bind returns a new field object');
        t.end();
    });

    test(field + ' validate', function (t) {
        t.plan(10);

        var f = fields[field]({label: 'test label'});
        f.validators = [
            function (form, field, callback) {
                t.equal(field.data, 'some data parsed');
                t.equal(field.value, 'some data');
                callback(null);
            },
            function (form, field, callback) {
                t.equal(field.data, 'some data parsed');
                t.equal(field.value, 'some data');
                callback(new Error('validation error'));
            }
        ];

        f.parse = function (data) {
            t.equal(data, 'some data');
            return 'some data parsed';
        };
        f.bind('some data').validate('form', function (err, bound) {
            t.equal(bound.label, 'test label');
            t.equal(bound.value, 'some data');
            t.equal(bound.data, 'some data parsed');
            t.equal(bound.error, 'Error: validation error');
            t.notEqual(bound, f, 'bind returns a new field object');
            t.end();
        });
    });

    test(field + ' validate multiple errors', function (t) {
        t.plan(1);

        var f = fields[field]();
        f.validators = [
            function (form, field, callback) {
                callback('error one');
            },
            function (form, field, callback) {
                t.ok(false, 'second validator should not be called');
                callback('error two');
            }
        ];

        f.parse = function (data) {
            return 'some data parsed';
        };
        f.bind('some data').validate('form', function (err, bound) {
            t.equal(bound.error, 'error one');
            t.end();
        });
    });

    test(field + ' validate empty', function (t) {
        t.plan(1);
        var f = fields[field]({
            validators: [function (form, field, callback) {
                t.ok(false, 'validators should not be called');
                callback('some error');
            }]
        });
        f.parse = function (data) {
            return;
        };
        f.bind().validate('form', function (err, bound) {
            t.equal(bound.error, undefined);
            t.end();
        });
    });

    test(field + ' validate required', function (t) {
        t.plan(5);
        var f = fields[field]({required: true});
        f.validators = [];
        f.bind(undefined).validate('form', function (err, f) {
            t.equal(f.value, undefined);
            t.equal(f.error, 'This field is required.');
        });
        var f2 = fields[field]({required: true});
        f2.parse = function (val) { return val; };
        f2.validators = [];
        f2.bind('val').validate('form', function (err, f2) {
            t.equal(f2.value, 'val');
            t.equal(f2.data, 'val');
            t.notOk(f2.error);
        });
        t.end();
    });

    test(field + ' validate no validators', function (t) {
        t.plan(4);
        var f = fields[field]();
        f.validators = [];
        f.parse = function (data) {
            t.equal(data, 'some data');
            return 'some data parsed';
        };
        f.bind('some data').validate('form', function (err, f) {
            t.equal(f.value, 'some data');
            t.equal(f.data, 'some data parsed');
            t.notOk(f.error);
            t.end();
        });
    });
};

testField('string');

test('string parse', function (t) {
    t.plan(5);
    t.equal(stringField.parse(), '');
    t.equal(stringField.parse(null), '');
    t.equal(stringField.parse(0), '0');
    t.equal(stringField.parse(''), '');
    t.equal(stringField.parse('some string'), 'some string');
    t.end();
});

test('string labelText', function (t) {
    t.plan(4);
    t.equal(stringField.labelText('name'), 'Name');
    t.equal(stringField.labelText('first_name'), 'First name');
    t.equal(stringField.labelText('first-name'), 'First name');
    t.equal(stringField.labelText('firstName'), 'First name');
    t.end();
});

test('string toHTML', function (t) {
    t.plan(3);
    t.equal(
        stringField.toHTML('fieldname'),
        '<div class="field">' +
            '<label for="id_fieldname">Fieldname</label>' +
            '<input type="text" name="fieldname" id="id_fieldname" />' +
        '</div>'
    );
    var f = fields.string();
    f.widget.toHTML = function (name, field) {
        t.equal(name, 'fieldname');
        t.equal(field, f);
        t.end();
    };
    f.toHTML('fieldname');
});

test('string toHTML with CSS classes', function (t) {
    t.plan(1);
    t.equal(
        fields.string({
            cssClasses: {
                field: ['custom-field-class1', 'custom-field-class2'],
                label: ['custom-label-class1', 'custom-label-class2']
            }
        }).toHTML('fieldname'),
        '<div class="field custom-field-class1 custom-field-class2">' +
            '<label for="id_fieldname" class="custom-label-class1 custom-label-class2">Fieldname</label>' +
            '<input type="text" name="fieldname" id="id_fieldname" />' +
        '</div>'
    );
    t.end();
});

testField('number');

test('number parse', function (t) {
    var field = fields.number();
    t.ok(isNaN(field.parse()));
    t.ok(isNaN(field.parse(null)));
    t.equal(field.parse(0), 0);
    t.ok(isNaN(field.parse('')));
    t.equal(field.parse('123'), 123);
    t.end();
});

test('number toHTML', function (t) {
    t.equal(
        fields.number().toHTML('fieldname'),
        '<div class="field">' +
            '<label for="id_fieldname">Fieldname</label>' +
            '<input type="text" name="fieldname" id="id_fieldname" />' +
        '</div>'
    );
    t.end();
});

testField('boolean');

test('boolean parse', function (t) {
    var field = fields.boolean();
    t.equal(field.parse(), false);
    t.equal(field.parse(null), false);
    t.equal(field.parse(0), false);
    t.equal(field.parse(''), false);
    t.equal(field.parse('on'), true);
    t.equal(field.parse('true'), true);
    t.end();
});

test('boolean toHTML', function (t) {
    t.equal(
        fields.boolean().toHTML('fieldname'),
        '<div class="field">' +
            '<label for="id_fieldname">Fieldname</label>' +
            '<input type="checkbox" name="fieldname" id="id_fieldname" value="on" />' +
        '</div>'
    );
    t.end();
});

testField('email');

test('email parse', function (t) {
    t.equal(
        fields.email().parse().toString(),
        stringField.parse().toString()
    );
    t.end();
});

test('email toHTML', function (t) {
    t.equal(
        fields.email().toHTML().toString(),
        stringHTML.replace(/type="text"/, 'type="email"')
    );
    t.end();
});

test('email validators', function (t) {
    t.equal(
        fields.email().validators[0].toString(),
        forms.validators.email().toString()
    );
    var f = fields.email({validators: [fn1, fn2]});
    t.equal(
        f.validators[0].toString(),
        forms.validators.email().toString()
    );
    t.deepEqual(f.validators.slice(1), [fn1, fn2]);
    t.end();
});

testField('tel');

test('tel toHTML', function (t) {
    t.equal(
        fields.tel().toHTML().toString(),
        stringHTML.replace(/type="text"/, 'type="tel"')
    );
    t.end();
});

testField('password');

test('password parse', function (t) {
    t.equal(
        fields.password().parse().toString(),
        stringField.parse().toString()
    );
    t.end();
});

test('password toHTML', function (t) {
    t.equal(
        fields.password().toHTML().toString(),
        stringHTML.replace(/type="text"/, 'type="password"')
    );
    t.end();
});

testField('url');

test('url parse', function (t) {
    t.equal(
        fields.url().parse().toString(),
        stringField.parse().toString()
    );
    t.end();
});

test('url toHTML', function (t) {
    t.equal(
        fields.url().toHTML().toString(),
        stringHTML
    );
    t.end();
});

test('url validators', function (t) {
    t.equal(
        fields.url().validators[0].toString(),
        forms.validators.url().toString()
    );
    var f = fields.url({validators: [fn1, fn2]});
    t.equal(
        f.validators[0].toString(),
        forms.validators.url().toString()
    );
    t.deepEqual(f.validators.slice(1), [fn1, fn2]);
    t.end();
});

testField('date');

test('date parse', function (t) {
    t.equal(
        fields.date().parse().toString(),
        stringField.parse().toString()
    );
    t.end();
});

test('date toHTML', function (t) {
    t.equal(
        fields.date().toHTML().toString(),
        stringHTML
    );
    t.end();
});

test('date validators', function (t) {
    t.equal(
        fields.date().validators[0].toString(),
        forms.validators.date().toString()
    );
    var f = fields.date({validators: [fn1, fn2]});
    t.equal(
        f.validators[0].toString(),
        forms.validators.date().toString()
    );
    t.deepEqual(f.validators.slice(1), [fn1, fn2]);
    t.end();
});

testField('array');

test('array parse', function (t) {
    var field = fields.array();
    t.deepEqual(field.parse(), []);
    t.deepEqual(field.parse(null), [null]);
    t.deepEqual(field.parse(0), [0]);
    t.deepEqual(field.parse(''), ['']);
    t.deepEqual(field.parse('abc'), ['abc']);
    t.deepEqual(field.parse(['one', 'two', 'three']), ['one', 'two', 'three']);
    t.end();
});

test('array toHTML', function (t) {
    t.equal(
        fields.array().toHTML().toString(),
        stringHTML
    );
    t.end();
});

