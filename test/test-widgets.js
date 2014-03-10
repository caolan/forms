/*jslint node: true */
'use strict';
var forms = require('../lib/forms');
var test = require('tape');

var test_input = function (type) {
    return function (test) {
        test.equal(
            forms.widgets[type]().toHTML('field1'),
            '<input type="' + type + '" name="field1" id="id_field1" />'
        );
        var w = forms.widgets[type]({classes: ['test1', 'test2', 'test3']});
        test.equal(
            w.toHTML('field2', {id: 'form2_field2'}),
            '<input type="' + type + '" name="field2" id="form2_field2" class="test1 test2 test3" />'
        );

        var expectedHTML = '<input type="' + type + '" name="field1" id="id_field1" value="some value" />';
        if (type === 'password') {
            expectedHTML = '<input type="' + type + '" name="field1" id="id_field1" />';
        }
        test.equal(forms.widgets[type]().toHTML('field1', {value: 'some value'}), expectedHTML);
        test.equal(forms.widgets[type]().type, type);

        var expectedValues = { password: null };
        var expectedValue = typeof expectedValues[type] !== 'undefined' ? expectedValues[type] : 'hello';
        test.equal(forms.widgets[type]().formatValue('hello'), expectedValue);

        test.strictEqual(forms.widgets[type]().formatValue(false), null);
        test.end();
    };
};

test('text', test_input('text'));
test('email', test_input('email'));
test('password', test_input('password'));
test('hidden', test_input('hidden'));
test('color', test_input('color'));
test('tel', test_input('tel'));

test('date', function (test) {
    var w = forms.widgets.date();
    test.equal(w.formatValue(new Date(Date.UTC(2013, 2, 1))), '2013-03-01');
    test.equal(w.formatValue('2013-03-02'), '2013-03-02');
    test.strictEqual(w.formatValue('invalid'), null);

    test.equal(w.type, 'date');

    test.equal(
        w.toHTML('field1'),
        '<input type="date" name="field1" id="id_field1" />'
    );

    test.equal(
        w.toHTML('field1', {value: '2013-03-03'}),
        '<input type="date" name="field1" id="id_field1" value="2013-03-03" />'
    );


    test.end();
});

test('checkbox', function (test) {
    test.equal(
        forms.widgets.checkbox().toHTML('field1'),
        '<input type="checkbox" name="field1" id="id_field1" value="on" />'
    );
    var w = forms.widgets.checkbox({classes: ['test1', 'test2', 'test3']});
    test.equal(
        w.toHTML('field2', {id: 'form2_field2'}),
        '<input type="checkbox" name="field2" id="form2_field2" value="on" class="test1 test2 test3" />'
    );
    test.equal(
        forms.widgets.checkbox().toHTML('field', {value: true}),
        '<input type="checkbox" name="field" id="id_field" checked="checked" value="on" />'
    );
    test.equal(
        forms.widgets.checkbox().toHTML('field', {value: false}),
        '<input type="checkbox" name="field" id="id_field" value="on" />'
    );
    test.equal(forms.widgets.checkbox().type, 'checkbox');
    test.end();
});

