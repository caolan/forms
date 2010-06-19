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
