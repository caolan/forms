var validators = require('../lib/forms').validators,
    async = require('async');


exports['matchField'] = function(test){
    var v = validators.matchField('field1');
    var data = {
        fields: {
            field1: {data: 'one'},
            field2: {data: 'two'}
        }
    };
    v(data, data.fields.field2, function(err){
        test.equals(err, 'Does not match field1.');
        data.fields.field2.data = 'one';
        v(data, data.fields.field2, function(err){
            test.equals(err, undefined);
            test.done();
        });
    });
};

exports['min'] = function(test){
    validators.min(100)('form', {data: 50}, function(err){
        test.equals(err, 'Please enter a value greater than or equal to 100.');
        validators.min(100)('form', {data: 100}, function(err){
            test.equals(err, undefined);
            test.done();
        });
    });
};

exports['max'] = function(test){
    validators.max(100)('form', {data: 150}, function(err){
        test.equals(err, 'Please enter a value less than or equal to 100.');
        validators.max(100)('form', {data: 100}, function(err){
            test.equals(err, undefined);
            test.done();
        });
    });
};

exports['range'] = function(test){
    validators.range(10, 20)('form', {data: 50}, function(err){
        test.equals(err, 'Please enter a value between 10 and 20.');
        validators.range(10, 20)('form', {data: 15}, function(err){
            test.equals(err, undefined);
            test.done();
        });
    });
};

exports['regexp'] = function(test){
    validators.regexp(/^\d+$/)('form', {data: 'abc123'}, function(err){
        test.equals(err, 'Invalid format.');
        validators.regexp(/^\d+$/)('form', {data: '123'}, function(err){
            test.equals(err, undefined);
            var v = validators.regexp('^\\d+$', 'my message');
            v('form', {data: 'abc123'}, function(err){
                test.equals(err, 'my message');
                test.done();
            });
        });
    })
};

exports['email'] = function(test){
    validators.email()('form', {data: 'asdf'}, function(err){
        test.equals(err, 'Please enter a valid email address.');
        validators.email()('form', {data: 'asdf@asdf.com'}, function(err){
            test.equals(err, undefined);
            validators.email()('form', {data: 'a←+b@f.museum'}, function(err){
                test.equals(err, undefined);
                test.done();
            });
        });
    })
};

exports['url'] = function(test){
    async.parallel([
        function(callback){
            validators.url()('form', {data: 'asdf.com'}, function(err){
                test.equals(err, 'Please enter a valid URL.');
                validators.url()('form', {data: 'http://asdf.com'}, function(err){
                    test.equals(err, undefined);
                    callback();
                });
            });
        },
        function(callback){
            validators.url(true)('form', {data: 'localhost/test.html'}, function (err) {
                test.equals(err, 'Please enter a valid URL.');
                validators.url(true)('form', {data: 'http://localhost/test.html'}, function (err) {
                    test.equals(err, undefined);
                    test.done();
                });
            });
        }
    ], test.done);
};

exports['minlength'] = function(test){
    validators.minlength(5)('form', {data:'1234'}, function(err){
        test.equals(err, 'Please enter at least 5 characters.');
        validators.minlength(5)('form', {data:'12345'}, function(err){
            test.equals(err, undefined);
            test.done();
        });
    });
};

exports['maxlength'] = function(test){
    validators.maxlength(5)('form', {data:'123456'}, function(err){
        test.equals(err, 'Please enter no more than 5 characters.');
        validators.maxlength(5)('form', {data:'12345'}, function(err){
            test.equals(err, undefined);
            test.done();
        });
    });
};

exports['rangelength'] = function(test){
    async.parallel([
        function(callback){
            validators.rangelength(2,4)('form', {data:'12345'}, function(err){
                test.equals(
                    err, 'Please enter a value between 2 and 4 characters long.'
                );
                callback();
            });
        },
        function(callback){
            validators.rangelength(2,4)('form', {data:'1'}, function(err){
                test.equals(
                    err, 'Please enter a value between 2 and 4 characters long.'
                );
                callback();
            });
        },
        function(callback){
            validators.rangelength(2,4)('form', {data:'12'}, function(err){
                test.equals(err, undefined);
                callback();
            });
        },
        function(callback){
            validators.rangelength(2,4)('form',{data:'1234'}, function(err){
                test.equals(err, undefined);
                callback();
            });
        },
    ], test.done);
};
