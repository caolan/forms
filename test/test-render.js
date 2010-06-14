var forms = require('forms');


exports['div'] = function(test){
    var f = forms.create({fieldname: forms.fields.string()});
    test.equals(
        forms.render.div(f),
        '<div class="field">' +
            '<label for="id_fieldname">Fieldname</label>' +
            '<input type="text" name="fieldname" id="id_fieldname" />' +
        '</div>'
    );
    test.done();
};

exports['div required'] = function(test){
    var f = forms.create({
        fieldname: forms.fields.string({required:true})
    });
    test.equals(
        forms.render.div(f),
        '<div class="field required">' +
            '<label for="id_fieldname">Fieldname</label>' +
            '<input type="text" name="fieldname" id="id_fieldname" />' +
        '</div>'
    );
    test.done();
};

exports['div bound'] = function(test){
    test.expect(1);
    var f = forms.create({name: forms.fields.string()});
    f.bind({name: 'val'}, function(err, f){
        test.equals(
            forms.render.div(f),
            '<div class="field">' +
                '<label for="id_name">Name</label>' +
                '<input type="text" name="name" id="id_name" value="val" />' +
            '</div>'
        );
    });
    setTimeout(test.done, 25);
};

exports['div bound error'] = function(test){
    test.expect(1);
    var f = forms.create({
        field_name: forms.fields.string({
            validators: [function(data, raw_value, callback){
                callback(new Error('validation error'));
            }]
        })
    });
    f.bind({field_name: 'val'}, function(err, f){
        test.equals(
            forms.render.div(f),
            '<div class="field error">' +
                '<p class="error_msg">validation error</p>' +
                '<label for="id_field_name">Field name</label>' +
                '<input type="text" name="field_name" id="id_field_name" ' +
                'value="val" />' +
            '</div>'
        );
    });
    setTimeout(test.done, 25);
};

exports['p'] = function(test){
    var f = forms.create({fieldname: forms.fields.string()});
    test.equals(
        forms.render.p(f),
        '<p class="field">' +
            '<label for="id_fieldname">Fieldname</label>' +
            '<input type="text" name="fieldname" id="id_fieldname" />' +
        '</p>'
    );
    test.done();
};

exports['p required'] = function(test){
    var f = forms.create({
        fieldname: forms.fields.string({required:true})
    });
    test.equals(
        forms.render.p(f),
        '<p class="field required">' +
            '<label for="id_fieldname">Fieldname</label>' +
            '<input type="text" name="fieldname" id="id_fieldname" />' +
        '</p>'
    );
    test.done();
};

exports['p bound'] = function(test){
    test.expect(1);
    var f = forms.create({name: forms.fields.string()});
    f.bind({name: 'val'}, function(err, f){
        test.equals(
            forms.render.p(f),
            '<p class="field">' +
                '<label for="id_name">Name</label>' +
                '<input type="text" name="name" id="id_name" value="val" />' +
            '</p>'
        );
    });
    setTimeout(test.done, 25);
};

exports['p bound error'] = function(test){
    test.expect(1);
    var f = forms.create({
        field_name: forms.fields.string({
            validators: [function(data, raw_value, callback){
                callback(new Error('validation error'));
            }]
        })
    });
    f.bind({field_name: 'val'}, function(err, f){
        test.equals(
            forms.render.p(f),
            '<p class="field error">' +
                '<p class="error_msg">validation error</p>' +
                '<label for="id_field_name">Field name</label>' +
                '<input type="text" name="field_name" id="id_field_name" ' +
                'value="val" />' +
            '</p>'
        );
    });
    setTimeout(test.done, 25);
};

exports['ul'] = function(test){
    var f = forms.create({fieldname: forms.fields.string()});
    test.equals(
        forms.render.ul(f),
        '<ul>' +
            '<li class="field">' +
                '<label for="id_fieldname">Fieldname</label>' +
                '<input type="text" name="fieldname" id="id_fieldname" />' +
            '</li>' +
        '</ul>'
    );
    test.done();
};

