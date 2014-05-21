/*jslint node: true */
'use strict';
var validators = require('../lib/forms').validators;
var async = require('async');
var test = require('tape');

test('matchField', function (t) {
    var v = validators.matchField('field1', 'f2 dnm %s'),
        data = {
            fields: {
                field1: {data: 'one'},
                field2: {data: 'two'}
            }
        };
    t.plan(2);
    v(data, data.fields.field2, function (err) {
        t.equal(err, 'f2 dnm field1');
        data.fields.field2.data = 'one';
        v(data, data.fields.field2, function (err) {
            t.equal(err, undefined);
            t.end();
        });
    });
});

test('matchValue', function (t) {
    var data = {
        fields: {
            field1: { data: 'one' }
        }
    };

    t.test('passes when matching the value', function (st) {
        var getter = function () { return 'one'; }
        var v = validators.matchValue(getter, 'name: %s | value: %s');
        st.plan(1);
        v(data, data.fields.field1, function (err) {
            st.equal(err, undefined);
            st.end();
        });
    });

    t.test('fails when not matching the value', function (st) {
        var getter = function () { return 'NOPE FAILURE'; }
        var v = validators.matchValue(getter, 'name: %s | value: %s');
        st.plan(1);
        v(data, data.fields.field1, function (err) {
            st.equal(err, 'name: This field | value: NOPE FAILURE');
            st.end();
        });
    });

    t.test('fails when not provided a function', function (st) {
        var nonFunctions = [undefined, null, 42, /a/g, 'foo', [], {}];
        st.plan(nonFunctions.length);
        nonFunctions.forEach(function (nonFunction) {
            st.throws(function () { validators.matchValue(nonFunction); }, TypeError, nonFunction + ' is not a function');
        });
        st.end();
    });

    t.end();
});

test('required', function (t) {
    t.plan(3);
    var v = validators.required();
    var emptyFields = { field: { name: 'field', data: '' } };
    var whitespaceFields = { field: { name: 'field', data: '  ' } };
    var filledFields = { field: { name: 'field', data: 'foo' } };

    v({ fields: emptyFields }, emptyFields.field, function (err) {
        t.equal(err, 'field is required.');
        v({ fields: whitespaceFields }, whitespaceFields.field, function (err) {
            t.equal(err, 'field is required.');
            v({ fields: filledFields }, filledFields.field, function (err) {
                t.equal(err, undefined);
                t.end();
            });
        });
    });
});

test('requiresFieldIfEmpty', function (t) {
    t.plan(4);
    var v = validators.requiresFieldIfEmpty('alternate_field', 'field 1: %s field2: %s'),
        empty_fields = {
            field: {name: 'field', data: ' '},
            alternate_field: {name: 'alternate_field', data: ''}
        },
        filled_fields = {
            field: {name: 'field', data: 'filled'},
            alternate_field: {name: 'alternate_field', data: 'also filled'}
        },
        first_filled = {
            field: {name: 'field', data: 'filled'},
            alternate_field: {name: 'alternate_field', data: ''}
        },
        second_filled = {
            field: {name: 'field', data: ''},
            alternate_field: {name: 'alternate_field', data: 'filled'}
        };
    v({ fields: empty_fields }, empty_fields.field, function (err) {
        t.equal(err, 'field 1: field field2: alternate_field');
        v({ fields: filled_fields }, filled_fields.field, function (err) {
            t.equal(err, undefined);
            v({ fields: first_filled }, first_filled.field, function (err) {
                t.equal(err, undefined);
                v({ fields: second_filled }, second_filled.field, function (err) {
                    t.equal(err, undefined);
                    t.end();
                });
            });
        });
    });
});

test('min', function (t) {
    t.plan(2);
    validators.min(100, 'Value must be greater than or equal to %s.')('form', {data: 50}, function (err) {
        t.equal(err, 'Value must be greater than or equal to 100.');
        validators.min(100)('form', {data: 100}, function (err) {
            t.equal(err, undefined);
            t.end();
        });
    });
});

test('max', function (t) {
    t.plan(2);
    validators.max(100, 'Value must be less than or equal to %s.')('form', {data: 150}, function (err) {
        t.equal(err, 'Value must be less than or equal to 100.');
        validators.max(100)('form', {data: 100}, function (err) {
            t.equal(err, undefined);
            t.end();
        });
    });
});

