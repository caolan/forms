var forms = require('forms');

exports['string'] = function(test){
    var f = forms.fields.string();
    test.equals(f.widget.toHTML('test'), forms.widgets.text().toHTML('test'));
    test.done();
};

exports['string options'] = function(test){
    var fn1 = function(){return 'one'};
    var fn2 = function(){return 'two'};

    var f = forms.fields.string({
        required: true,
        label: 'test label',
        validators: [fn1, fn2]
    });

    test.equals(f.required, true);
    test.equals(f.label, 'test label');
    test.same(f.validators, [fn1, fn2]);
    test.done();
};

exports['string labelElement'] = function(test){
    test.equals(
        forms.fields.string({label: 'test label'}).labelElement('fieldname'),
        '<label for="id_fieldname">test label</label>'
    );
    test.equals(
        forms.fields.string().labelElement('fieldname', {id: 'testid'}),
        '<label for="testid">fieldname</label>'
    );
    test.done();
};

exports['string bind'] = function(test){
    test.expect(9);

    var f = forms.fields.string({
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

exports['string bind required'] = function(test){
    test.expect(6);
    forms.fields.string({required: true}).bind(undefined, function(err, f){
        test.equals(f.value, undefined);
        test.equals(f.data, '');
        test.equals(f.error, 'required field');
    });
    forms.fields.string({required: true}).bind('val', function(err, f){
        test.equals(f.value, 'val');
        test.equals(f.data, 'val');
        test.equals(f.error, null);
    });
    setTimeout(test.done, 25);
};

exports['string bind no validators'] = function(test){
    test.expect(4);
    var f = forms.fields.string();
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

exports['string toHTML'] = function(test){
    var f = forms.fields.string();
    test.equals(
        f.toHTML('fieldname'),
        '<div class="field">' +
            '<label for="id_fieldname">fieldname</label>' +
            '<input type="text" name="fieldname" id="id_fieldname" />' +
        '</div>'
    );
    test.equals(
        f.toHTML('fieldname', {id: 'testid'}),
        '<div class="field">' +
            '<label for="testid">fieldname</label>' +
            '<input type="text" name="fieldname" id="testid" />' +
        '</div>'
    );
    test.done();
};

exports['string required toHTML'] = function(test){
    var f = forms.fields.string({required: true});
    test.equals(
        f.toHTML('fieldname'),
        '<div class="field required">' +
            '<label for="id_fieldname">fieldname</label>' +
            '<input type="text" name="fieldname" id="id_fieldname" />' +
        '</div>'
    );
    test.done();
};

exports['string bind toHTML'] = function(test){
    test.expect(1);
    var f = forms.fields.string();
    f.bind('val', function(err, f){
        test.equals(
            f.toHTML('name'),
            '<div class="field">' +
                '<label for="id_name">name</label>' +
                '<input type="text" name="name" id="id_name" value="val" />' +
            '</div>'
        );
    });
    setTimeout(test.done, 25);
};

exports['string bind error toHTML'] = function(test){
    test.expect(1);
    var f = forms.fields.string({
        validators: [function(data, raw_value, callback){
            callback(new Error('validation error'));
        }]
    });
    f.bind('val', function(err, f){
        test.equals(
            f.toHTML('name'),
            '<div class="field error">' +
                '<p class="error_msg">validation error</p>' +
                '<label for="id_name">name</label>' +
                '<input type="text" name="name" id="id_name" value="val" />' +
            '</div>'
        );
    });
    setTimeout(test.done, 25);
};

exports['string parse'] = function(test){
    test.equals(forms.fields.string().parse(), '');
    test.equals(forms.fields.string().parse(null), '');
    test.equals(forms.fields.string().parse(0), '0');
    test.equals(forms.fields.string().parse(''), '');
    test.equals(forms.fields.string().parse('some string'), 'some string');
    test.done();
};
