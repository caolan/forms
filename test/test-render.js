var forms = require('forms');


var testWrap = function(tag){
    exports[tag] = function(test){
        var f = forms.create({fieldname: forms.fields.string()});
        test.equals(
            f.toHTML(forms.render[tag]),
            '<' + tag + ' class="field">' +
                '<label for="id_fieldname">Fieldname</label>' +
                '<input type="text" name="fieldname" id="id_fieldname" />' +
            '</' + tag + '>'
        );
        test.done();
    };

    exports[tag + ' required'] = function(test){
        var f = forms.create({
            fieldname: forms.fields.string({required:true})
        });
        test.equals(
            f.toHTML(forms.render[tag]),
            '<' + tag + ' class="field required">' +
                '<label for="id_fieldname">Fieldname</label>' +
                '<input type="text" name="fieldname" id="id_fieldname" />' +
            '</' + tag + '>'
        );
        test.done();
    };

    exports[tag + ' bound'] = function(test){
        test.expect(1);
        var f = forms.create({name: forms.fields.string()});
        f.bind({name: 'val'}).validate(function(err, f){
            test.equals(
                f.toHTML(forms.render[tag]),
                '<' + tag + ' class="field">' +
                    '<label for="id_name">Name</label>' +
                    '<input type="text" name="name" id="id_name" value="val" />' +
                '</' + tag + '>'
            );
        });
        setTimeout(test.done, 25);
    };

    exports[tag + ' bound error'] = function(test){
        test.expect(1);
        var f = forms.create({
            field_name: forms.fields.string({
                validators: [function(form, field, callback){
                    callback('validation error');
                }]
            })
        });
        f.bind({field_name: 'val'}).validate(function(err, f){
            test.equals(
                f.toHTML(forms.render[tag]),
                '<' + tag + ' class="field error">' +
                    '<p class="error_msg">validation error</p>' +
                    '<label for="id_field_name">Field name</label>' +
                    '<input type="text" name="field_name" id="id_field_name" ' +
                    'value="val" />' +
                '</' + tag + '>'
            );
        });
        setTimeout(test.done, 25);
    };

    exports[tag + ' multipleCheckbox'] = function(test){
        var f = forms.create({
            fieldname: forms.fields.string({
                choices: {one: 'item one'},
                widget: forms.widgets.multipleCheckbox()
            })
        });
        test.equals(
            f.toHTML(forms.render[tag]),
            '<' + tag + ' class="field">' +
                '<fieldset>' +
                    '<legend>Fieldname</legend>' +
                    '<input type="checkbox" name="fieldname" id="id_fieldname_one"'+
                    ' value="one">' +
                    '<label for="id_fieldname_one">item one</label>' +
                '</fieldset>' +
            '</' + tag + '>'
        );
        test.done();
    };

    exports[tag + ' multipleRadio'] = function(test){
        var f = forms.create({
            fieldname: forms.fields.string({
                choices: {one: 'item one'},
                widget: forms.widgets.multipleRadio()
            })
        });
        test.equals(
            f.toHTML(forms.render[tag]),
            '<' + tag + ' class="field">' +
                '<fieldset>' +
                    '<legend>Fieldname</legend>' +
                    '<input type="radio" name="fieldname" id="id_fieldname_one"'+
                    ' value="one">' +
                    '<label for="id_fieldname_one">item one</label>' +
                '</fieldset>' +
            '</' + tag + '>'
        );
        test.done();
    };

};

testWrap('div');
testWrap('p');
testWrap('li');

exports['table'] = function(test){
    var f = forms.create({fieldname: forms.fields.string()});
    test.equals(
        f.toHTML(forms.render.table),
        '<tr class="field">' +
            '<th><label for="id_fieldname">Fieldname</label></th>' +
            '<td>' +
                '<input type="text" name="fieldname" id="id_fieldname" />' +
            '</td>' +
        '</tr>'
    );
    test.done();
};

exports['table required'] = function(test){
    var f = forms.create({
        fieldname: forms.fields.string({required:true})
    });
    test.equals(
        f.toHTML(forms.render.table),
        '<tr class="field required">' +
            '<th><label for="id_fieldname">Fieldname</label></th>' +
            '<td>' +
                '<input type="text" name="fieldname" id="id_fieldname" />' +
            '</td>' +
        '</tr>'
    );
    test.done();
};

exports['table bound'] = function(test){
    test.expect(1);
    var f = forms.create({name: forms.fields.string()});
    f.bind({name: 'val'}).validate(function(err, f){
        test.equals(
            f.toHTML(forms.render.table),
            '<tr class="field">' +
                '<th><label for="id_name">Name</label></th>' +
                '<td>' +
                    '<input type="text" name="name" id="id_name"' +
                    ' value="val" />' +
                '</td>' +
            '</tr>'
        );
    });
    setTimeout(test.done, 25);
};

exports['table bound error'] = function(test){
    test.expect(1);
    var f = forms.create({
        field_name: forms.fields.string({
            validators: [function(form, field, callback){
                callback('validation error');
            }]
        })
    });
    f.bind({field_name: 'val'}).validate(function(err, f){
        test.equals(
            f.toHTML(forms.render.table),
            '<tr class="field error">' +
                '<th><label for="id_field_name">Field name</label></th>' +
                '<td>' +
                    '<p class="error_msg">validation error</p>' +
                    '<input type="text" name="field_name"' +
                    ' id="id_field_name" value="val" />' +
                '</td>' +
            '</tr>'
        );
    });
    setTimeout(test.done, 25);
};
