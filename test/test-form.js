/*jslint node: true */
'use strict';
var forms = require('../lib/forms');
var http = require('http');
var test = require('tape');

test('bind', function (test) {
    var form = forms.create({
        field1: forms.fields.string(),
        field2: forms.fields.string({
            validators: [function (form, field, callback) {
                test.ok(false, 'validators should not be called');
                callback(new Error('validation error'));
            }]
        })
    });
    // unbound
    test.equal(form.isValid, undefined);

    // bound
    var f = form.bind({field1: 'data one', field2: 'data two'});
    test.equal(f.fields.field1.value, 'data one');
    test.equal(f.fields.field1.data, 'data one');
    test.equal(f.fields.field1.error, undefined);
    test.equal(f.fields.field2.value, 'data two');
    test.equal(f.fields.field2.data, 'data two');
    test.equal(f.fields.field2.error, undefined);

    test.ok(f.isValid instanceof Function);
    test.equal(f.bind, undefined);
    test.equal(f.handle, undefined);

    test.deepEqual(f.data, {field1: 'data one', field2: 'data two'});
    test.ok(form !== f, 'bind returns new form object');

    test.end();
});

test('validate', function (test) {
    var form = forms.create({
        field1: forms.fields.string(),
        field2: forms.fields.string({
            validators: [function (form, field, callback) {
                test.equal(field.data, 'data two');
                test.equal(field.value, 'data two');
                callback('validation error');
            }]
        })
    });
    var data = {field1: 'data one', field2: 'data two'};
    form.bind(data).validate(function (err, f) {
        test.equal(f.fields.field1.value, 'data one');
        test.equal(f.fields.field1.data, 'data one');
        test.equal(f.fields.field1.error, undefined);
        test.equal(f.fields.field2.value, 'data two');
        test.equal(f.fields.field2.data, 'data two');
        test.equal(f.fields.field2.error, 'validation error');

        test.deepEqual(f.data, {field1: 'data one', field2: 'data two'});
        test.ok(form !== f, 'bind returns new form object');

        test.notOk(f.isValid());
        test.end();
    });
});

test('validate valid data', function (test) {
    var f = forms.create({
        field1: forms.fields.string(),
        field2: forms.fields.string()
    });
    f.bind({field1: '1', field2: '2'}).validate(function (err, f) {
        test.true(f.isValid());
        test.equal(
            f.toHTML(),
            '<div class="field">' +
                '<label for="id_field1">Field1</label>' +
                '<input type="text" name="field1" id="id_field1" value="1" />' +
            '</div>' +
            '<div class="field">' +
                '<label for="id_field2">Field2</label>' +
                '<input type="text" name="field2" id="id_field2" value="2" />' +
            '</div>'
        );
        test.end();
    });
});

test('validate invalid data', function (test) {
    var f = forms.create({
        field1: forms.fields.string({
            validators: [function (form, field, callback) {
                callback('validation error 1');
            }]
        }),
        field2: forms.fields.string({
            validators: [function (form, field, callback) {
                callback('validation error 2');
            }]
        })
    });
    f.bind({field1: '1', field2: '2'}).validate(function (err, f) {
        test.equal(f.isValid(), false);
        test.equal(
            f.toHTML(),
            '<div class="field error">' +
                '<p class="error_msg">validation error 1</p>' +
                '<label for="id_field1">Field1</label>' +
                '<input type="text" name="field1" id="id_field1" value="1" />' +
            '</div>' +
            '<div class="field error">' +
                '<p class="error_msg">validation error 2</p>' +
                '<label for="id_field2">Field2</label>' +
                '<input type="text" name="field2" id="id_field2" value="2" />' +
            '</div>'
        );
        test.end();
    });
});

test('handle empty', function (test) {
    test.plan(3);
    var f = forms.create({field1: forms.fields.string()});
    f.bind = function () {
        test.ok(false, 'bind should not be called');
    };
    f.handle(undefined, {
        empty: function (form) {
            test.ok(true, 'empty called');
            test.equal(form, f);
        },
        success: function (form) {
            test.ok(false, 'success should not be called');
        },
        error: function (form) {
            test.ok(false, 'error should not be called');
        },
        other: function (form) {
            test.ok(false, 'other should not be called');
        }
    });
    f.handle(null, {
        other: function (form) {
            test.ok(true, 'other called');
        }
    });
    setTimeout(test.end, 50);
});

test('handle success', function (test) {
    test.plan(7);
    var f = forms.create({field1: forms.fields.string()}),
        call_order = [];
    f.bind = function (raw_data) {
        call_order.push('bind');
        test.ok(true, 'bind called');
        f.isValid = function () { return true; };
        return f;
    };
    f.validate = function (callback) {
        test.ok(true, 'validate called');
        callback(null, f);
    };
    f.handle({field1: 'test'}, {
        empty: function (form) {
            test.ok(false, 'empty should not be called');
        },
        success: function (form) {
            test.ok(true, 'success called');
            test.equal(form, f);
        },
        error: function (form) {
            test.ok(false, 'error should not be called');
        },
        other: function (form) {
            test.ok(false, 'other should not be called');
        }
    });
    f.handle({field1: 'test'}, {
        other: function (form) {
            test.ok(true, 'other called');
            test.end();
        }
    });
});

