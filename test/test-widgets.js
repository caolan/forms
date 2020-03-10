'use strict';

var forms = require('../lib/forms');
var test = require('tape');
var keys = require('object-keys');

var test_input = function (type) {
    return function (t) {
        t.equal(
            forms.widgets[type]().toHTML('field1'),
            '<input type="' + type + '" name="field1" id="id_field1" />'
        );
        var w = forms.widgets[type]({ classes: ['test1', 'test2', 'test3'] });
        t.equal(
            w.toHTML('field2', { id: 'form2_field2' }),
            '<input type="' + type + '" name="field2" id="form2_field2" class="test1 test2 test3" />'
        );

        var expectedHTML = '<input type="' + type + '" name="field1" id="id_field1" value="some value" />';
        if (type === 'password') {
            expectedHTML = '<input type="' + type + '" name="field1" id="id_field1" />';
        }
        t.equal(forms.widgets[type]().toHTML('field1', { value: 'some value' }), expectedHTML);
        t.equal(forms.widgets[type]().type, type);

        var expectedValues = { password: null };
        var expectedValue = typeof expectedValues[type] !== 'undefined' ? expectedValues[type] : 'hello';
        t.equal(forms.widgets[type]().formatValue('hello'), expectedValue);

        t.strictEqual(forms.widgets[type]().formatValue(false), null);
        t.end();
    };
};

test('text', test_input('text'));
test('email', test_input('email'));
test('number', test_input('number'));
test('password', test_input('password'));
test('hidden', test_input('hidden'));
test('color', test_input('color'));
test('tel', test_input('tel'));

test('date', function (t) {
    var w = forms.widgets.date();
    t.equal(w.formatValue(new Date(Date.UTC(2013, 2, 1))), '2013-03-01');
    t.equal(w.formatValue('2013-03-02'), '2013-03-02');
    t.strictEqual(w.formatValue('invalid'), null);

    t.equal(w.type, 'date');

    t.equal(
        w.toHTML('field1'),
        '<input type="date" name="field1" id="id_field1" />'
    );

    t.equal(
        w.toHTML('field1', { value: '2013-03-03' }),
        '<input type="date" name="field1" id="id_field1" value="2013-03-03" />'
    );

    t.end();
});

test('checkbox', function (t) {
    t.equal(
        forms.widgets.checkbox().toHTML('field1'),
        '<input type="checkbox" name="field1" id="id_field1" value="on" />'
    );
    var w = forms.widgets.checkbox({ classes: ['test1', 'test2', 'test3'] });
    t.equal(
        w.toHTML('field2', { id: 'form2_field2' }),
        '<input type="checkbox" name="field2" id="form2_field2" value="on" class="test1 test2 test3" />'
    );
    t.equal(
        forms.widgets.checkbox().toHTML('field', { value: true }),
        '<input type="checkbox" name="field" id="id_field" checked="checked" value="on" />'
    );
    t.equal(
        forms.widgets.checkbox().toHTML('field', { value: false }),
        '<input type="checkbox" name="field" id="id_field" value="on" />'
    );
    t.equal(forms.widgets.checkbox().type, 'checkbox');
    t.end();
});

