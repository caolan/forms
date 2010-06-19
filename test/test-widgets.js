var forms = require('forms');

var test_input = function(type){
    return function(test){
        test.equals(
            forms.widgets[type]().toHTML('field1'),
            '<input type="' + type + '" name="field1" id="id_field1" />'
        );
        var w = forms.widgets[type]({classes: ['test1', 'test2', 'test3']});
        test.equals(
            w.toHTML('field2', {id:'form2_field2'}),
            '<input type="' + type + '" name="field2" id="form2_field2"' +
            ' class="test1 test2 test3" />'
        );
        test.equals(
            forms.widgets[type]().toHTML('field1', {value:'some value'}),
            '<input type="' + type + '" name="field1" id="id_field1"' +
            ' value="some value" />'
        );
        test.done();
    };
};

exports['text'] = test_input('text');
exports['password'] = test_input('password');
exports['checkbox'] = test_input('checkbox');
exports['hidden'] = test_input('hidden');

exports['select'] = function(test){
    test.equals(
        forms.widgets.select().toHTML('name', {choices: {
            val1:'text1',
            val2:'text2'
        }}),
        '<select name="name" id="id_name">' +
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
        '<select name="name" id="someid" class="one two">' +
            '<option value="val1">text1</option>' +
            '<option value="val2" selected="selected">text2</option>' +
        '</select>'
    );
    test.done();
};

exports['textarea'] = function(test){
    test.equals(
        forms.widgets.textarea().toHTML('name', {}),
        '<textarea name="name" id="id_name"></textarea>'
    );
    test.equals(
        forms.widgets.textarea({classes: ['one', 'two']}).toHTML('name', {
            id: 'someid', value: 'value'
        }),
        '<textarea name="name" id="someid" class="one two">value</textarea>'
    );
    test.done();
};
