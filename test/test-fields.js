/*jslint node: true */
'use strict';
var forms = require('../lib/forms'),
    fields = forms.fields;


var testField = function (field) {

    exports[field + ' options'] = function (test) {
        var fn1 = function () { return 'one'; };

        var f = fields[field]({
            required: true,
            label: 'test label',
            validators: [fn1],
            widget: 'some widget',
            choices: {one: 'option one', two: 'option two'}
        });

        test.equals(f.required, true);
        test.equals(f.label, 'test label');
        test.equals(f.validators[f.validators.length - 1], fn1);
        test.equals(f.widget, 'some widget');
        test.same(f.choices, {one: 'option one', two: 'option two'});
        test.equals(f.validate, undefined);
        test.done();
    };

    exports[field + ' bind'] = function (test) {
        test.expect(7);

        var f = fields[field]({
            label: 'test label',
            validators: [
                function (form, field, callback) {
                    test.ok(false, 'validators should not be called');
                }
            ]
        });
        f.parse = function (data) {
            test.equals(data, 'some data');
            return 'some data parsed';
        };
        var bound = f.bind('some data');
        test.equals(bound.label, 'test label');
        test.equals(bound.value, 'some data');
        test.equals(bound.data, 'some data parsed');
        test.equals(bound.error, undefined);
        test.ok(bound.validate instanceof Function);
        test.ok(bound !== f, 'bind returns a new field object');
        test.done();
    };

    exports[field + ' validate'] = function (test) {
        test.expect(10);

        var f = fields[field]({label: 'test label'});
        f.validators = [
            function (form, field, callback) {
                test.equals(field.data, 'some data parsed');
                test.equals(field.value, 'some data');
                callback(null);
            },
            function (form, field, callback) {
                test.equals(field.data, 'some data parsed');
                test.equals(field.value, 'some data');
                callback(new Error('validation error'));
            }
        ];

        f.parse = function (data) {
            test.equals(data, 'some data');
            return 'some data parsed';
        };
        f.bind('some data').validate('form', function (err, bound) {
            test.equals(bound.label, 'test label');
            test.equals(bound.value, 'some data');
            test.equals(bound.data, 'some data parsed');
            test.equals(bound.error, 'Error: validation error');
            test.ok(bound !== f, 'bind returns a new field object');
            test.done();
        });
    };

    exports[field + ' validate multiple errors'] = function (test) {
        test.expect(1);

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
            test.equals(bound.error, 'error one');
            test.done();
        });
    };

    exports[field + ' validate empty'] = function (test) {
        test.expect(1);
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
            test.equals(bound.error, undefined);
            test.done();
        });
    };

    exports[field + ' validate required'] = function (test) {
        test.expect(5);
        var f = fields[field]({required: true});
        f.validators = [];
        f.bind(undefined).validate('form', function (err, f) {
            test.equals(f.value, undefined);
            test.equals(f.error, 'This field is required.');
        });
        var f2 = fields[field]({required: true});
        f2.parse = function (val) { return val; };
        f2.validators = [];
        f2.bind('val').validate('form', function (err, f2) {
            test.equals(f2.value, 'val');
            test.equals(f2.data, 'val');
            test.equals(f2.error, null);
        });
        setTimeout(test.done, 25);
    };

    exports[field + ' validate no validators'] = function (test) {
        test.expect(4);
        var f = fields[field]();
        f.validators = [];
        f.parse = function (data) {
            test.equals(data, 'some data');
            return 'some data parsed';
        };
        f.bind('some data').validate('form', function (err, f) {
            test.equals(f.value, 'some data');
            test.equals(f.data, 'some data parsed');
            test.equals(f.error, null);
            test.done();
        });
    };
};

testField('string');

exports['string parse'] = function (test) {
    test.equals(fields.string().parse(), '');
    test.equals(fields.string().parse(null), '');
    test.equals(fields.string().parse(0), '0');
    test.equals(fields.string().parse(''), '');
    test.equals(fields.string().parse('some string'), 'some string');
    test.done();
};

exports['string toHTML'] = function (test) {
    test.expect(3);
    test.equals(
        fields.string().toHTML('fieldname'),
        '<div class="field">' +
            '<label for="id_fieldname">Fieldname</label>' +
            '<input type="text" name="fieldname" id="id_fieldname" />' +
        '</div>'
    );
    var f = fields.string();
    f.widget.toHTML = function (name, field) {
        test.equals(name, 'fieldname');
        test.equals(field, f);
        test.done();
    };
    f.toHTML('fieldname');
};