test('select', function (t) {
    t.equal(
        forms.widgets.select().toHTML('name', {
            choices: {
                val1: 'text1',
                val2: 'text2'
            }
        }),
        '<select name="name" id="id_name">'
            + '<option value="val1">text1</option>'
            + '<option value="val2">text2</option>'
        + '</select>'
    );
    var widget = forms.widgets.select({ classes: ['one', 'two'] });
    t.equal(
        widget.toHTML('name', {
            choices: {
                val1: 'text1',
                val2: 'text2'
            },
            id: 'someid',
            value: 'val2'
        }),
        '<select name="name" id="someid" class="one two">'
            + '<option value="val1">text1</option>'
            + '<option value="val2" selected="selected">text2</option>'
        + '</select>'
    );
    t.equal(widget.type, 'select');

    t.test('throws on invalid choices', function (st) {
        st['throws'](function () {
            forms.widgets.select().toHTML('name', {
                choices: [
                    [['invalid'], 'text1']
                ]
            });
        });

        st['throws'](function () {
            forms.widgets.select().toHTML('name', { choices: ['invalid'] });
        });

        st['throws'](function () {
            forms.widgets.select().toHTML('name', {
                choices: [
                    [{ invalid: 'invalid' }, 'text1']
                ]
            });
        });

        st['throws'](function () {
            forms.widgets.select().toHTML('name', {
                choices: [
                    ['val1', function () { return 'invalid'; }]
                ]
            });
        });

        st.end();
    });

    t.test('supports array choices', function (st) {
        st.equal(
            forms.widgets.select().toHTML('name', {
                choices: [
                    ['val1', 'text1'],
                    ['val2', 'text2'],
                    ['text3',
                        [
                            ['val3', 'text4'],
                            ['val4', 'text5'],
                            ['val5', 'text6']
                        ]
                    ],
                    ['val6', 'text7']
                ]
            }),
            '<select name="name" id="id_name">'
                + '<option value="val1">text1</option>'
                + '<option value="val2">text2</option>'
                + '<optgroup label="text3">'
                    + '<option value="val3">text4</option>'
                    + '<option value="val4">text5</option>'
                    + '<option value="val5">text6</option>'
                + '</optgroup>'
                + '<option value="val6">text7</option>'
            + '</select>'
        );
        st.end();
    });

    t.test('throws on deeply nested choices', function (st) {
        st['throws'](function () {
            forms.widgets.select().toHTML('name', {
                choices: [
                    ['text1',
                        [
                            ['text2',
                                [
                                    ['val1', 'text3']
                                ]
                            ]
                        ]
                    ]
                ]
            });
        });
        st.end();
    });

    t.test('throws on invalid array format', function (st) {
        st['throws'](function () {
            forms.widgets.select().toHTML('name', {
                choices: [
                    []
                ]
            });
        });

        st['throws'](function () {
            forms.widgets.select().toHTML('name', {
                choices: [
                    ['val1']
                ]
            });
        });

        st['throws'](function () {
            forms.widgets.select().toHTML('name', {
                choices: [
                    ['val1', 'text1', 'invalid']
                ]
            });
        });

        st.end();
    });

    t.test('stringifies values', function (st) {
        var html = widget.toHTML('name', {
            choices: {
                1: 'one',
                2: 'two'
            },
            id: 'someid',
            value: 2
        });
        var expectedHTML = '<select name="name" id="someid" class="one two">'
            + '<option value="1">one</option>'
            + '<option value="2" selected="selected">two</option>'
        + '</select>';
        st.equal(html, expectedHTML);
        st.end();
    });
    t.end();
});

test('textarea', function (t) {
    t.equal(
        forms.widgets.textarea().toHTML('name', {}),
        '<textarea name="name" id="id_name"></textarea>'
    );
    t.equal(
        forms.widgets.textarea({
            classes: ['one', 'two'],
            cols: 80,
            placeholder: 'hi!',
            rows: 20
        }).toHTML('name', { id: 'someid', value: 'value' }),
        '<textarea name="name" id="someid" rows="20" cols="80" class="one two" placeholder="hi!">value</textarea>'
    );
    t.equal(forms.widgets.textarea().type, 'textarea');

    t.test('properly escapes contents', function (st) {
        st.equal(
            forms.widgets.textarea().toHTML('name', { value: 'Inside</textarea>Escaped the textarea!' }),
            '<textarea name="name" id="id_name">Inside&lt;/textarea&gt;Escaped the textarea!</textarea>'
        );

        st.end();
    });

    t.end();
});

