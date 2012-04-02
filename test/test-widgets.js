var forms = require('../lib/forms');

var test_input = function(type){
    return function(test){
        test.equals(
            forms.widgets[type]().toHTML('field1'),
            '<input id="field1" name="field1" type="' + type + '"/>'
        );
        var w = forms.widgets[type]({classes: ['test1', 'test2', 'test3']});
        test.equals(
            w.toHTML('field2', {id:'form2_field2'}),
            '<input id="form2_field2" name="field2" type="' + type + '" class="test1 test2 test3"/>'
        );
        test.equals(
            forms.widgets[type]().toHTML('field1', {value:'some value'}),
            '<input id="field1" name="field1" type="' + type + '" value="some value"/>'
        );
        test.equals(forms.widgets[type]().type, type);
        test.done();
    };
};

exports['text'] = test_input('text');
exports['password'] = test_input('password');
exports['hidden'] = test_input('hidden');

exports['checkbox'] = function(test){
    test.equals(
        forms.widgets.checkbox().toHTML('field1'),
        '<input id="field1" name="field1" type="checkbox"/>'
    );
    var w = forms.widgets.checkbox({classes: ['test1', 'test2', 'test3']});
    test.equals(
        w.toHTML('field2', {id:'form2_field2'}),
        '<input id="form2_field2" name="field2" type="checkbox" class="test1 test2 test3"/>'
    );
    test.equals(
        forms.widgets.checkbox().toHTML('field', {value:true}),
        '<input checked="checked" id="field" name="field" type="checkbox"/>'
    );
    test.equals(
        forms.widgets.checkbox().toHTML('field', {value:false}),
        '<input id="field" name="field" type="checkbox"/>'
    );
    test.equals(forms.widgets.checkbox().type, 'checkbox');
    test.done();
};

exports['select'] = function(test){
    test.equals(
        forms.widgets.select().toHTML('name', {
          choices: {
              val1:'text1',
              val2:'text2'
          }
        }),
        '<select id="name" name="name">' +
            '<option value="val1">text1</option>' +
            '<option value="val2">text2</option>' +
        '</select>'
    );
    test.equals(
        forms.widgets.select({classes: ['one', 'two']}).toHTML('name', {
            choices: {
                val1:'text1',
                val2:'text2'
            },
            id: 'someid',
            value: 'val2'
        }),
        '<select id="someid" name="name" class="one two">' +
            '<option value="val1">text1</option>' +
            '<option value="val2" selected="selected">text2</option>' +
        '</select>'
    );
    test.equals(forms.widgets.select().type, 'select');
    test.done();
};

exports['textarea'] = function(test){
    test.equals(
        forms.widgets.textarea().toHTML('name', {}),
        '<textarea id="name" name="name"></textarea>'
    );
    test.equals(
        forms.widgets.textarea({
            classes: ['one', 'two'],
            rows: 20,
            cols: 80
        }).toHTML('name', {id: 'someid', value: 'value'}),
        '<textarea cols="80" id="someid" name="name" rows="20" class="one two">value</textarea>'
    );
    test.equals(forms.widgets.textarea().type, 'textarea');
    test.done();
};

exports['multipleCheckbox'] = function(test){
    var w = forms.widgets.multipleCheckbox();
    var field = {
        choices: {one:'Item one',two:'Item two',three:'Item three'},
        value: 'two'
    };
    test.equals(
        w.toHTML('name', field),
        '<ul>' +
          '<li>' + 
            '<input id="name-0" name="name" type="checkbox" value="one"/>' +
            '<label for="name-0">Item one</label>' +
          '</li>' +
          '<li>' +
            '<input checked="checked" id="name-1" name="name" type="checkbox" value="two"/>' +
            '<label for="name-1">Item two</label>' +
          '</li>' +
          '<li>' +
            '<input id="name-2" name="name" type="checkbox" value="three"/>' +
            '<label for="name-2">Item three</label>' +
          '</li>' +
        '</ul>'
    );
    test.equals(forms.widgets.multipleCheckbox().type, 'multipleCheckbox');
    test.done();
};

exports['multipleCheckbox mutliple selected'] = function(test){
    var w = forms.widgets.multipleCheckbox();
    var field = {
        choices: {one:'Item one',two:'Item two',three:'Item three'},
        value: ['two', 'three']
    };
    test.equals(
        w.toHTML('name', field),
        '<ul>' +
          '<li>' +
            '<input id="name-0" name="name" type="checkbox" value="one"/>' +
            '<label for="name-0">Item one</label>' +
          '</li>' +
          '<li>' +
            '<input checked="checked" id="name-1" name="name" type="checkbox" value="two"/>' +
            '<label for="name-1">Item two</label>' +
          '</li>' +
          '<li>' +
            '<input checked="checked" id="name-2" name="name" type="checkbox" value="three"/>' +
            '<label for="name-2">Item three</label>' +
          '</li>' +
        '</ul>'
    );
    test.equals(forms.widgets.multipleCheckbox().type, 'multipleCheckbox');
    test.done();
};

exports['multipleRadio'] = function(test){
    var w = forms.widgets.multipleRadio();
    var field = {
        choices: {one:'Item one',two:'Item two',three:'Item three'},
        value: 'two'
    };
    test.equals(
        w.toHTML('name', field),
        '<ul>' +
          '<li>' +
            '<input id="name-0" name="name" type="radio" value="one"/>' +
            '<label for="name-0">Item one</label>' +
          '</li>' +
          '<li>' +
            '<input checked="checked" id="name-1" name="name" type="radio" value="two"/>' +
            '<label for="name-1">Item two</label>' +
          '</li>' +
          '<li>' +
            '<input id="name-2" name="name" type="radio" value="three"/>' +
            '<label for="name-2">Item three</label>' +
          '</li>' +
        '</ul>'
    );
    test.equals(forms.widgets.multipleRadio().type, 'multipleRadio');
    test.done();
};

exports['multipleSelect'] = function(test){
    test.equals(
        forms.widgets.multipleSelect().toHTML('name', {choices: {
            val1:'text1',
            val2:'text2'
        }}),
        '<select id="name" multiple="multiple" name="name">' +
            '<option value="val1">text1</option>' +
            '<option value="val2">text2</option>' +
        '</select>'
    );
    test.equals(
        forms.widgets.multipleSelect({classes: ['one', 'two']}).toHTML('name', {
            choices: {
                val1:'text1',
                val2:'text2',
                val3:'text3'
            },
            id: 'someid',
            value: ['val2','val3']
        }),
        '<select id="someid" multiple="multiple" name="name" class="one two">' +
            '<option value="val1">text1</option>' +
            '<option value="val2" selected="selected">text2</option>' +
            '<option value="val3" selected="selected">text3</option>' +
        '</select>'
    );
    test.equals(forms.widgets.multipleSelect().type, 'multipleSelect');
    test.done();
};