test('range', function (t) {
    t.plan(2);
    validators.range(10, 20, 'Value must be between %s and %s.')('form', {data: 50}, function (err) {
        t.equal(err, 'Value must be between 10 and 20.');
        validators.range(10, 20)('form', {data: 15}, function (err) {
            t.equal(err, undefined);
            t.end();
        });
    });
});

test('regexp', function (t) {
    t.plan(3);
    validators.regexp(/^\d+$/)('form', {data: 'abc123'}, function (err) {
        t.equal(err, 'Invalid format.');
        validators.regexp(/^\d+$/)('form', {data: '123'}, function (err) {
            t.equal(err, undefined);
            var v = validators.regexp('^\\d+$', 'my message');
            v('form', {data: 'abc123'}, function (err) {
                t.equal(err, 'my message');
                t.end();
            });
        });
    });
});

test('email', function (t) {
    t.plan(3);
    validators.email('Email was invalid.')('form', {data: 'asdf'}, function (err) {
        t.equal(err, 'Email was invalid.');
        var v = validators.email();
        v('form', {data: 'asdf@asdf.com'}, function (err) {
            t.equal(err, undefined);
            v('form', {data: 'a←+b@f.museum'}, function (err) {
                t.equal(err, undefined);
                t.end();
            });
        });
    });
});

test('url', function (t) {
    t.plan(4);
    validators.url(false, 'URL was invalid.')('form', {data: 'asdf.com'}, function (err) {
        t.equal(err, 'URL was invalid.');
        validators.url()('form', {data: 'http://asdf.com'}, function (err) {
            t.equal(err, undefined);
        });
    });
    validators.url(true)('form', {data: 'localhost/test.html'}, function (err) {
        t.equal(err, 'Please enter a valid URL.');
        validators.url(true)('form', {data: 'http://localhost/test.html'}, function (err) {
            t.equal(err, undefined);
        });
    });
    t.end();
});

test('date', function (t) {
    t.plan(4);
    validators.date('Date input must contain a valid date.')('form', {data: '02/28/2012'}, function (err) {
        t.equal(err, 'Date input must contain a valid date.');
        validators.date()('form', {data: '2012-02-28'}, function (err) {
            t.equal(err, undefined);
        });
    });
    validators.date()('form', {data: '2012.02.30'}, function (err) {
        t.equal(err, 'Inputs of type "date" must be valid dates in the format "yyyy-mm-dd"');
        validators.date()('form', {data: '2012-02-30'}, function (err) {
            t.equal(err, undefined);
        });
    });
    t.end();
});

test('minlength', function (t) {
    t.plan(2);
    validators.minlength(5, 'Enter at least %s characters.')('form', {data: '1234'}, function (err) {
        t.equal(err, 'Enter at least 5 characters.');
        validators.minlength(5)('form', {data: '12345'}, function (err) {
            t.equal(err, undefined);
            t.end();
        });
    });
});

test('maxlength', function (t) {
    t.plan(2);
    validators.maxlength(5)('form', {data: '123456'}, function (err) {
        t.equal(err, 'Please enter no more than 5 characters.');
        validators.maxlength(5)('form', {data: '12345'}, function (err) {
            t.equal(err, undefined);
            t.end();
        });
    });
});

test('rangelength', function (t) {
    t.plan(4);
    validators.rangelength(2, 4, 'Enter between %s and %s characters.')('form', {data: '12345'}, function (err) {
        t.equal(err, 'Enter between 2 and 4 characters.');
    });
    validators.rangelength(2, 4)('form', {data: '1'}, function (err) {
        t.equal(err, 'Please enter a value between 2 and 4 characters long.');
    });
    validators.rangelength(2, 4)('form', {data: '12'}, function (err) {
        t.equal(err, undefined);
    });
    validators.rangelength(2, 4)('form', {data: '1234'}, function (err) {
        t.equal(err, undefined);
    });
    t.end();
});