test('multipleCheckbox', function (t) {
    var w = forms.widgets.multipleCheckbox();
    t.test('basic functionality', function (st) {
        var field = {
            choices: {
                one: 'Item one',
                two: 'Item two',
                three: 'Item three'
            },
            value: 'two'
        };
        st.equal(
            w.toHTML('name', field),
            '<input type="checkbox" name="name" id="id_name_one" value="one" />'
            + '<label for="id_name_one">Item one</label>'
            + '<input type="checkbox" name="name" id="id_name_two" value="two" checked="checked" />'
            + '<label for="id_name_two">Item two</label>'
            + '<input type="checkbox" name="name" id="id_name_three" value="three" />'
            + '<label for="id_name_three">Item three</label>'
        );
        st.equal(w.type, 'multipleCheckbox');

        st.test('label classes', function (st2) {
            var widget = forms.widgets.multipleCheckbox({ labelClasses: ['test1', 'test2', 'test3'] });
            st2.equal(
                widget.toHTML('name', field),
                '<input type="checkbox" name="name" id="id_name_one" value="one" />'
                + '<label for="id_name_one" class="test1 test2 test3">Item one</label>'
                + '<input type="checkbox" name="name" id="id_name_two" value="two" checked="checked" />'
                + '<label for="id_name_two" class="test1 test2 test3">Item two</label>'
                + '<input type="checkbox" name="name" id="id_name_three" value="three" />'
                + '<label for="id_name_three" class="test1 test2 test3">Item three</label>'
            );
            st2.end();
        });

        st.end();
    });

    t.test('throws on nested choices', function (st) {
        st['throws'](function () {
            w.toHTML('name', {
                choices: [
                    ['val1', 'text1'],
                    ['val2', 'text2'],
                    ['text3',
                        [
                            ['val3', 'text4']
                        ]
                    ]
                ]
            });
        });
        st.end();
    });

    t.test('stringifies values', function (st) {
        st.test('single bound value', function (t2) {
            var field = {
                choices: { 1: 'one', 2: 'two', 3: 'three' },
                value: 2
            };
            var html = w.toHTML('name', field);
            var expectedHTML = '<input type="checkbox" name="name" id="id_name_1" value="1" />'
                + '<label for="id_name_1">one</label>'
                + '<input type="checkbox" name="name" id="id_name_2" value="2" checked="checked" />'
                + '<label for="id_name_2">two</label>'
                + '<input type="checkbox" name="name" id="id_name_3" value="3" />'
                + '<label for="id_name_3">three</label>';
            t2.equal(html, expectedHTML);
            t2.end();
        });

        st.test('multiple bound values', function (t2) {
            var field = {
                choices: { 1: 'one', 2: 'two', 3: 'three' },
                value: [1, 2]
            };
            var html = w.toHTML('name', field);
            var expectedHTML = '<input type="checkbox" name="name" id="id_name_1" value="1" checked="checked" />'
                + '<label for="id_name_1">one</label>'
                + '<input type="checkbox" name="name" id="id_name_2" value="2" checked="checked" />'
                + '<label for="id_name_2">two</label>'
                + '<input type="checkbox" name="name" id="id_name_3" value="3" />'
                + '<label for="id_name_3">three</label>';
            t2.equal(html, expectedHTML);
            t2.end();
        });

        st.end();
    });

    t.end();
});

test('multipleCheckbox multiple selected', function (t) {
    var w = forms.widgets.multipleCheckbox(),
        field = {
            choices: {
                one: 'Item one',
                two: 'Item two',
                three: 'Item three'
            },
            value: ['two', 'three']
        };
    t.equal(
        w.toHTML('name', field),
        '<input type="checkbox" name="name" id="id_name_one" value="one" />'
        + '<label for="id_name_one">Item one</label>'
        + '<input type="checkbox" name="name" id="id_name_two" value="two" checked="checked" />'
        + '<label for="id_name_two">Item two</label>'
        + '<input type="checkbox" name="name" id="id_name_three" value="three" checked="checked" />'
        + '<label for="id_name_three">Item three</label>'
    );
    t.equal(forms.widgets.multipleCheckbox().type, 'multipleCheckbox');
    t.end();
});

