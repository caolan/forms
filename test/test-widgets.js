/*jslint node: true */
'use strict';
var forms = require('../lib/forms');

var test_input = function (type) {
    return function (test) {
        test.equals(
            forms.widgets[type]().toHTML('field1'),
            '<input type="' + type + '" name="field1" id="id_field1" />'
        );
        var w = forms.widgets[type]({classes: ['test1', 'test2', 'test3']});
        test.equals(
            w.toHTML('field2', {id: 'form2_field2'}),
            '<input type="' + type + '" name="field2" id="form2_field2" class="test1 test2 test3" />'
        );
        test.equals(
            forms.widgets[type]().toHTML('field1', {value: 'some value'}),
            '<input type="' + type + '" name="field1" id="id_field1" value="some value" />'
        );
        test.equals(forms.widgets[type]().type, type);
        test.equals(forms.widgets[type]().formatValue('hello'), 'hello');
        test.strictEqual(forms.widgets[type]().formatValue(false), null);
        test.done();
    };
};

exports.text = test_input('text');
exports.password = test_input('password');
exports.hidden = test_input('hidden');
exports.color = test_input('color');

exports.date = function (test) {
    var w = forms.widgets.date();
    test.equals(w.formatValue(new Date(Date.UTC(2013, 2, 1))), '2013-03-01');
    test.equals(w.formatValue('2013-03-02'), '2013-03-02');
    test.strictEqual(w.formatValue('invalid'), null);

    test.equals(w.type, 'date');

    test.equals(
        w.toHTML('field1'),
        '<input type="date" name="field1" id="id_field1" />'
    );

    test.equals(
        w.toHTML('field1', {value: '2013-03-03'}),
        '<input type="date" name="field1" id="id_field1" value="2013-03-03" />'
    );


    test.done();
};

exports.checkbox = function (test) {
    test.equals(
        forms.widgets.checkbox().toHTML('field1'),
        '<input type="checkbox" name="field1" id="id_field1" value="on" />'
    );
    var w = forms.widgets.checkbox({classes: ['test1', 'test2', 'test3']});
    test.equals(
        w.toHTML('field2', {id: 'form2_field2'}),
        '<input type="checkbox" name="field2" id="form2_field2" value="on" class="test1 test2 test3" />'
    );
    test.equals(
        forms.widgets.checkbox().toHTML('field', {value: true}),
        '<input type="checkbox" name="field" id="id_field" checked="checked" value="on" />'
    );
    test.equals(
        forms.widgets.checkbox().toHTML('field', {value: false}),
        '<input type="checkbox" name="field" id="id_field" value="on" />'
    );
    test.equals(forms.widgets.checkbox().type, 'checkbox');
    test.done();
};

exports.select = function (test) {
    test.equals(
        forms.widgets.select().toHTML('name', {
            choices: {
                val1: 'text1',
                val2: 'text2'
            }
        }),
        '<select name="name" id="id_name">' +
            '<option value="val1">text1</option>' +
            '<option value="val2">text2</option>' +
        '</select>'
    );
    test.equals(
        forms.widgets.select({classes: ['one', 'two']}).toHTML('name', {
            choices: {
                val1: 'text1',
                val2: 'text2'
            },
            id: 'someid',
            value: 'val2'
        }),
        '<select name="name" id="someid" class="one two">' +
            '<option value="val1">text1</option>' +
            '<option value="val2" selected="selected">text2</option>' +
        '</select>'
    );
    test.equals(forms.widgets.select().type, 'select');
    test.done();
};

exports.textarea = function (test) {
    test.equals(
        forms.widgets.textarea().toHTML('name', {}),
        '<textarea name="name" id="id_name"></textarea>'
    );
    test.equals(
        forms.widgets.textarea({
            classes: ['one', 'two'],
            rows: 20,
            cols: 80
        }).toHTML('name', {id: 'someid', value: 'value'}),
        '<textarea name="name" id="someid" rows="20" cols="80" class="one two">value</textarea>'
    );
    test.equals(forms.widgets.textarea().type, 'textarea');
    test.done();
};

exports.multipleCheckbox = function (test) {
    var w = forms.widgets.multipleCheckbox(),
        field = {
            choices: {one: 'Item one', two: 'Item two', three: 'Item three'},
            value: 'two'
        };
    test.equals(
        w.toHTML('name', field),
        '<input type="checkbox" name="name" id="id_name_one" value="one" />' +
        '<label for="id_name_one">Item one</label>' +
        '<input type="checkbox" name="name" id="id_name_two" value="two" checked="checked" />' +
        '<label for="id_name_two">Item two</label>' +
        '<input type="checkbox" name="name" id="id_name_three" value="three" />' +
        '<label for="id_name_three">Item three</label>'
    );
    test.equals(forms.widgets.multipleCheckbox().type, 'multipleCheckbox');
    test.done();
};

