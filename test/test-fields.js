var forms = require('forms');


var testField = function(field){

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

    exports[field + ' bind'] = function(test){
        test.expect(10);

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
        f.bind('some data', function(err, bound){
            test.equals(bound.label, 'test label');
            test.equals(bound.value, 'some data');
            test.equals(bound.data, 'some data parsed');
            test.equals(bound.error, 'validation error');
            test.ok(bound != f, 'bind returns a new field object');
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

exports['string toHTML'] = function(test){
    test.expect(3);
    test.equals(
        forms.fields.string().toHTML('fieldname'),
        '<div class="field">' +
            '<label for="id_fieldname">Fieldname</label>' +
            '<input type="text" name="fieldname" id="id_fieldname" />' +
        '</div>'
    );
    var f = forms.fields.string();
    f.widget.toHTML = function(name, field){
        test.equals(name, 'fieldname');
        test.equals(field, f);
        test.done();
    };
    f.toHTML('fieldname');
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

exports['number toHTML'] = function(test){
    test.equals(
        forms.fields.number().toHTML('fieldname'),
        '<div class="field">' +
            '<label for="id_fieldname">Fieldname</label>' +
            '<input type="text" name="fieldname" id="id_fieldname" />' +
        '</div>'
    );
    test.done();
};

testField('boolean');

exports['boolean parse'] = function(test){
    test.equals(forms.fields.boolean().parse(), false);
    test.equals(forms.fields.boolean().parse(null), false);
    test.equals(forms.fields.boolean().parse(0), false);
    test.equals(forms.fields.boolean().parse(''), false);
    test.equals(forms.fields.boolean().parse('on'), true);
    test.equals(forms.fields.boolean().parse('true'), true);
    test.done();
};

exports['boolean toHTML'] = function(test){
    test.equals(
        forms.fields.boolean().toHTML('fieldname'),
        '<div class="field">' +
            '<label for="id_fieldname">Fieldname</label>' +
            '<input type="checkbox" name="fieldname" id="id_fieldname" />' +
        '</div>'
    );
    test.done();
};
