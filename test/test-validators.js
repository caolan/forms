/*jslint node: true */
'use strict';
var validators = require('../lib/forms').validators;
var async = require('async');
var test = require('tape');

test('matchField', function (test) {
    var v = validators.matchField('field1', 'f2 dnm %s'),
        data = {
            fields: {
                field1: {data: 'one'},
                field2: {data: 'two'}
            }
        };
    v(data, data.fields.field2, function (err) {
        test.equal(err, 'f2 dnm field1');
        data.fields.field2.data = 'one';
        v(data, data.fields.field2, function (err) {
            test.equal(err, undefined);
            test.end();
        });
    });
});

test('required', function (test) {
    var v = validators.required(),
        emptyFields = { field: { name: 'field', data: '' } },
        whitespaceFields = { field: { name: 'field', data: '  ' } },
        filledFields = { field: { name: 'field', data: 'foo' } };
    v({ fields: emptyFields }, emptyFields.field, function (err) {
        test.equal(err, 'field is required.');
        v({ fields: whitespaceFields }, whitespaceFields.field, function (err) {
            test.equal(err, 'field is required.');
            v({ fields: filledFields }, filledFields.field, function (err) {
                test.equal(err, undefined);
                test.end();
            });
        });
    });
});

test('requiresFieldIfEmpty', function (test) {
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
        test.equal(err, 'field 1: field field2: alternate_field');
        v({ fields: filled_fields }, filled_fields.field, function (err) {
            test.equal(err, undefined);
            v({ fields: first_filled }, first_filled.field, function (err) {
                test.equal(err, undefined);
                v({ fields: second_filled }, second_filled.field, function (err) {
                    test.equal(err, undefined);
                    test.end();
                });
            });
        });
    });
});

test('min', function (test) {
    validators.min(100, 'Value must be greater than or equal to %s.')('form', {data: 50}, function (err) {
        test.equal(err, 'Value must be greater than or equal to 100.');
        validators.min(100)('form', {data: 100}, function (err) {
            test.equal(err, undefined);
            test.end();
        });
    });
});

test('max', function (test) {
    validators.max(100, 'Value must be less than or equal to %s.')('form', {data: 150}, function (err) {
        test.equal(err, 'Value must be less than or equal to 100.');
        validators.max(100)('form', {data: 100}, function (err) {
            test.equal(err, undefined);
            test.end();
        });
    });
});

test('range', function (test) {
    validators.range(10, 20, 'Value must be between %s and %s.')('form', {data: 50}, function (err) {
        test.equal(err, 'Value must be between 10 and 20.');
        validators.range(10, 20)('form', {data: 15}, function (err) {
            test.equal(err, undefined);
            test.end();
        });
    });
});

test('regexp', function (test) {
    validators.regexp(/^\d+$/)('form', {data: 'abc123'}, function (err) {
        test.equal(err, 'Invalid format.');
        validators.regexp(/^\d+$/)('form', {data: '123'}, function (err) {
            test.equal(err, undefined);
            var v = validators.regexp('^\\d+$', 'my message');
            v('form', {data: 'abc123'}, function (err) {
                test.equal(err, 'my message');
                test.end();
            });
        });
    });
});

test('email', function (test) {
    validators.email('Email was invalid.')('form', {data: 'asdf'}, function (err) {
        test.equal(err, 'Email was invalid.');
        validators.email()('form', {data: 'asdf@asdf.com'}, function (err) {
            test.equal(err, undefined);
            validators.email()('form', {data: 'a←+b@f.museum'}, function (err) {
                test.equal(err, undefined);
                test.end();
            });
        });
    });
});

