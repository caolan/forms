/*jslint node: true */
'use strict';
var forms = require('../lib/forms');
var fields = forms.fields;
var stringField = fields.string();
var stringHTML = stringField.toHTML().toString();
var fn1 = function () { return 'one'; };
var fn2 = function () { return 'two'; };
var test = require('tape');

var testField = function (field) {

    test(field + ' options', function (test) {

        var f = fields[field]({
            required: true,
            label: 'test label',
            validators: [fn1],
            widget: 'some widget',
            choices: {one: 'option one', two: 'option two'}
        });

        test.equal(f.required, true);
        test.equal(f.label, 'test label');
        test.equal(f.validators[f.validators.length - 1], fn1);
        test.equal(f.widget, 'some widget');
        test.deepEqual(f.choices, {one: 'option one', two: 'option two'});
        test.equal(f.validate, undefined);
        test.end();
    });

    test(field + ' bind', function (test) {
        test.plan(7);

        var f = fields[field]({
            label: 'test label',
            validators: [
                function (form, field, callback) {
                    test.ok(false, 'validators should not be called');
                }
            ]
        });
        f.parse = function (data) {
            test.equal(data, 'some data');
            return 'some data parsed';
        };
        var bound = f.bind('some data');
        test.equal(bound.label, 'test label');
        test.equal(bound.value, 'some data');
        test.equal(bound.data, 'some data parsed');
        test.equal(bound.error, undefined);
        test.ok(bound.validate instanceof Function);
        test.ok(bound !== f, 'bind returns a new field object');
        test.end();
    });

    test(field + ' validate', function (test) {
        test.plan(10);

        var f = fields[field]({label: 'test label'});
        f.validators = [
            function (form, field, callback) {
                test.equal(field.data, 'some data parsed');
                test.equal(field.value, 'some data');
                callback(null);
            },
            function (form, field, callback) {
                test.equal(field.data, 'some data parsed');
                test.equal(field.value, 'some data');
                callback(new Error('validation error'));
            }
        ];

        f.parse = function (data) {
            test.equal(data, 'some data');
            return 'some data parsed';
        };
        f.bind('some data').validate('form', function (err, bound) {
            test.equal(bound.label, 'test label');
            test.equal(bound.value, 'some data');
            test.equal(bound.data, 'some data parsed');
            test.equal(bound.error, 'Error: validation error');
            test.ok(bound !== f, 'bind returns a new field object');
            test.end();
        });
    });

    test(field + ' validate multiple errors', function (test) {
        test.plan(1);

        var f = fields[field]();
        f.validators = [
            function (form, field, callback) {
                callback('error one');
            },
            function (form, field, callback) {
                test.ok(false, 'second validator should not be called');
                callback('error two');
            }
        ];

        f.parse = function (data) {
            return 'some data parsed';
        };
        f.bind('some data').validate('form', function (err, bound) {
            test.equal(bound.error, 'error one');
            test.end();
        });
    });

    test(field + ' validate empty', function (test) {
        test.plan(1);
        var f = fields[field]({
            validators: [function (form, field, callback) {
                test.ok(false, 'validators should not be called');
                callback('some error');
            }]
        });
        f.parse = function (data) {
            return;
        };
        f.bind().validate('form', function (err, bound) {
            test.equal(bound.error, undefined);
            test.end();
        });
    });

    test(field + ' validate required', function (test) {
        test.plan(5);
        var f = fields[field]({required: true});
        f.validators = [];
        f.bind(undefined).validate('form', function (err, f) {
            test.equal(f.value, undefined);
            test.equal(f.error, 'This field is required.');
        });
        var f2 = fields[field]({required: true});
        f2.parse = function (val) { return val; };
        f2.validators = [];
        f2.bind('val').validate('form', function (err, f2) {
            test.equal(f2.value, 'val');
            test.equal(f2.data, 'val');
            test.notOk(f2.error);
        });
        setTimeout(test.end, 25);
    });

    test(field + ' validate no validators', function (test) {
        test.plan(4);
        var f = fields[field]();
        f.validators = [];
        f.parse = function (data) {
            test.equal(data, 'some data');
            return 'some data parsed';
        };
        f.bind('some data').validate('form', function (err, f) {
            test.equal(f.value, 'some data');
            test.equal(f.data, 'some data parsed');
            test.notOk(f.error);
            test.end();
        });
    });
};

testField('string');

test('string parse', function (test) {
    test.equal(stringField.parse(), '');
    test.equal(stringField.parse(null), '');
    test.equal(stringField.parse(0), '0');
    test.equal(stringField.parse(''), '');
    test.equal(stringField.parse('some string'), 'some string');
    test.end();
});

test('string labelText', function (test) {
    test.equal(stringField.labelText('name'), 'Name');
    test.equal(stringField.labelText('first_name'), 'First name');
    test.equal(stringField.labelText('first-name'), 'First name');
    test.equal(stringField.labelText('firstName'), 'First name');
    test.end();
});

