var forms = require('forms'),
    http = require('http');


exports['bind'] = function(test){
    var form = forms.create({
        field1: forms.fields.string(),
        field2: forms.fields.string({
            validators: [function(form, field, callback){
                test.ok(false, 'validators should not be called');
                callback(new Error('validation error'));
            }]
        })
    });
    // unbound
    test.equals(form.isValid, undefined);

    // bound
    var f = form.bind({field1: 'data one', field2: 'data two'});
    test.equals(f.fields.field1.value, 'data one');
    test.equals(f.fields.field1.data, 'data one');
    test.equals(f.fields.field1.error, undefined);
    test.equals(f.fields.field2.value, 'data two');
    test.equals(f.fields.field2.data, 'data two');
    test.equals(f.fields.field2.error, undefined);

    test.ok(f.isValid instanceof Function);
    test.equals(f.bind, undefined);
    test.equals(f.handle, undefined);

    test.same(f.data, {field1: 'data one', field2: 'data two'});
    test.ok(form != f, 'bind returns new form object');

    test.done();
};

exports['validate'] = function(test){
    var form = forms.create({
        field1: forms.fields.string(),
        field2: forms.fields.string({
            validators: [function(form, field, callback){
                test.equals(field.data, 'data two');
                test.equals(field.value, 'data two');
                callback('validation error');
            }]
        })
    });
    var data = {field1:'data one', field2:'data two'};
    form.bind(data).validate(function(err, f){
        test.equals(f.fields.field1.value, 'data one');
        test.equals(f.fields.field1.data, 'data one');
        test.equals(f.fields.field1.error, null);
        test.equals(f.fields.field2.value, 'data two');
        test.equals(f.fields.field2.data, 'data two');
        test.equals(f.fields.field2.error, 'validation error');

        test.same(f.data, {field1: 'data one', field2: 'data two'});
        test.ok(form != f, 'bind returns new form object');

        test.equals(f.isValid(), false);
        test.done();
    });
};

exports['validate valid data'] = function(test){
    var f = forms.create({
        field1: forms.fields.string(),
        field2: forms.fields.string()
    });
    f.bind({field1: '1', field2: '2'}).validate(function(err, f){
        test.equals(f.isValid(), true);
        test.equals(
            f.toHTML(),
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

exports['validate invalid data'] = function(test){
    var f = forms.create({
        field1: forms.fields.string({
            validators: [function(form, field, callback){
                callback('validation error 1');
            }]
        }),
        field2: forms.fields.string({
            validators: [function(form, field, callback){
                callback('validation error 2');
            }]
        })
    });
    f.bind({field1: '1', field2: '2'}).validate(function(err, f){
        test.equals(f.isValid(), false);
        test.equals(
            f.toHTML(),
            '<div class="field error">' +
                '<p class="error_msg">validation error 1</p>' +
                '<label for="id_field1">Field1</label>' +
                '<input type="text" name="field1" id="id_field1" value="1" />' +
            '</div>' +
            '<div class="field error">' +
                '<p class="error_msg">validation error 2</p>' +
                '<label for="id_field2">Field2</label>' +
                '<input type="text" name="field2" id="id_field2" value="2" />' +
            '</div>'
        );
        test.done();
    });
};

exports['handle empty'] = function(test){
    test.expect(3);
    var f = forms.create({field1: forms.fields.string()});
    f.bind = function(){
        test.ok(false, 'bind should not be called');
    };
    f.handle(undefined, {
        empty: function(form){
            test.ok(true, 'empty called');
            test.equals(form, f);
        },
        success: function(form){
            test.ok(false, 'success should not be called');
        },
        error: function(form){
            test.ok(false, 'error should not be called');
        },
        other: function(form){
            test.ok(false, 'other should not be called');
        }
    });
    f.handle(null, {
        other: function(form){
            test.ok(true, 'other called');
        }
    });
    setTimeout(test.done, 50);
};

exports['handle success'] = function(test){
    test.expect(7);
    var f = forms.create({field1: forms.fields.string()});
    var call_order = [];
    f.bind = function(raw_data){
        call_order.push('bind');
        test.ok(true, 'bind called');
        f.isValid = function(){return true;};
        return f;
    };
    f.validate = function(callback){
        test.ok(true, 'validate called');
        callback(null, f);
    };
    f.handle({field1: 'test'}, {
        empty: function(form){
            test.ok(false, 'empty should not be called');
        },
        success: function(form){
            test.ok(true, 'success called');
            test.equals(form, f);
        },
        error: function(form){
            test.ok(false, 'error should not be called');
        },
        other: function(form){
            test.ok(false, 'other should not be called');
        }
    });
    f.handle({field1: 'test'}, {
        other: function(form){
            test.ok(true, 'other called');
            test.done();
        }
    });
};

exports['handle error'] = function(test){
    test.expect(7);
    var f = forms.create({field1: forms.fields.string()});
    f.bind = function(raw_data, callback){
        test.ok(true, 'bind called');
        f.fields.field1.error = 'some error';
        f.isValid = function(){return false;};
        return f;
    };
    f.validate = function(callback){
        test.ok(true, 'validate called');
        callback(null, f);
    };
    f.handle({}, {
        empty: function(form){
            test.ok(false, 'empty should not be called');
        },
        success: function(form){
            test.ok(false, 'success should not be called');
        },
        error: function(form){
            test.ok(true, 'error called');
            test.equals(form, f);
        },
        other: function(form){
            test.ok(false, 'other should not be called');
        }
    });
    f.handle({}, {
        other: function(form){
            test.ok(true, 'other called');
        }
    });
    setTimeout(test.done, 50);
};

exports['handle ServerRequest GET'] = function(test){
    var f = forms.create({field1: forms.fields.string()});
    var req = new http.IncomingMessage();
    req.method = 'GET';
    req.url = '/?field1=test';
    f.handle(req, {
        success: function(form){
            test.equals(form.data.field1, 'test');
            test.done();
        }
    });
};

exports['handle ServerRequest POST'] = function(test){
    var f = forms.create({field1: forms.fields.string()});
    var req = new http.IncomingMessage();
    req.method = 'POST';
    f.handle(req, {
        success: function(form){
            test.equals(form.data.field1, 'test');
            test.done();
        }
    });
    req.emit('data', 'field1=test');
    req.emit('end');
};

exports['div'] = function(test){
    var f = forms.create({fieldname: forms.fields.string()});
    test.equals(
        f.toHTML(),
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
        f.toHTML(),
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
    f.bind({name: 'val'}).validate(function(err, f){
        test.equals(
            f.toHTML(),
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
            validators: [function(form, field, callback){
                callback('validation error');
            }]
        })
    });
    f.bind({field_name: 'val'}).validate(function(err, f){
        test.equals(
            f.toHTML(),
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