exports['ul required'] = function(test){
    var f = forms.create({
        fieldname: forms.fields.string({required:true})
    });
    test.equals(
        forms.render.ul(f),
        '<ul>' +
            '<li class="field required">' +
                '<label for="id_fieldname">Fieldname</label>' +
                '<input type="text" name="fieldname" id="id_fieldname" />' +
            '</li>' +
        '</ul>'
    );
    test.done();
};

exports['ul bound'] = function(test){
    test.expect(1);
    var f = forms.create({name: forms.fields.string()});
    f.bind({name: 'val'}, function(err, f){
        test.equals(
            forms.render.ul(f),
            '<ul>' +
                '<li class="field">' +
                    '<label for="id_name">Name</label>' +
                    '<input type="text" name="name" id="id_name"' +
                    ' value="val" />' +
                '</li>' +
            '</ul>'
        );
    });
    setTimeout(test.done, 25);
};

exports['ul bound error'] = function(test){
    test.expect(1);
    var f = forms.create({
        field_name: forms.fields.string({
            validators: [function(data, raw_value, callback){
                callback(new Error('validation error'));
            }]
        })
    });
    f.bind({field_name: 'val'}, function(err, f){
        test.equals(
            forms.render.ul(f),
            '<ul>' +
                '<li class="field error">' +
                    '<p class="error_msg">validation error</p>' +
                    '<label for="id_field_name">Field name</label>' +
                    '<input type="text" name="field_name" id="id_field_name" ' +
                    'value="val" />' +
                '</li>' +
            '</ul>'
        );
    });
    setTimeout(test.done, 25);
};

exports['table'] = function(test){
    var f = forms.create({fieldname: forms.fields.string()});
    test.equals(
        forms.render.table(f),
        '<table>' +
            '<tr class="field">' +
                '<th><label for="id_fieldname">Fieldname</label></th>' +
                '<td>' +
                    '<input type="text" name="fieldname" id="id_fieldname" />' +
                '</td>' +
            '</tr>' +
        '</table>'
    );
    test.done();
};

exports['table required'] = function(test){
    var f = forms.create({
        fieldname: forms.fields.string({required:true})
    });
    test.equals(
        forms.render.table(f),
        '<table>' +
            '<tr class="field required">' +
                '<th><label for="id_fieldname">Fieldname</label></th>' +
                '<td>' +
                    '<input type="text" name="fieldname" id="id_fieldname" />' +
                '</td>' +
            '</tr>' +
        '</table>'
    );
    test.done();
};

exports['table bound'] = function(test){
    test.expect(1);
    var f = forms.create({name: forms.fields.string()});
    f.bind({name: 'val'}, function(err, f){
        test.equals(
            forms.render.table(f),
            '<table>' +
                '<tr class="field">' +
                    '<th><label for="id_name">Name</label></th>' +
                    '<td>' +
                        '<input type="text" name="name" id="id_name"' +
                        ' value="val" />' +
                    '</td>' +
                '</tr>' +
            '</table>'
        );
    });
    setTimeout(test.done, 25);
};

exports['table bound error'] = function(test){
    test.expect(1);
    var f = forms.create({
        field_name: forms.fields.string({
            validators: [function(data, raw_value, callback){
                callback(new Error('validation error'));
            }]
        })
    });
    f.bind({field_name: 'val'}, function(err, f){
        test.equals(
            forms.render.table(f),
            '<table>' +
                '<tr class="field error">' +
                    '<th><label for="id_field_name">Field name</label></th>' +
                    '<td>' +
                        '<p class="error_msg">validation error</p>' +
                        '<input type="text" name="field_name"' +
                        ' id="id_field_name" value="val" />' +
                    '</td>' +
                '</tr>' +
            '</table>'
        );
    });
    setTimeout(test.done, 25);
};