test('multipleRadio', function (t) {
    var w = forms.widgets.multipleRadio();
    var field = {
        choices: {
            one: 'Item one',
            two: 'Item two',
            three: 'Item three'
        },
        value: 'two'
    };
    t.equal(
        w.toHTML('name', field),
        '<input type="radio" name="name" id="id_name_one" value="one" />'
        + '<label for="id_name_one">Item one</label>'
        + '<input type="radio" name="name" id="id_name_two" value="two" checked="checked" />'
        + '<label for="id_name_two">Item two</label>'
        + '<input type="radio" name="name" id="id_name_three" value="three" />'
        + '<label for="id_name_three">Item three</label>'
    );
    t.equal(forms.widgets.multipleRadio().type, 'multipleRadio');

    t.test('throw on nested choices', function (st) {
        st['throws'](function () {
            w.toHTML('name', {
                choices: [
                    ['val1', 'text1'],
                    ['val2', 'text2'],
                    ['text3',
                        [
                            ['val3', 'text4']
                        ]
                    ]
                ]
            });
        });
        st.end();
    });

    t.test('stringifies values', function (st) {
        st.test('single bound value', function (t2) {
            var boundValueField = {
                choices: { 1: 'one', 2: 'two', 3: 'three' },
                value: 2
            };
            var html = w.toHTML('name', boundValueField);
            var expectedHTML = '<input type="radio" name="name" id="id_name_1" value="1" />'
                + '<label for="id_name_1">one</label>'
                + '<input type="radio" name="name" id="id_name_2" value="2" checked="checked" />'
                + '<label for="id_name_2">two</label>'
                + '<input type="radio" name="name" id="id_name_3" value="3" />'
                + '<label for="id_name_3">three</label>';
            t2.equal(html, expectedHTML);
            t2.end();
        });

        st.test('multiple bound values', function (t2) {
            var boundValuesField = {
                choices: { 1: 'one', 2: 'two', 3: 'three' },
                value: [2, 3]
            };
            var html = w.toHTML('name', boundValuesField);
            var expectedHTML = '<input type="radio" name="name" id="id_name_1" value="1" />'
                + '<label for="id_name_1">one</label>'
                + '<input type="radio" name="name" id="id_name_2" value="2" checked="checked" />'
                + '<label for="id_name_2">two</label>'
                + '<input type="radio" name="name" id="id_name_3" value="3" checked="checked" />'
                + '<label for="id_name_3">three</label>';
            t2.equal(html, expectedHTML);
            t2.end();
        });

        st.end();
    });

    t.test('label classes', function (st) {
        var widget = forms.widgets.multipleRadio({ labelClasses: ['test1', 'test2', 'test3'] });
        st.equal(
            widget.toHTML('name', field),
            '<input type="radio" name="name" id="id_name_one" value="one" />'
            + '<label for="id_name_one" class="test1 test2 test3">Item one</label>'
            + '<input type="radio" name="name" id="id_name_two" value="two" checked="checked" />'
            + '<label for="id_name_two" class="test1 test2 test3">Item two</label>'
            + '<input type="radio" name="name" id="id_name_three" value="three" />'
            + '<label for="id_name_three" class="test1 test2 test3">Item three</label>'
        );
        st.end();
    });

    t.end();
});

test('multipleRadio multiple selected', function (t) {
    var w = forms.widgets.multipleRadio();
    var field = {
        choices: {
            one: 'Item one',
            two: 'Item two',
            three: 'Item three'
        },
        value: ['two', 'three']
    };
    t.equal(
        w.toHTML('name', field),
        '<input type="radio" name="name" id="id_name_one" value="one" />'
        + '<label for="id_name_one">Item one</label>'
        + '<input type="radio" name="name" id="id_name_two" value="two" checked="checked" />'
        + '<label for="id_name_two">Item two</label>'
        + '<input type="radio" name="name" id="id_name_three" value="three" checked="checked" />'
        + '<label for="id_name_three">Item three</label>'
    );
    t.equal(forms.widgets.multipleRadio().type, 'multipleRadio');
    t.end();
});