test('url', function (test) {
    async.parallel([
        function (callback) {
            validators.url(false, 'URL was invalid.')('form', {data: 'asdf.com'}, function (err) {
                test.equal(err, 'URL was invalid.');
                validators.url()('form', {data: 'http://asdf.com'}, function (err) {
                    test.equal(err, undefined);
                    callback();
                });
            });
        },
        function (callback) {
            validators.url(true)('form', {data: 'localhost/test.html'}, function (err) {
                test.equal(err, 'Please enter a valid URL.');
                validators.url(true)('form', {data: 'http://localhost/test.html'}, function (err) {
                    test.equal(err, undefined);
                    callback();
                });
            });
        }
    ], test.end);
});

test('date', function (test) {
    async.parallel([
        function (callback) {
            validators.date('Date input must contain a valid date.')('form', {data: '02/28/2012'}, function (err) {
                test.equal(err, 'Date input must contain a valid date.');
                validators.date()('form', {data: '2012-02-28'}, function (err) {
                    test.equal(err, undefined);
                    callback();
                });
            });
        },
        function (callback) {
            validators.date()('form', {data: '2012.02.30'}, function (err) {
                test.equal(err, 'Inputs of type "date" must be valid dates in the format "yyyy-mm-dd"');
                validators.date()('form', {data: '2012-02-30'}, function (err) {
                    test.equal(err, undefined);
                    callback();
                });
            });
        }
    ], test.end);
});

test('minlength', function (test) {
    validators.minlength(5, 'Enter at least %s characters.')('form', {data: '1234'}, function (err) {
        test.equal(err, 'Enter at least 5 characters.');
        validators.minlength(5)('form', {data: '12345'}, function (err) {
            test.equal(err, undefined);
            test.end();
        });
    });
});

test('maxlength', function (test) {
    validators.maxlength(5)('form', {data: '123456'}, function (err) {
        test.equal(err, 'Please enter no more than 5 characters.');
        validators.maxlength(5)('form', {data: '12345'}, function (err) {
            test.equal(err, undefined);
            test.end();
        });
    });
});

test('rangelength', function (test) {
    async.parallel([
        function (callback) {
            validators.rangelength(2, 4, 'Enter between %s and %s characters.')('form', {data: '12345'}, function (err) {
                test.equal(err, 'Enter between 2 and 4 characters.');
                callback();
            });
        },
        function (callback) {
            validators.rangelength(2, 4)('form', {data: '1'}, function (err) {
                test.equal(err, 'Please enter a value between 2 and 4 characters long.');
                callback();
            });
        },
        function (callback) {
            validators.rangelength(2, 4)('form', {data: '12'}, function (err) {
                test.equal(err, undefined);
                callback();
            });
        },
        function (callback) {
            validators.rangelength(2, 4)('form', {data: '1234'}, function (err) {
                test.equal(err, undefined);
                callback();
            });
        }
    ], test.end);
});

test('color', function (test) {
    var valids = ['#ABC', '#DEF123', '#ABCDEF12', '#01234567', '#890'],
        invalids = ['ABC', 'DEF123', '#ABCDEG', '#0123.3', null, true, false],
        tests = [].concat(
            valids.map(function (data) {
                return function (callback) {
                    validators.color()('form', {data: data}, function (err) {
                        test.equal(err, undefined);
                        callback();
                    });
                };
            }),
            invalids.map(function (data) {
                return function (callback) {
                    validators.color('Color inputs require hex notation.')('form', {data: data}, function (err) {
                        test.equal(err, 'Color inputs require hex notation.');
                        callback();
                    });
                };
            })
        );
	test.plan(tests.length + 1);
    async.parallel(tests, test.end);
});

test('alphanumeric', function (test) {
    function makeTest(message, data, expected) {
        return function (callback) {
            validators.alphanumeric(message)('form', {data: data}, function(err) {
                test.equal(err, expected);
                callback();
            });
        };
    }

    var tests = [
        makeTest(undefined, 'asdf', undefined),
        makeTest(undefined, '278', undefined),
        makeTest(undefined, '%', 'Letters and numbers only.'),
        makeTest(' qwer', 'a a', ' qwer'),
        makeTest('_r ', ' 1 ', '_r ')
    ];
	test.plan(tests.length + 1);

    async.parallel(tests, test.end);
});