test('handle empty object', function (test) {
    test.plan(3);
    var f = forms.create({field1: forms.fields.string()});
    f.bind = function (raw_data, callback) {
        test.ok(true, 'bind called');
        f.fields.field1.error = 'some error';
        f.isValid = function () { return false; };
        return f;
    };
    f.validate = function (callback) {
        test.ok(true, 'validate called');
        callback(null, f);
    };
    f.handle({}, {
        empty: function (form) {
            test.ok(true, 'empty called');
            test.equal(form, f);
        },
        success: function (form) {
            test.ok(false, 'success should not be called');
        },
        error: function (form) {
            test.ok(false, 'error should not be called');
        },
        other: function (form) {
            test.ok(false, 'other should not be called');
        }
    });
    f.handle({}, {
        other: function (form) {
            test.ok(true, 'other called');
        }
    });
    setTimeout(test.end, 50);
});

test('handle error', function (test) {
    test.plan(5);
    var f = forms.create({field1: forms.fields.string()});
    f.bind = function (raw_data, callback) {
        test.ok(true, 'bind called');
        f.fields.field1.error = 'some error';
        f.isValid = function () { return false; };
        return f;
    };
    f.validate = function (callback) {
        test.ok(true, 'validate called');
        callback(null, f);
    };
    f.handle({foo: 'bar'}, {
        empty: function (form) {
            test.ok(false, 'empty should not be called');
        },
        success: function (form) {
            test.ok(false, 'success should not be called');
        },
        error: function (form) {
            test.ok(true, 'error called');
            test.equal(form, f);
        },
        other: function (form) {
            test.ok(false, 'other should not be called');
        }
    });
    f.handle({}, {
        other: function (form) {
            test.ok(true, 'other called');
        }
    });
    setTimeout(test.end, 50);
});

test('handle ServerRequest GET', function (test) {
    var f = forms.create({field1: forms.fields.string()}),
        req = new http.IncomingMessage();
    req.method = 'GET';
    req.url = '/?field1=test';
    f.handle(req, {
        success: function (form) {
            test.equal(form.data.field1, 'test');
            test.end();
        }
    });
});

test('handle ServerRequest POST', function (test) {
    var f = forms.create({field1: forms.fields.string()}),
        req = new http.IncomingMessage();
    req.body = {field1: 'test'};
    req.method = 'POST';
    f.handle(req, {
        success: function (form) {
            test.equal(form.data.field1, 'test');
            test.end();
        }
    });
    req.emit('data', 'field1=test');
    req.emit('end');
});

test('handle ServerRequest POST with bodyDecoder', function (test) {
    var f = forms.create({field1: forms.fields.string()}),
        req = new http.IncomingMessage();
    req.body = {field1: 'test'};
    req.method = 'POST';
    f.handle(req, {
        success: function (form) {
            test.equal(form.data.field1, 'test');
            test.end();
        }
    });
});

test('div', function (test) {
    var f = forms.create({fieldname: forms.fields.string()});
    test.equal(
        f.toHTML(),
        '<div class="field">' +
            '<label for="id_fieldname">Fieldname</label>' +
            '<input type="text" name="fieldname" id="id_fieldname" />' +
        '</div>'
    );
    test.end();
});

test('div required', function (test) {
    var f = forms.create({
        fieldname: forms.fields.string({required: true})
    });
    test.equal(
        f.toHTML(),
        '<div class="field required">' +
            '<label for="id_fieldname">Fieldname</label>' +
            '<input type="text" name="fieldname" id="id_fieldname" />' +
        '</div>'
    );
    test.end();
});

test('div bound', function (test) {
    test.plan(1);
    var f = forms.create({name: forms.fields.string()});
    f.bind({name: 'val'}).validate(function (err, f) {
        test.equal(
            f.toHTML(),
            '<div class="field">' +
                '<label for="id_name">Name</label>' +
                '<input type="text" name="name" id="id_name" value="val" />' +
            '</div>'
        );
        test.end();
    });
});

test('div bound error', function (test) {
    test.plan(1);
    var f = forms.create({
        field_name: forms.fields.string({
            validators: [function (form, field, callback) {
                callback('validation error');
            }]
        })
    });
    f.bind({field_name: 'val'}).validate(function (err, f) {
        test.equal(
            f.toHTML(),
            '<div class="field error">' +
                '<p class="error_msg">validation error</p>' +
                '<label for="id_field_name">Field name</label>' +
                '<input type="text" name="field_name" id="id_field_name" ' +
                'value="val" />' +
            '</div>'
        );
        test.end();
    });
});

