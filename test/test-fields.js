'use strict';

var forms = require('../lib/forms');
var util = require('util');
var is = require('is');
var fields = forms.fields;
var stringField = fields.string();
var stringHTML = String(stringField.toHTML());
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
            choices: { one: 'option one', two: 'option two' }
        });

        t.equal(f.required, true);
        t.equal(f.label, 'test label');
        t.equal(f.validators[f.validators.length - 1], fn1);
        t.equal(f.widget, 'some widget');
        t.deepEqual(f.choices, { one: 'option one', two: 'option two' });
        t.equal(f.validate, undefined);
        t.end();
    });

    test(field + ' bind', function (t) {
        t.plan(7);

        var f = fields[field]({
            label: 'test label',
            validators: [
                function () {
                    t.fail('validators should not be called');
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

        var f = fields[field]({ label: 'test label' });
        f.validators = [
            function (form, fieldObject, callback) {
                t.equal(fieldObject.data, 'some data parsed');
                t.equal(fieldObject.value, 'some data');
                callback(null);
            },
            function (form, fieldObject, callback) {
                t.equal(fieldObject.data, 'some data parsed');
                t.equal(fieldObject.value, 'some data');
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
            function (form, fieldObject, callback) {
                callback('error one');
            },
            function (form, fieldObject, callback) {
                t.fail('second validator should not be called');
                callback('error two');
            }
        ];

        f.parse = function (data) {
            return 'some data parsed: ' + util.inspect(data);
        };
        f.bind('some data').validate('form', function (err, bound) {
            t.equal(bound.error, 'error one');
            t.end();
        });
    });

    test(field + ' validate empty', function (t) {
        t.plan(1);
        var f = fields[field]({
            validators: [function (form, fieldObject, callback) {
                t.fail('validators should not be called');
                callback('some error');
            }]
        });
        f.parse = function (data) {
            return util.inspect(data);
        };
        f.bind().validate('form', function (err, bound) {
            t.equal(bound.error, undefined);
            t.end();
        });
    });

    test(field + ' validate required', function (t) {
        t.plan(5);
        var f = fields[field]({ required: true });
        f.validators = [];
        f.bind(undefined).validate('form', function (err, fieldObject) {
            t.equal(fieldObject.value, undefined);
            t.equal(fieldObject.error, 'This field is required.');
        });
        var f2 = fields[field]({ required: true });
        f2.parse = function (val) { return val; };
        f2.validators = [];
        f2.bind('val').validate('form', function (err, fieldObject) {
            t.equal(fieldObject.value, 'val');
            t.equal(fieldObject.data, 'val');
            t.notOk(fieldObject.error);
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
        f.bind('some data').validate('form', function (err, fieldObject) {
            t.equal(fieldObject.value, 'some data');
            t.equal(fieldObject.data, 'some data parsed');
            t.notOk(fieldObject.error);
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
        '<div class="field">'
            + '<label for="id_fieldname">Fieldname</label>'
            + '<input type="text" name="fieldname" id="id_fieldname" />'
        + '</div>'
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
        '<div class="field custom-field-class1 custom-field-class2">'
            + '<label for="id_fieldname" class="custom-label-class1 custom-label-class2">Fieldname</label>'
            + '<input type="text" name="fieldname" id="id_fieldname" />'
        + '</div>'
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
        '<div class="field">'
            + '<label for="id_fieldname">Fieldname</label>'
            + '<input type="text" name="fieldname" id="id_fieldname" />'
        + '</div>'
    );
    t.end();
});

testField('boolean');

test('boolean parse', function (t) {
    var field = fields['boolean']();
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
        fields['boolean']().toHTML('fieldname'),
        '<div class="field">'
            + '<label for="id_fieldname">Fieldname</label>'
            + '<input type="checkbox" name="fieldname" id="id_fieldname" value="on" />'
        + '</div>'
    );
    t.end();
});

testField('email');

test('email parse', function (t) {
    t.equal(
        String(fields.email().parse()),
        String(stringField.parse())
    );
    t.end();
});

test('email toHTML', function (t) {
    t.equal(
        String(fields.email().toHTML()),
        stringHTML.replace(/type="text"/, 'type="email"')
    );
    t.end();
});

test('email validators', function (t) {
    t.equal(
        String(fields.email().validators[0]),
        String(forms.validators.email())
    );
    var f = fields.email({ validators: [fn1, fn2] });
    t.equal(
        String(f.validators[0]),
        String(forms.validators.email())
    );
    t.deepEqual(f.validators.slice(1), [fn1, fn2]);
    t.end();
});

testField('tel');

test('tel toHTML', function (t) {
    t.equal(
        String(fields.tel().toHTML()),
        stringHTML.replace(/type="text"/, 'type="tel"')
    );
    t.end();
});

testField('password');

test('password parse', function (t) {
    t.equal(
        String(fields.password().parse()),
        String(stringField.parse())
    );
    t.end();
});

test('password toHTML', function (t) {
    t.equal(
        String(fields.password().toHTML()),
        stringHTML.replace(/type="text"/, 'type="password"')
    );
    t.end();
});

testField('url');

test('url parse', function (t) {
    t.equal(
        String(fields.url().parse()),
        String(stringField.parse())
    );
    t.end();
});

test('url toHTML', function (t) {
    t.equal(
        String(fields.url().toHTML()),
        stringHTML
    );
    t.end();
});

test('url validators', function (t) {
    t.equal(
        String(fields.url().validators[0]),
        String(forms.validators.url())
    );
    var f = fields.url({ validators: [fn1, fn2] });
    t.equal(
        String(f.validators[0]),
        String(forms.validators.url())
    );
    t.deepEqual(f.validators.slice(1), [fn1, fn2]);
    t.end();
});

testField('date');

test('date parse', function (t) {
    t.equal(
        String(fields.date().parse()),
        String(stringField.parse())
    );
    t.end();
});

test('date toHTML', function (t) {
    t.equal(
        String(fields.date().toHTML()),
        stringHTML
    );
    t.end();
});

test('date validators', function (t) {
    t.equal(
        String(fields.date().validators[0]),
        String(forms.validators.date())
    );
    var f = fields.date({ validators: [fn1, fn2] });
    t.equal(
        String(f.validators[0]),
        String(forms.validators.date())
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
        String(fields.array().toHTML()),
        stringHTML
    );
    t.end();
});