test('multipleSelect', function (t) {
    t.equal(
        forms.widgets.multipleSelect().toHTML('name', {
            choices: {
                val1: 'text1',
                val2: 'text2'
            }
        }),
        '<select name="name" id="id_name" multiple="multiple">'
            + '<option value="val1">text1</option>'
            + '<option value="val2">text2</option>'
        + '</select>'
    );
    t.equal(
        forms.widgets.multipleSelect({ classes: ['one', 'two'] }).toHTML('name', {
            choices: {
                val1: 'text1',
                val2: 'text2',
                val3: 'text3'
            },
            id: 'someid',
            value: ['val2', 'val3']
        }),
        '<select name="name" id="someid" multiple="multiple" class="one two">'
            + '<option value="val1">text1</option>'
            + '<option value="val2" selected="selected">text2</option>'
            + '<option value="val3" selected="selected">text3</option>'
        + '</select>'
    );
    t.equal(forms.widgets.multipleSelect().type, 'multipleSelect');

    t.test('stringifies values', function (st) {
        var widget = forms.widgets.multipleSelect({ classes: ['one', 'two'] });

        st.test('single bound values', function (t2) {
            var html = widget.toHTML('name', {
                choices: {
                    1: 'text1',
                    2: 'text2',
                    3: 'text3'
                },
                id: 'someid',
                value: 2
            });
            var expectedHTML = '<select name="name" id="someid" multiple="multiple" class="one two">'
                + '<option value="1">text1</option>'
                + '<option value="2" selected="selected">text2</option>'
                + '<option value="3">text3</option>'
            + '</select>';
            t2.equal(html, expectedHTML);
            t2.end();
        });

        st.test('multiple bound values', function (t2) {
            var html = widget.toHTML('name', {
                choices: {
                    1: 'text1',
                    2: 'text2',
                    3: 'text3'
                },
                id: 'someid',
                value: [2, 3]
            });
            var expectedHTML = '<select name="name" id="someid" multiple="multiple" class="one two">'
                + '<option value="1">text1</option>'
                + '<option value="2" selected="selected">text2</option>'
                + '<option value="3" selected="selected">text3</option>'
            + '</select>';
            t2.equal(html, expectedHTML);
            t2.end();
        });

        st.end();
    });

    t.end();
});

test('optional text input', function (t) {
    t.equal(
        forms.widgets.text({
            'data-trigger': 'focus',
            placeholder: 'Enter some comment'
        }).toHTML('field1'),
        '<input type="text" name="field1" id="id_field1" data-trigger="focus" placeholder="Enter some comment" />'
    );
    t.equal(
        forms.widgets.text({
            'aria-required': 'false',
            classes: ['one', 'two'],
            'data-trigger': 'focus',
            placeholder: 'Enter some comment'
        }).toHTML('field1'),
        '<input type="text" name="field1" id="id_field1" class="one two" aria-required="false" data-trigger="focus" placeholder="Enter some comment" />'
    );
    t.equal(
        forms.widgets.text({
            placeholder: 'Enter some comment',
            unknown: 'foo'
        }).toHTML('field1'),
        '<input type="text" name="field1" id="id_field1" placeholder="Enter some comment" />'
    );
    t.equal(
        forms.widgets.text({
            autocomplete: 'on',
            max: 10,
            min: 5,
            unknown: 'foo'
        }).toHTML('field1'),
        '<input type="text" name="field1" id="id_field1" autocomplete="on" max="10" min="5" />'
    );
    t.equal(
        forms.widgets.text({ placeholder: 'Enter "some" comment' }).toHTML('field1'),
        '<input type="text" name="field1" id="id_field1" placeholder="Enter &quot;some&quot; comment" />'
    );
    t.equal(
        forms.widgets.text({ tabindex: 1 }).toHTML('field1'),
        '<input type="text" name="field1" id="id_field1" tabindex="1" />'
    );
    t.end();
});