test('string toHTML', function (test) {
    test.plan(3);
    test.equal(
        stringField.toHTML('fieldname'),
        '<div class="field">' +
            '<label for="id_fieldname">Fieldname</label>' +
            '<input type="text" name="fieldname" id="id_fieldname" />' +
        '</div>'
    );
    var f = fields.string();
    f.widget.toHTML = function (name, field) {
        test.equal(name, 'fieldname');
        test.equal(field, f);
        test.end();
    };
    f.toHTML('fieldname');
});

test('string toHTML with CSS classes', function (test) {
    test.plan(1);
    test.equal(
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
    test.end();
});

testField('number');

test('number parse', function (test) {
    var field = fields.number();
    test.ok(isNaN(field.parse()));
    test.ok(isNaN(field.parse(null)));
    test.equal(field.parse(0), 0);
    test.ok(isNaN(field.parse('')));
    test.equal(field.parse('123'), 123);
    test.end();
});

test('number toHTML', function (test) {
    test.equal(
        fields.number().toHTML('fieldname'),
        '<div class="field">' +
            '<label for="id_fieldname">Fieldname</label>' +
            '<input type="text" name="fieldname" id="id_fieldname" />' +
        '</div>'
    );
    test.end();
});

testField('boolean');

test('boolean parse', function (test) {
    var field = fields.boolean();
    test.equal(field.parse(), false);
    test.equal(field.parse(null), false);
    test.equal(field.parse(0), false);
    test.equal(field.parse(''), false);
    test.equal(field.parse('on'), true);
    test.equal(field.parse('true'), true);
    test.end();
});

test('boolean toHTML', function (test) {
    test.equal(
        fields.boolean().toHTML('fieldname'),
        '<div class="field">' +
            '<label for="id_fieldname">Fieldname</label>' +
            '<input type="checkbox" name="fieldname" id="id_fieldname" value="on" />' +
        '</div>'
    );
    test.end();
});

testField('email');

test('email parse', function (test) {
    test.equal(
        fields.email().parse().toString(),
        stringField.parse().toString()
    );
    test.end();
});

test('email toHTML', function (test) {
    test.equal(
        fields.email().toHTML().toString(),
        stringHTML.replace(/type="text"/, 'type="email"')
    );
    test.end();
});

test('email validators', function (test) {
    test.equal(
        fields.email().validators[0].toString(),
        forms.validators.email().toString()
    );
    var f = fields.email({validators: [fn1, fn2]});
    test.equal(
        f.validators[0].toString(),
        forms.validators.email().toString()
    );
    test.deepEqual(f.validators.slice(1), [fn1, fn2]);
    test.end();
});

testField('tel');

test('tel toHTML', function (test) {
    test.equal(
        fields.tel().toHTML().toString(),
        stringHTML.replace(/type="text"/, 'type="tel"')
    );
    test.end();
});

testField('password');

test('password parse', function (test) {
    test.equal(
        fields.password().parse().toString(),
        stringField.parse().toString()
    );
    test.end();
});

test('password toHTML', function (test) {
    test.equal(
        fields.password().toHTML().toString(),
        stringHTML.replace(/type="text"/, 'type="password"')
    );
    test.end();
});

testField('url');

test('url parse', function (test) {
    test.equal(
        fields.url().parse().toString(),
        stringField.parse().toString()
    );
    test.end();
});

test('url toHTML', function (test) {
    test.equal(
        fields.url().toHTML().toString(),
        stringHTML
    );
    test.end();
});

test('url validators', function (test) {
    test.equal(
        fields.url().validators[0].toString(),
        forms.validators.url().toString()
    );
    var f = fields.url({validators: [fn1, fn2]});
    test.equal(
        f.validators[0].toString(),
        forms.validators.url().toString()
    );
    test.deepEqual(f.validators.slice(1), [fn1, fn2]);
    test.end();
});

testField('date');

test('date parse', function (test) {
    test.equal(
        fields.date().parse().toString(),
        stringField.parse().toString()
    );
    test.end();
});

test('date toHTML', function (test) {
    test.equal(
        fields.date().toHTML().toString(),
        stringHTML
    );
    test.end();
});

test('date validators', function (test) {
    test.equal(
        fields.date().validators[0].toString(),
        forms.validators.date().toString()
    );
    var f = fields.date({validators: [fn1, fn2]});
    test.equal(
        f.validators[0].toString(),
        forms.validators.date().toString()
    );
    test.deepEqual(f.validators.slice(1), [fn1, fn2]);
    test.end();
});

testField('array');

test('array parse', function (test) {
    var field = fields.array();
    test.deepEqual(field.parse(), []);
    test.deepEqual(field.parse(null), [null]);
    test.deepEqual(field.parse(0), [0]);
    test.deepEqual(field.parse(''), ['']);
    test.deepEqual(field.parse('abc'), ['abc']);
    test.deepEqual(field.parse(['one', 'two', 'three']), ['one', 'two', 'three']);
    test.end();
});

test('array toHTML', function (test) {
    test.equal(
        fields.array().toHTML().toString(),
        stringHTML
    );
    test.end();
});