test('color', function (t) {
    t.test('valid colors', function (st) {
        var v = validators.color();
        var valids = ['#ABC', '#DEF123', '#ABCDEF12', '#01234567', '#890'];
        st.plan(valids.length);
        valids.forEach(function (color) {
            v('form', { data: color }, function (err) {
                st.equal(err, undefined);
            });
        });
        st.end();
    });

    t.test('invalid colors', function (st) {
        var invalids = ['ABC', 'DEF123', '#ABCDEG', '#0123.3', null, true, false];
        st.plan(invalids.length);
        var msg = 'Color inputs require hex notation.';
        var v = validators.color(msg);
        invalids.forEach(function (color) {
            v('form', { data: color }, function (err) {
                st.equal(err, msg);
            });
        });
        st.end();
    });

    t.end();
});

test('alphanumeric', function (t) {
    var v = validators.alphanumeric();

    t.test('valid input', function (st) {
        var valids = ['asdf', '278', '123abc'];
        st.plan(valids.length);
        valids.forEach(function (input) {
            v('form', { data: input }, function (err) {
                st.equal(err, undefined);
            });
        });
        st.end();
    });

    t.test('valid with extra spaces', function (st) {
        var almostValids = [' qwer', ' 1 ', 'abc123 '];
        st.plan(almostValids.length);
        almostValids.forEach(function (input) {
            v('form', { data: input }, function (err) {
                st.equal(err, 'Letters and numbers only.');
            });
        });
        st.end();
    });

    t.test('invalid', function (st) {
        var invalids = ['d%d', 'c!c', 'b_b', 'a-a'];
        st.plan(invalids.length);
        invalids.forEach(function (input) {
            v('form', { data: input }, function (err) {
                st.equal(err, 'Letters and numbers only.');
            });
        });
        st.end();
    });

    t.end();
});

test('nonFormatMessage1', function (t) {
    t.plan(2);
    var v = validators.matchField('field1', 'f2 dnm f1'),
        data = {
            fields: {
                field1: {data: 'one'},
                field2: {data: 'two'}
            }
        };
    v(data, data.fields.field2, function (err) {
        t.equals(err, 'f2 dnm f1');
        data.fields.field2.data = 'one';
        v(data, data.fields.field2, function (err) {
            t.equals(err, undefined);
            t.end();
        });
    });
});

test('nonFormatMessage2', function (t) {
    t.plan(2);
    var v = validators.min(100, '1234567890');
    v('form', {data: 50}, function (err) {
        t.equals(err, '1234567890');
        validators.min(100)('form', {data: 100}, function (err) {
            t.equals(err, undefined);
            t.end();
        });
    });
});

test('nonFormatMessage3', function (t) {
    t.plan(2);
    var v = validators.minlength(5, 'qwertyuiop');
    v('form', {data: '1234'}, function (err) {
        t.equals(err, 'qwertyuiop');
        validators.minlength(5)('form', {data: '12345'}, function (err) {
            t.equals(err, undefined);
            t.end();
        });
    });
});


test('integer', function (t) {
    var v = validators.integer();

    t.test('valid integers', function (st) {
        var valids = ['1', '10', '-1', '-10', '-10'];

        st.plan(valids.length);
        valids.forEach(function (input) {
            v('form', { data: input }, function (err) {
                st.equal(err, undefined);
            });
        });
        st.end();
    });

    t.test('invalid integers', function (st) {
        var invalids = ['1.5', 'one', '1,5', 'FFFFF', '+10'];
        var msg = 'Please enter an integer value.';

        st.plan(invalids.length);

        invalids.forEach(function (input) {
            v('form', { data: input }, function (err) {
                st.equal(err, msg);
            });
        });
        st.end();
    });

    t.end();
});

test('digits', function (t) {
    var v = validators.digits();

    t.test('valid digits', function (st) {
        var valids = ['1', '10', '100'];

        st.plan(valids.length);
        valids.forEach(function (input) {
            v('form', { data: input }, function (err) {
                st.equal(err, undefined);
            });
        });
        st.end();
    });

    t.test('invalid digits', function (st) {
        var invalids = ['-1', '+10', 'one', '1.5'];
        var msg = 'Numbers only.';

        st.plan(invalids.length);

        invalids.forEach(function (input) {
            v('form', { data: input }, function (err) {
                st.equal(err, msg);
            });
        });
        st.end();
    });

    t.end();
});

