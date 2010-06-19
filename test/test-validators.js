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

exports['above'] = function(test){
    validators.above(100)('form', {data: 50}, function(err){
        test.equals(err.message, 'Not above 100');
        validators.above(100)('form', {data: 150}, function(err){
            test.equals(err, undefined);
            test.done();
        });
    });
};

exports['below'] = function(test){
    validators.below(100)('form', {data: 150}, function(err){
        test.equals(err.message, 'Not below 100');
        validators.below(100)('form', {data: 50}, function(err){
            test.equals(err, undefined);
            test.done();
        });
    });
};

exports['between'] = function(test){
    validators.between(10, 20)('form', {data: 50}, function(err){
        test.equals(err.message, 'Not between 10 and 20');
        validators.between(10, 20)('form', {data: 15}, function(err){
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
