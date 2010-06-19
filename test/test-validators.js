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