test('custom attributes', function (t) {
    // regex tests
    t.equal(
        forms.widgets.text({ 'data-': 'foo' }).toHTML('fieldWithAttrs'),
        '<input type="text" name="fieldWithAttrs" id="id_fieldWithAttrs" />'
    );
    t.equal(
        forms.widgets.text({ 'data-input': 'foo' }).toHTML('fieldWithAttrs'),
        '<input type="text" name="fieldWithAttrs" id="id_fieldWithAttrs" data-input="foo" />'
    );
    t.equal(
        forms.widgets.text({ 'idata-input': 'foo' }).toHTML('fieldWithAttrs'),
        '<input type="text" name="fieldWithAttrs" id="id_fieldWithAttrs" />'
    );
    t.equal(
        forms.widgets.text({ 'data-input1': 'foo' }).toHTML('fieldWithAttrs'),
        '<input type="text" name="fieldWithAttrs" id="id_fieldWithAttrs" />'
    );
    t.equal(
        forms.widgets.text({ data_input: 'foo' }).toHTML('fieldWithAttrs'),
        '<input type="text" name="fieldWithAttrs" id="id_fieldWithAttrs" />'
    );
    t.equal(
        forms.widgets.text({ 'data--': 'foo' }).toHTML('fieldWithAttrs'),
        '<input type="text" name="fieldWithAttrs" id="id_fieldWithAttrs" />'
    );
    t.equal(
        forms.widgets.text({ 'data-foo-bar': 'foo' }).toHTML('fieldWithAttrs'),
        '<input type="text" name="fieldWithAttrs" id="id_fieldWithAttrs" data-foo-bar="foo" />'
    );

    // widgets not based on the "input" widget should support optional attributes
    t.equal(
        forms.widgets.textarea({ 'data-test': 'foo' }).toHTML('fieldWithAttrs'),
        '<textarea name="fieldWithAttrs" id="id_fieldWithAttrs" data-test="foo"></textarea>'
    );
    t.equal(
        forms.widgets.label({
            content: 'Foobar',
            'data-test': 'foo'
        }).toHTML('fieldWithAttrs'),
        '<label for="fieldWithAttrs" data-test="foo">Foobar</label>'
    );
    t.equal(
        forms.widgets.checkbox({ 'data-test': 'foo' }).toHTML('fieldWithAttrs'),
        '<input type="checkbox" name="fieldWithAttrs" id="id_fieldWithAttrs" value="on" data-test="foo" />'
    );
    t.equal(
        forms.widgets.select({ 'data-test': 'foo' }).toHTML('name', {
            choices: {
                val1: 'text1',
                val2: 'text2'
            }
        }),
        '<select name="name" id="id_name" data-test="foo">'
            + '<option value="val1">text1</option>'
            + '<option value="val2">text2</option>'
        + '</select>'
    );
    t.equal(
        forms.widgets.multipleSelect({ 'data-test': 'foo' }).toHTML('name', {
            choices: {
                val1: 'text1',
                val2: 'text2'
            }
        }),
        '<select name="name" id="id_name" multiple="multiple" data-test="foo">'
            + '<option value="val1">text1</option>'
            + '<option value="val2">text2</option>'
        + '</select>'
    );

    var w = forms.widgets.multipleCheckbox({ 'data-test': 'foo' });
    var field = {
        choices: {
            one: 'Item one',
            two: 'Item two',
            three: 'Item three'
        },
        value: 'two'
    };
    t.equal(
        w.toHTML('name', field),
        '<input type="checkbox" name="name" id="id_name_one" value="one" data-test="foo" />'
        + '<label for="id_name_one">Item one</label>'
        + '<input type="checkbox" name="name" id="id_name_two" value="two" checked="checked" data-test="foo" />'
        + '<label for="id_name_two">Item two</label>'
        + '<input type="checkbox" name="name" id="id_name_three" value="three" data-test="foo" />'
        + '<label for="id_name_three">Item three</label>'
    );

    var w2 = forms.widgets.multipleRadio({ 'data-test': 'foo' });
    var field2 = {
        choices: {
            one: 'Item one',
            two: 'Item two',
            three: 'Item three'
        },
        value: 'two'
    };
    t.equal(
        w2.toHTML('name', field2),
        '<input type="radio" name="name" id="id_name_one" value="one" data-test="foo" />'
        + '<label for="id_name_one">Item one</label>'
        + '<input type="radio" name="name" id="id_name_two" value="two" checked="checked" data-test="foo" />'
        + '<label for="id_name_two">Item two</label>'
        + '<input type="radio" name="name" id="id_name_three" value="three" data-test="foo" />'
        + '<label for="id_name_three">Item three</label>'
    );

    t.end();
});

test('label', function (t) {
    t.equal(
        forms.widgets.label({
            classes: ['foo', 'bar', 'quux'],
            content: 'Foobar'
        }).toHTML('field1'),
        '<label for="field1" class="foo bar quux">Foobar</label>'
    );
    t.equal(
        forms.widgets.label({
            classes: [],
            content: 'Foobar'
        }).toHTML('field1'),
        '<label for="field1">Foobar</label>'
    );
    t.end();
});

test('dynamic widget attributes', function (t) {
    var theKeys = keys(forms.widgets);
    t.plan(theKeys.length);
    var re = /autocomplete="no"/;
    theKeys.forEach(function (name) {
        var w = forms.widgets[name]();
        w.attrs = { autocomplete: 'no' };
        var html = w.toHTML('test', { choices: { foo: 'bar' } });
        t.equal(re.test(html), true);
    });
    t.end();
});
