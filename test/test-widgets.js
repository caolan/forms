var forms = require('forms');

exports['text'] = function(test){
    test.equals(
        forms.widgets.text().toHTML('field1'),
        '<input type="text" name="field1" id="id_field1" />'
    );
    var w = forms.widgets.text({classes: ['test1', 'test2', 'test3']});
    test.equals(
        w.toHTML('field2', {id:'form2_field2'}),
        '<input type="text" name="field2" id="form2_field2" ' +
        'class="test1 test2 test3" />'
    );
    test.equals(
        forms.widgets.text().toHTML('field1', {value:'some value'}),
        '<input type="text" name="field1" id="id_field1" value="some value" />'
    );
    test.done();
};
