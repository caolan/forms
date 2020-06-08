'use strict';

var forms = require('../lib/forms');
var is = require('is');
var http = require('http');
var test = require('tape');
var keys = require('object-keys');

test('bind', function (t) {
    t.plan(12);
    var form = forms.create({
        field1: forms.fields.string(),
        field2: forms.fields.string({
            validators: [function (formObject, field, callback) {
                t.fail('validators should not be called');
                callback(new Error('validation error'));
            }]
        })
    });
    // unbound
    t.equal(form.isValid, undefined);

    // bound
    var f = form.bind({ field1: 'data one', field2: 'data two' });
    t.equal(f.fields.field1.value, 'data one');
    t.equal(f.fields.field1.data, 'data one');
    t.equal(f.fields.field1.error, undefined);
    t.equal(f.fields.field2.value, 'data two');
    t.equal(f.fields.field2.data, 'data two');
    t.equal(f.fields.field2.error, undefined);

    t.ok(is.fn(f.isValid), 'isValid is a function');
    t.equal(f.bind, undefined);
    t.equal(f.handle, undefined);

    t.deepEqual(f.data, { field1: 'data one', field2: 'data two' });
    t.notEqual(form, f, 'bind returns new form object');

    t.end();
});

test('bind with missing field in data keeps field in form', function (t) {
    t.plan(12);
    var form = forms.create({
        field1: forms.fields.string(),
        field2: forms.fields.string()
    });
    // unbound
    t.equal(form.isValid, undefined);

    // bound
    var f = form.bind({ field1: 'data one' });
    t.equal(f.fields.field1.value, 'data one');
    t.equal(f.fields.field1.data, 'data one');
    t.equal(f.fields.field1.error, undefined);
    t.equal(f.fields.field2.value, undefined);
    t.equal(f.fields.field2.data, '');
    t.equal(f.fields.field2.error, undefined);

    t.ok(is.fn(f.isValid), 'isValid is function');
    t.equal(f.bind, undefined);
    t.equal(f.handle, undefined);

    t.deepEqual(f.data, { field1: 'data one', field2: '' });
    t.notEqual(form, f, 'bind returns new form object');

    t.end();
});

test('validate', function (t) {
    t.plan(11);
    var form = forms.create({
        field1: forms.fields.string(),
        field2: forms.fields.string({
            validators: [function (formObject, field, callback) {
                t.equal(field.data, 'data two');
                t.equal(field.value, 'data two');
                callback('validation error');
            }]
        })
    });
    var data = { field1: 'data one', field2: 'data two' };
    form.bind(data).validate(function (err, f) {
        t.equal(f.fields.field1.value, 'data one');
        t.equal(f.fields.field1.data, 'data one');
        t.equal(f.fields.field1.error, undefined);
        t.equal(f.fields.field2.value, 'data two');
        t.equal(f.fields.field2.data, 'data two');
        t.equal(f.fields.field2.error, 'validation error');

        t.deepEqual(f.data, { field1: 'data one', field2: 'data two' });
        t.notEqual(form, f, 'bind returns new form object');

        t.notOk(f.isValid());
        t.end();
    });
});

test('validate form with only optional booleans', function (t) {
    var form = forms.create({
        field1: forms.fields['boolean'](),
        field2: forms.fields['boolean'](),
        field3: forms.fields['boolean'](),
        field4: forms.fields['boolean']()
    });

    var data = { field1: 'truthy', field2: 0, field3: true };
    form.bind(data).validate(function (err, f) {
        t.equal(f.fields.field1.value, 'truthy');
        t.equal(f.fields.field1.data, true);
        t.equal(f.fields.field1.error, undefined);
        t.equal(f.fields.field2.value, 0);
        t.equal(f.fields.field2.data, false);
        t.equal(f.fields.field3.value, true);
        t.equal(f.fields.field3.data, true);

        t.deepEqual(f.data, { field1: true, field2: false, field3: true, field4: false });
        t.notEqual(form, f, 'bind returns new form object');

        t.ok(f.isValid());
        t.end();
    });
});

test('validate valid data', function (t) {
    t.plan(2);
    var form = forms.create({
        field1: forms.fields.string(),
        field2: forms.fields.string(),
        field3: forms.fields.string()
    });
    form.bind({ field1: '1', field2: '2', field3: 0 }).validate(function (err, f) {
        t.ok(f.isValid());
        t.equal(
            f.toHTML(),
            '<div class="field">'
                + '<label for="id_field1">Field1</label>'
                + '<input type="text" name="field1" id="id_field1" value="1" />'
            + '</div>'
            + '<div class="field">'
                + '<label for="id_field2">Field2</label>'
                + '<input type="text" name="field2" id="id_field2" value="2" />'
            + '</div>'
            + '<div class="field">'
                + '<label for="id_field3">Field3</label>'
                + '<input type="text" name="field3" id="id_field3" value="0" />'
            + '</div>'
        );
        t.end();
    });
});