exports['string toHTML with CSS classes'] = function (test) {
    test.expect(1);
    test.equals(
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
    test.done();
};

testField('number');

exports['number parse'] = function (test) {
    test.ok(isNaN(fields.number().parse()));
    test.ok(isNaN(fields.number().parse(null)));
    test.equals(fields.number().parse(0), 0);
    test.ok(isNaN(fields.number().parse('')));
    test.equals(fields.number().parse('123'), 123);
    test.done();
};

exports['number toHTML'] = function (test) {
    test.equals(
        fields.number().toHTML('fieldname'),
        '<div class="field">' +
            '<label for="id_fieldname">Fieldname</label>' +
            '<input type="text" name="fieldname" id="id_fieldname" />' +
        '</div>'
    );
    test.done();
};

testField('boolean');

exports['boolean parse'] = function (test) {
    test.equals(fields.boolean().parse(), false);
    test.equals(fields.boolean().parse(null), false);
    test.equals(fields.boolean().parse(0), false);
    test.equals(fields.boolean().parse(''), false);
    test.equals(fields.boolean().parse('on'), true);
    test.equals(fields.boolean().parse('true'), true);
    test.done();
};

exports['boolean toHTML'] = function (test) {
    test.equals(
        fields.boolean().toHTML('fieldname'),
        '<div class="field">' +
            '<label for="id_fieldname">Fieldname</label>' +
            '<input type="checkbox" name="fieldname" id="id_fieldname" value="on" />' +
        '</div>'
    );
    test.done();
};

testField('email');

exports['email parse'] = function (test) {
    test.equals(
        fields.email().parse.toString(),
        fields.string().parse.toString()
    );
    test.done();
};

exports['email toHTML'] = function (test) {
    test.equals(
        fields.email().toHTML.toString(),
        fields.string().toHTML.toString()
    );
    test.done();
};

exports['email validators'] = function (test) {
    test.equals(
        fields.email().validators[0].toString(),
        forms.validators.email().toString()
    );
    var fn1 = function () { return 'one'; },
        fn2 = function () { return 'two'; },
        f = fields.email({validators: [fn1, fn2]});
    test.equals(
        f.validators[0].toString(),
        forms.validators.email().toString()
    );
    test.same(f.validators.slice(1), [fn1, fn2]);
    test.done();
};

testField('password');

exports['password parse'] = function (test) {
    test.equals(
        fields.password().parse.toString(),
        fields.string().parse.toString()
    );
    test.done();
};

exports['password toHTML'] = function (test) {
    test.equals(
        fields.password().toHTML.toString(),
        fields.string().toHTML.toString()
    );
    test.done();
};

testField('url');

exports['url parse'] = function (test) {
    test.equals(
        fields.url().parse.toString(),
        fields.string().parse.toString()
    );
    test.done();
};

exports['url toHTML'] = function (test) {
    test.equals(
        fields.url().toHTML.toString(),
        fields.string().toHTML.toString()
    );
    test.done();
};

exports['url validators'] = function (test) {
    test.equals(
        fields.url().validators[0].toString(),
        forms.validators.url().toString()
    );
    var fn1 = function () { return 'one'; },
        fn2 = function () { return 'two'; },
        f = fields.url({validators: [fn1, fn2]});
    test.equals(
        f.validators[0].toString(),
        forms.validators.url().toString()
    );
    test.same(f.validators.slice(1), [fn1, fn2]);
    test.done();
};

testField('date');

exports['date parse'] = function (test) {
    test.equals(
        fields.date().parse.toString(),
        fields.string().parse.toString()
    );
    test.done();
};

exports['date toHTML'] = function (test) {
    test.equals(
        fields.date().toHTML.toString(),
        fields.string().toHTML.toString()
    );
    test.done();
};

exports['date validators'] = function (test) {
    test.equals(
        fields.date().validators[0].toString(),
        forms.validators.date().toString()
    );
    var fn1 = function () { return 'one'; },
        fn2 = function () { return 'two'; },
        f = fields.date({validators: [fn1, fn2]});
    test.equals(
        f.validators[0].toString(),
        forms.validators.date().toString()
    );
    test.same(f.validators.slice(1), [fn1, fn2]);
    test.done();
};

testField('array');

exports['array parse'] = function (test) {
    test.same(fields.array().parse(), []);
    test.same(fields.array().parse(null), [null]);
    test.same(fields.array().parse(0), [0]);
    test.same(fields.array().parse(''), ['']);
    test.same(fields.array().parse('abc'), ['abc']);
    test.same(fields.array().parse(['one', 'two', 'three']), ['one', 'two', 'three']);
    test.done();
};

exports['array toHTML'] = function (test) {
    test.equals(
        fields.array().toHTML.toString(),
        fields.string().toHTML.toString()
    );
    test.done();
};