exports['multipleCheckbox multiple selected'] = function (test) {
    var w = forms.widgets.multipleCheckbox(),
        field = {
            choices: {one: 'Item one', two: 'Item two', three: 'Item three'},
            value: ['two', 'three']
        };
    test.equals(
        w.toHTML('name', field),
        '<input type="checkbox" name="name" id="id_name_one" value="one" />' +
        '<label for="id_name_one">Item one</label>' +
        '<input type="checkbox" name="name" id="id_name_two" value="two" checked="checked" />' +
        '<label for="id_name_two">Item two</label>' +
        '<input type="checkbox" name="name" id="id_name_three" value="three" checked="checked" />' +
        '<label for="id_name_three">Item three</label>'
    );
    test.equals(forms.widgets.multipleCheckbox().type, 'multipleCheckbox');
    test.done();
};

exports.multipleRadio = function (test) {
    var w = forms.widgets.multipleRadio(),
        field = {
            choices: {one: 'Item one', two: 'Item two', three: 'Item three'},
            value: 'two'
        };
    test.equals(
        w.toHTML('name', field),
        '<input type="radio" name="name" id="id_name_one" value="one" />' +
        '<label for="id_name_one">Item one</label>' +
        '<input type="radio" name="name" id="id_name_two" value="two" checked="checked" />' +
        '<label for="id_name_two">Item two</label>' +
        '<input type="radio" name="name" id="id_name_three" value="three" />' +
        '<label for="id_name_three">Item three</label>'
    );
    test.equals(forms.widgets.multipleRadio().type, 'multipleRadio');
    test.done();
};

exports['multipleRadio multiple selected'] = function (test) {
    var w = forms.widgets.multipleRadio(),
        field = {
            choices: {one: 'Item one', two: 'Item two', three: 'Item three'},
            value: ['two', 'three']
        };
    test.equals(
        w.toHTML('name', field),
        '<input type="radio" name="name" id="id_name_one" value="one" />' +
        '<label for="id_name_one">Item one</label>' +
        '<input type="radio" name="name" id="id_name_two" value="two" checked="checked" />' +
        '<label for="id_name_two">Item two</label>' +
        '<input type="radio" name="name" id="id_name_three" value="three" checked="checked" />' +
        '<label for="id_name_three">Item three</label>'
    );
    test.equals(forms.widgets.multipleRadio().type, 'multipleRadio');
    test.done();
};

exports.multipleSelect = function (test) {
    test.equals(
        forms.widgets.multipleSelect().toHTML('name', {choices: {
            val1: 'text1',
            val2: 'text2'
        }}),
        '<select multiple="multiple" name="name" id="id_name">' +
            '<option value="val1">text1</option>' +
            '<option value="val2">text2</option>' +
        '</select>'
    );
    test.equals(
        forms.widgets.multipleSelect({classes: ['one', 'two']}).toHTML('name', {
            choices: {
                val1: 'text1',
                val2: 'text2',
                val3: 'text3'
            },
            id: 'someid',
            value: ['val2', 'val3']
        }),
        '<select multiple="multiple" name="name" id="someid" class="one two">' +
            '<option value="val1">text1</option>' +
            '<option value="val2" selected="selected">text2</option>' +
            '<option value="val3" selected="selected">text3</option>' +
        '</select>'
    );
    test.equals(forms.widgets.multipleSelect().type, 'multipleSelect');
    test.done();
};

exports['optional text input'] = function (test) {
    test.equals(
        forms.widgets.text({
            placeholder: 'Enter some comment',
            'data-trigger': 'focus'
        }).toHTML('field1'),
        '<input type="text" name="field1" id="id_field1" placeholder="Enter some comment" data-trigger="focus" />'
    );
    test.equals(
        forms.widgets.text({
            classes: ['one', 'two'],
            placeholder: 'Enter some comment',
            'data-trigger': 'focus',
            'aria-required': 'false'
        }).toHTML('field1'),
        '<input type="text" name="field1" id="id_field1" class="one two" placeholder="Enter some comment" data-trigger="focus" aria-required="false" />'
    );
    test.equals(
        forms.widgets.text({
            placeholder: 'Enter some comment',
            unknown: 'foo'
        }).toHTML('field1'),
        '<input type="text" name="field1" id="id_field1" placeholder="Enter some comment" />'
    );
    test.equals(
        forms.widgets.text({
            min: 5,
            max: 10,
            unknown: 'foo',
            autocomplete: 'on'
        }).toHTML('field1'),
        '<input type="text" name="field1" id="id_field1" min="5" max="10" autocomplete="on" />'
    );
    test.equals(
        forms.widgets.text({
            placeholder: 'Enter "some" comment'
        }).toHTML('field1'),
        '<input type="text" name="field1" id="id_field1" placeholder="Enter &quot;some&quot; comment" />'
    );
    test.done();
};

exports['optional data attribute regex test'] = function (test) {
    var re = forms.widgets.text().getDataRegExp();
    test.equals(re.test('data-'), false);
    test.equals(re.test('data-input'), true);
    test.equals(re.test('idata-input'), false);
    test.equals(re.test('data-input1'), false);
    test.equals(re.test('data_input'), false);
    test.done();
};

exports.label = function (test) {
    test.equals(
        forms.widgets.label({
            classes: ['foo', 'bar', 'quux'],
            content: 'Foobar'
        }).toHTML('field1'),
        '<label for="field1" class="foo bar quux">Foobar</label>'
    );
    test.equals(
        forms.widgets.label({
            classes: [],
            content: 'Foobar'
        }).toHTML('field1'),
        '<label for="field1">Foobar</label>'
    );
    test.done();
};

