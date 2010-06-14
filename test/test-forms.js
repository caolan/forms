var forms = require('forms');

exports['create'] = function(test){
    var f = forms.create({
        field1: forms.fields.string(),
        field2: forms.fields.string()
    });
    test.equals(
        forms.render.div(f),
        '<div class="field">' +
            '<label for="id_field1">Field1</label>' +
            '<input type="text" name="field1" id="id_field1" />' +
        '</div>' +
        '<div class="field">' +
            '<label for="id_field2">Field2</label>' +
            '<input type="text" name="field2" id="id_field2" />' +
        '</div>'
    );
    test.done();
};

exports['bind'] = function(test){
    var f = forms.create({
        field1: forms.fields.string(),
        field2: forms.fields.string({
            validators: [function(data, raw_value, callback){
                test.equals(data, 'data two');
                test.equals(raw_value, 'data two');
                callback(new Error('validation error'));
            }]
        })
    });
    f.bind({field1: 'data one', field2: 'data two'}, function(err, f){
        test.equals(f.fields.field1.value, 'data one');
        test.equals(f.fields.field1.data, 'data one');
        test.equals(f.fields.field1.error, null);
        test.equals(f.fields.field2.value, 'data two');
        test.equals(f.fields.field2.data, 'data two');
        test.equals(f.fields.field2.error, 'validation error');

        test.same(f.data, {field1: 'data one', field2: 'data two'});

        test.equals(f.isValid(), false);
        test.done();
    });
};

exports['bind valid data'] = function(test){
    var f = forms.create({
        field1: forms.fields.string(),
        field2: forms.fields.string()
    });
    f.bind({field1: '1', field2: '2'}, function(err, f){
        test.equals(f.isValid(), true);
        test.equals(
            forms.render.div(f),
            '<div class="field">' +
                '<label for="id_field1">Field1</label>' +
                '<input type="text" name="field1" id="id_field1" value="1" />' +
            '</div>' +
            '<div class="field">' +
                '<label for="id_field2">Field2</label>' +
                '<input type="text" name="field2" id="id_field2" value="2" />' +
            '</div>'
        );
        test.done();
    });
};

exports['bind invalid data'] = function(test){
    var f = forms.create({
        field1: forms.fields.string(),
        field2: forms.fields.string({
            validators: [function(data, raw_value, callback){
                callback(new Error('validation error'));
            }]
        })
    });
    f.bind({field1: '1', field2: '2'}, function(err, f){
        test.equals(f.isValid(), false);
        test.equals(
            forms.render.div(f),
            '<div class="field">' +
                '<label for="id_field1">Field1</label>' +
                '<input type="text" name="field1" id="id_field1" value="1" />' +
            '</div>' +
            '<div class="field error">' +
                '<p class="error_msg">validation error</p>' +
                '<label for="id_field2">Field2</label>' +
                '<input type="text" name="field2" id="id_field2" value="2" />' +
            '</div>'
        );
        test.done();
    });
};