test('select', function (test) {
    test.equal(
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
    test.equal(
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
    test.equal(forms.widgets.select().type, 'select');
    test.end();
});

test('textarea', function (test) {
    test.equal(
        forms.widgets.textarea().toHTML('name', {}),
        '<textarea name="name" id="id_name"></textarea>'
    );
    test.equal(
        forms.widgets.textarea({
            classes: ['one', 'two'],
            rows: 20,
            cols: 80
        }).toHTML('name', {id: 'someid', value: 'value'}),
        '<textarea name="name" id="someid" rows="20" cols="80" class="one two">value</textarea>'
    );
    test.equal(forms.widgets.textarea().type, 'textarea');
    test.end();
});

test('multipleCheckbox', function (test) {
    var w = forms.widgets.multipleCheckbox(),
        field = {
            choices: {one: 'Item one', two: 'Item two', three: 'Item three'},
            value: 'two'
        };
    test.equal(
        w.toHTML('name', field),
        '<input type="checkbox" name="name" id="id_name_one" value="one" />' +
        '<label for="id_name_one">Item one</label>' +
        '<input type="checkbox" name="name" id="id_name_two" value="two" checked="checked" />' +
        '<label for="id_name_two">Item two</label>' +
        '<input type="checkbox" name="name" id="id_name_three" value="three" />' +
        '<label for="id_name_three">Item three</label>'
    );
    test.equal(forms.widgets.multipleCheckbox().type, 'multipleCheckbox');
    test.end();
});

test('multipleCheckbox multiple selected', function (test) {
    var w = forms.widgets.multipleCheckbox(),
        field = {
            choices: {one: 'Item one', two: 'Item two', three: 'Item three'},
            value: ['two', 'three']
        };
    test.equal(
        w.toHTML('name', field),
        '<input type="checkbox" name="name" id="id_name_one" value="one" />' +
        '<label for="id_name_one">Item one</label>' +
        '<input type="checkbox" name="name" id="id_name_two" value="two" checked="checked" />' +
        '<label for="id_name_two">Item two</label>' +
        '<input type="checkbox" name="name" id="id_name_three" value="three" checked="checked" />' +
        '<label for="id_name_three">Item three</label>'
    );
    test.equal(forms.widgets.multipleCheckbox().type, 'multipleCheckbox');
    test.end();
});

test('multipleRadio', function (test) {
    var w = forms.widgets.multipleRadio(),
        field = {
            choices: {one: 'Item one', two: 'Item two', three: 'Item three'},
            value: 'two'
        };
    test.equal(
        w.toHTML('name', field),
        '<input type="radio" name="name" id="id_name_one" value="one" />' +
        '<label for="id_name_one">Item one</label>' +
        '<input type="radio" name="name" id="id_name_two" value="two" checked="checked" />' +
        '<label for="id_name_two">Item two</label>' +
        '<input type="radio" name="name" id="id_name_three" value="three" />' +
        '<label for="id_name_three">Item three</label>'
    );
    test.equal(forms.widgets.multipleRadio().type, 'multipleRadio');
    test.end();
});

test('multipleRadio multiple selected', function (test) {
    var w = forms.widgets.multipleRadio(),
        field = {
            choices: {one: 'Item one', two: 'Item two', three: 'Item three'},
            value: ['two', 'three']
        };
    test.equal(
        w.toHTML('name', field),
        '<input type="radio" name="name" id="id_name_one" value="one" />' +
        '<label for="id_name_one">Item one</label>' +
        '<input type="radio" name="name" id="id_name_two" value="two" checked="checked" />' +
        '<label for="id_name_two">Item two</label>' +
        '<input type="radio" name="name" id="id_name_three" value="three" checked="checked" />' +
        '<label for="id_name_three">Item three</label>'
    );
    test.equal(forms.widgets.multipleRadio().type, 'multipleRadio');
    test.end();
});

test('multipleSelect', function (test) {
    test.equal(
        forms.widgets.multipleSelect().toHTML('name', {choices: {
            val1: 'text1',
            val2: 'text2'
        }}),
        '<select multiple="multiple" name="name" id="id_name">' +
            '<option value="val1">text1</option>' +
            '<option value="val2">text2</option>' +
        '</select>'
    );
    test.equal(
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
    test.equal(forms.widgets.multipleSelect().type, 'multipleSelect');
    test.end();
});

test('optional text input', function (test) {
    test.equal(
        forms.widgets.text({
            placeholder: 'Enter some comment',
            'data-trigger': 'focus'
        }).toHTML('field1'),
        '<input type="text" name="field1" id="id_field1" placeholder="Enter some comment" data-trigger="focus" />'
    );
    test.equal(
        forms.widgets.text({
            classes: ['one', 'two'],
            placeholder: 'Enter some comment',
            'data-trigger': 'focus',
            'aria-required': 'false'
        }).toHTML('field1'),
        '<input type="text" name="field1" id="id_field1" class="one two" placeholder="Enter some comment" data-trigger="focus" aria-required="false" />'
    );
    test.equal(
        forms.widgets.text({
            placeholder: 'Enter some comment',
            unknown: 'foo'
        }).toHTML('field1'),
        '<input type="text" name="field1" id="id_field1" placeholder="Enter some comment" />'
    );
    test.equal(
        forms.widgets.text({
            min: 5,
            max: 10,
            unknown: 'foo',
            autocomplete: 'on'
        }).toHTML('field1'),
        '<input type="text" name="field1" id="id_field1" min="5" max="10" autocomplete="on" />'
    );
    test.equal(
        forms.widgets.text({
            placeholder: 'Enter "some" comment'
        }).toHTML('field1'),
        '<input type="text" name="field1" id="id_field1" placeholder="Enter &quot;some&quot; comment" />'
    );
    test.equal(
        forms.widgets.text({
            tabindex: 1
        }).toHTML('field1'),
        '<input type="text" name="field1" id="id_field1" tabindex="1" />'
    );
    test.end();
});

test('optional data attribute regex test', function (test) {
    var re = forms.widgets.text().getDataRegExp();
    test.equal(re.test('data-'), false);
    test.equal(re.test('data-input'), true);
    test.equal(re.test('idata-input'), false);
    test.equal(re.test('data-input1'), false);
    test.equal(re.test('data_input'), false);
    test.end();
});

test('label', function (test) {
    test.equal(
        forms.widgets.label({
            classes: ['foo', 'bar', 'quux'],
            content: 'Foobar'
        }).toHTML('field1'),
        '<label for="field1" class="foo bar quux">Foobar</label>'
    );
    test.equal(
        forms.widgets.label({
            classes: [],
            content: 'Foobar'
        }).toHTML('field1'),
        '<label for="field1">Foobar</label>'
    );
    test.end();
});

test('dynamic widget attributes', function(test) {
    var re = /autocomplete="no"/;
    Object.keys(forms.widgets).forEach(function(name) {
        var w = forms.widgets[name]();
        w.attrs = {autocomplete: 'no'};
        var html = w.toHTML('test', {choices: {foo: 'bar'}});
        test.equal(re.test(html), true);
    });
    test.end();
});

