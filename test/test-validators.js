var validators = require('forms').validators;


exports['matchField'] = function(test){
    var v = validators.matchField('field1');
    var data = {
        fields: {
            field1: {data: 'one'},
            field2: {data: 'two'}
        }
    };
    v(data, data.fields.field2, function(err){
        test.equals(err.message, 'Does not match field1');
        data.fields.field2.data = 'one';
        v(data, data.fields.field2, function(err){
            test.equals(err, undefined);
            test.done();
        });
    });
};

exports['min'] = function(test){
    validators.min(100)('form', {data: 50}, function(err){
        test.equals(
            err.message, 'Please enter a value greater than or equal to 100'
        );
        validators.min(100)('form', {data: 100}, function(err){
            test.equals(err, undefined);
            test.done();
        });
    });
};

exports['max'] = function(test){
    validators.max(100)('form', {data: 150}, function(err){
        test.equals(
            err.message, 'Please enter a value less than or equal to 100'
        );
        validators.max(100)('form', {data: 100}, function(err){
            test.equals(err, undefined);
            test.done();
        });
    });
};

exports['range'] = function(test){
    validators.range(10, 20)('form', {data: 50}, function(err){
        test.equals(err.message, 'Please enter a value between 10 and 20');
        validators.range(10, 20)('form', {data: 15}, function(err){
            test.equals(err, undefined);
            test.done();
        });
    });
};

exports['regexp'] = function(test){
    validators.regexp(/^\d+$/)('form', {data: 'abc123'}, function(err){
        test.equals(err.message, 'Invalid format');
        validators.regexp(/^\d+$/)('form', {data: '123'}, function(err){
            test.equals(err, undefined);
            validators.regexp('^\\d+$')('form', {data: 'abc123'}, function(err){
                test.equals(err.message, 'Invalid format');
                test.done();
            });
        });
    })
};

exports['email'] = function(test){
    validators.email()('form', {data: 'asdf'}, function(err){
        test.equals(err.message, 'Invalid format');
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
    validators.url()('form', {data: 'asdf.com'}, function(err){
        test.equals(err.message, 'Invalid format');
        validators.url()('form', {data: 'http://asdf.com'}, function(err){
            test.equals(err, undefined);
            test.done();
        });
    })
};
