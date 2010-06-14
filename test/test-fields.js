var forms = require('forms');


var testField = function(field){
    exports[field] = function(test){
        var f = forms.fields[field]();
        test.equals(
            f.widget.toHTML('test'),
            forms.widgets.text().toHTML('test')
        );
        test.done();
    };

    exports[field + ' options'] = function(test){
        var fn1 = function(){return 'one'};
        var fn2 = function(){return 'two'};

        var f = forms.fields[field]({
            required: true,
            label: 'test label',
            validators: [fn1, fn2]
        });

        test.equals(f.required, true);
        test.equals(f.label, 'test label');
        test.same(f.validators, [fn1, fn2]);
        test.done();
    };

    exports[field + ' labelElement'] = function(test){
        test.equals(
            forms.fields[field]({label:'test label'}).labelElement('fieldname'),
            '<label for="id_fieldname">test label</label>'
        );
        test.equals(
            forms.fields[field]().labelElement('fieldname', {id: 'testid'}),
            '<label for="testid">Fieldname</label>'
        );
        test.done();
    };

    exports[field + ' bind'] = function(test){
        test.expect(9);

        var f = forms.fields[field]({
            label: 'test label',
            validators: [
                function(data, raw_value, callback){
                    test.equals(data, 'some data parsed');
                    test.equals(raw_value, 'some data');
                    callback(null);
                },
                function(data, raw_value, callback){
                    test.equals(data, 'some data parsed');
                    test.equals(raw_value, 'some data');
                    callback(new Error('validation error'));
                }
            ]
        });

        f.parse = function(data){
            test.equals(data, 'some data');
            return 'some data parsed';
        };
        f.bind('some data', function(err, f){
            test.equals(f.label, 'test label');
            test.equals(f.value, 'some data');
            test.equals(f.data, 'some data parsed');
            test.equals(f.error, 'validation error');
        });
        setTimeout(test.done, 25);
    };

    exports[field + ' bind required'] = function(test){
        test.expect(5);
        var f = forms.fields[field]({required: true});
        f.bind(undefined, function(err, f){
            test.equals(f.value, undefined);
            test.equals(f.error, 'required field');
        });
        var f2 = forms.fields[field]({required: true});
        f2.parse = function(val){return val;};
        f2.bind('val', function(err, f2){
            test.equals(f2.value, 'val');
            test.equals(f2.data, 'val');
            test.equals(f2.error, null);
        });
        setTimeout(test.done, 25);
    };

    exports[field + ' bind no validators'] = function(test){
        test.expect(4);
        var f = forms.fields[field]();
        f.parse = function(data){
            test.equals(data, 'some data');
            return 'some data parsed';
        };
        f.bind('some data', function(err, f){
            test.equals(f.value, 'some data');
            test.equals(f.data, 'some data parsed');
            test.equals(f.error, null);
        });
        setTimeout(test.done, 25);
    };
};

testField('string');

exports['string parse'] = function(test){
    test.equals(forms.fields.string().parse(), '');
    test.equals(forms.fields.string().parse(null), '');
    test.equals(forms.fields.string().parse(0), '0');
    test.equals(forms.fields.string().parse(''), '');
    test.equals(forms.fields.string().parse('some string'), 'some string');
    test.done();
};


testField('number');

exports['number parse'] = function(test){
    test.ok(isNaN(forms.fields.number().parse()));
    test.ok(isNaN(forms.fields.number().parse(null)));
    test.equals(forms.fields.number().parse(0), 0);
    test.ok(isNaN(forms.fields.number().parse('')));
    test.equals(forms.fields.number().parse('123'), 123);
    test.done();
};