test('validate invalid data', function (t) {
    t.plan(2);
    var formObject = forms.create({
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
    formObject.bind({ field1: '1', field2: '2' }).validate(function (err, f) {
        t.equal(f.isValid(), false);
        t.equal(
            f.toHTML(),
            '<div class="field error">'
                + '<p class="error_msg">validation error 1</p>'
                + '<label for="id_field1">Field1</label>'
                + '<input type="text" name="field1" id="id_field1" value="1" />'
            + '</div>'
            + '<div class="field error">'
                + '<p class="error_msg">validation error 2</p>'
                + '<label for="id_field2">Field2</label>'
                + '<input type="text" name="field2" id="id_field2" value="2" />'
            + '</div>'
        );
        t.end();
    });
});

test('handle empty', function (t) {
    t.plan(3);
    var f = forms.create({ field1: forms.fields.string() });
    f.bind = function () {
        t.fail('bind should not be called');
    };
    f.handle(undefined, {
        empty: function (form) {
            t.ok(true, 'empty called');
            t.equal(form, f);
        },
        success: function () {
            t.fail('success should not be called');
        },
        error: function () {
            t.fail('error should not be called');
        },
        other: function () {
            t.fail('other should not be called');
        }
    });
    f.handle(null, {
        other: function () {
            t.ok(true, 'other called');
        }
    });
    t.end();
});

test('handle success', function (t) {
    t.plan(8);
    var f = forms.create({ field1: forms.fields.string() });
    var callOrder = [];
    f.bind = function () {
        callOrder.push('bind');
        t.ok(true, 'bind called');
        f.isValid = function () { return true; };
        return f;
    };
    f.validate = function (callback) {
        t.ok(true, 'validate called');
        callback(null, f);
    };
    f.handle({ field1: 'test' }, {
        empty: function () {
            t.fail('empty should not be called');
        },
        success: function (form) {
            t.ok(true, 'success called');
            t.equal(form, f);
        },
        error: function () {
            t.fail('error should not be called');
        },
        other: function () {
            t.fail('other should not be called');
        }
    });
    f.handle({ field1: 'test' }, {
        other: function () {
            t.ok(true, 'other called');
            t.equal(callOrder.length, 2);
            t.end();
        }
    });
});

test('handle empty object', function (t) {
    t.plan(3);
    var f = forms.create({ field1: forms.fields.string() });
    f.bind = function () {
        t.ok(true, 'bind called');
        f.fields.field1.error = 'some error';
        f.isValid = function () { return false; };
        return f;
    };
    f.validate = function (callback) {
        t.ok(true, 'validate called');
        callback(null, f);
    };
    f.handle({}, {
        empty: function (form) {
            t.ok(true, 'empty called');
            t.equal(form, f);
        },
        success: function () {
            t.fail('success should not be called');
        },
        error: function () {
            t.fail('error should not be called');
        },
        other: function () {
            t.fail('other should not be called');
        }
    });
    f.handle({}, {
        other: function () {
            t.ok(true, 'other called');
        }
    });
    t.end();
});

test('handle sends callbacks', function (t) {
    t.plan(9);
    var f = forms.create({ field1: forms.fields.string() });

    f.bind = function () {
        f.isValid = function () { return true; };
        return f;
    };
    f.validate = function (callback) {
        callback(null, f);
    };
    f.handle({}, {
        empty: function testing(form, callbacks) {
            t.equal(keys(callbacks).length, 1);
            t.equal(typeof callbacks.empty, 'function');
        }
    });
    f.handle({ field1: 'test' }, {
        success: function testing(form, callbacks) {
            t.equal(keys(callbacks).length, 1);
            t.equal(typeof callbacks.success, 'function');
        }
    });

    f.bind = function () {
        f.isValid = function () { return false; };
        return f;
    };
    f.handle({ field1: 'test' }, {
        success: function yay() {},
        error: function nay(form, callbacks) {
            t.equal(keys(callbacks).length, 2);
            t.equal(typeof callbacks.success, 'function');
            t.equal(typeof callbacks.error, 'function');
        }
    });

    f.handle({ field1: 'test' }, {
        other: function testing(form, callbacks) {
            t.equal(keys(callbacks).length, 1);
            t.equal(typeof callbacks.other, 'function');
        }
    });

    t.end();
});

test('handle missing multi-form section', function (t) {
    t.plan(1);
    var f = forms.create({
        section1: { field1: forms.fields.string() },
        section2: { field1: forms.fields.string() }
    });
    f.bind({ section1: { field1: 'string' } });
    t.ok(true, 'Form handled missing section ok.');
});

test('handle error', function (t) {
    t.plan(5);
    var f = forms.create({ field1: forms.fields.string() });
    f.bind = function () {
        t.ok(true, 'bind called');
        f.fields.field1.error = 'some error';
        f.isValid = function () { return false; };
        return f;
    };
    f.validate = function (callback) {
        t.ok(true, 'validate called');
        callback(null, f);
    };
    f.handle({ foo: 'bar' }, {
        empty: function () {
            t.fail('empty should not be called');
        },
        success: function () {
            t.fail('success should not be called');
        },
        error: function (form) {
            t.ok(true, 'error called');
            t.equal(form, f);
        },
        other: function () {
            t.fail('other should not be called');
        }
    });
    f.handle({}, {
        other: function () {
            t.ok(true, 'other called');
        }
    });
    t.end();
});

test('handle ServerRequest GET', function (t) {
    t.plan(1);
    var f = forms.create({ field1: forms.fields.string() }),
        req = new http.IncomingMessage();
    req.method = 'GET';
    req.url = '/?field1=test';
    f.handle(req, {
        success: function (form) {
            t.equal(form.data.field1, 'test');
            t.end();
        }
    });
});

test('handle ServerRequest POST', function (t) {
    t.plan(1);
    var f = forms.create({ field1: forms.fields.string() }),
        req = new http.IncomingMessage();
    req.body = { field1: 'test' };
    req.method = 'POST';
    f.handle(req, {
        success: function (form) {
            t.equal(form.data.field1, 'test');
            t.end();
        }
    });
    req.emit('data', 'field1=test');
    req.emit('end');
});

test('handle ServerRequest PUT', function (t) {
    t.plan(1);
    var f = forms.create({ field1: forms.fields.string() }),
        req = new http.IncomingMessage();
    req.body = { field1: 'test' };
    req.method = 'PUT';
    f.handle(req, {
        success: function (form) {
            t.equal(form.data.field1, 'test');
            t.end();
        }
    });
    req.emit('data', 'field1=test');
    req.emit('end');
});

test('validation stops on first error', function (t) {
    t.plan(3);
    var f = forms.create({
        field1: forms.fields.string({ required: true }),
        field2: forms.fields.string({ required: true }),
        field3: forms.fields.string({ required: true })
    });

    f.handle({ field1: 'test' }, {
        error: function (form) {
            t.equal(form.fields.field1.error, undefined);
            t.equal(form.fields.field2.error, 'Field2 is required.');
            t.equal(form.fields.field3.error, undefined);
            t.end();
        }
    });
});

test('validates past first error with validatePastFirstError option', function (t) {
    t.plan(3);
    var f = forms.create(
        {
            field1: forms.fields.string({ required: true }),
            field2: forms.fields.string({ required: true }),
            field3: forms.fields.string({ required: true })
        },
        { validatePastFirstError: true }
    );

    f.handle({ field1: 'test' }, {
        error: function (form) {
            t.equal(form.fields.field1.error, undefined);
            t.equal(form.fields.field2.error, 'Field2 is required.');
            t.equal(form.fields.field3.error, 'Field3 is required.');
            t.end();
        }
    });
});

test('handle ServerRequest POST with bodyDecoder', function (t) {
    t.plan(1);
    var f = forms.create({ field1: forms.fields.string() }),
        req = new http.IncomingMessage();
    req.body = { field1: 'test' };
    req.method = 'POST';
    f.handle(req, {
        success: function (form) {
            t.equal(form.data.field1, 'test');
            t.end();
        }
    });
});

test('handle ServerRequest PUT with bodyDecoder', function (t) {
    t.plan(1);
    var f = forms.create({ field1: forms.fields.string() }),
        req = new http.IncomingMessage();
    req.body = { field1: 'test' };
    req.method = 'PUT';
    f.handle(req, {
        success: function (form) {
            t.equal(form.data.field1, 'test');
            t.end();
        }
    });
});

test('div', function (t) {
    var f = forms.create({ fieldname: forms.fields.string() });
    t.equal(
        f.toHTML(),
        '<div class="field">'
            + '<label for="id_fieldname">Fieldname</label>'
            + '<input type="text" name="fieldname" id="id_fieldname" />'
        + '</div>'
    );
    t.end();
});

test('div required', function (t) {
    var f = forms.create({ fieldname: forms.fields.string({ required: true }) });
    t.equal(
        f.toHTML(),
        '<div class="field required">'
            + '<label for="id_fieldname">Fieldname</label>'
            + '<input type="text" name="fieldname" id="id_fieldname" />'
        + '</div>'
    );
    t.end();
});

test('div bound', function (t) {
    t.plan(1);
    var form = forms.create({ name: forms.fields.string() });
    form.bind({ name: 'val' }).validate(function (err, f) {
        t.equal(
            f.toHTML(),
            '<div class="field">'
                + '<label for="id_name">Name</label>'
                + '<input type="text" name="name" id="id_name" value="val" />'
            + '</div>'
        );
        t.end();
    });
});

test('div bound error', function (t) {
    t.plan(1);
    var formObject = forms.create({
        field_name: forms.fields.string({
            validators: [function (form, field, callback) {
                callback('validation error');
            }]
        })
    });
    formObject.bind({ field_name: 'val' }).validate(function (err, f) {
        t.equal(
            f.toHTML(),
            '<div class="field error">'
                + '<p class="error_msg">validation error</p>'
                + '<label for="id_field_name">Field name</label>'
                + '<input type="text" name="field_name" id="id_field_name" '
                + 'value="val" />'
            + '</div>'
        );
        t.end();
    });
});
