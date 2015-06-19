'use strict';

var test = require('tape');
var tag = require('../lib/tag');
var forms = require('../');

test('generates a self-closing tag', function (t) {
    var attrs = {
        classes: ['foo', 'bar'],
        src: 'foo.jpg'
    };
    var html = tag('img', attrs, 'self-closing tags have no content');
    t.equal(html, '<img src="foo.jpg" class="foo bar" />');
    t.end();
});

test('generates a non-self-closing tag', function (t) {
    var attrs = {
        classes: ['foo', 'bar'],
        'data-foo': 'baz'
    };
    var html = tag('div', attrs, 'some content');
    t.equal(html, '<div data-foo="baz" class="foo bar">some content</div>');
    t.end();
});

test('allow empty attributes', function (t) {
    var html = forms.widgets.select().toHTML('field', {
        choices: {
            '': 'Make a choice',
            choice1: 'Choice 1',
            choice2: 'Choice 2'
        }
    });
    t.equal(html,
        '<select name="field" id="id_field">' +
            '<option value="">Make a choice</option>' +
            '<option value="choice1">Choice 1</option>' +
            '<option value="choice2">Choice 2</option>' +
        '</select>'
    );

    var html2 = forms.widgets.text({
        'data-empty': ''
    }).toHTML('field');

    t.equal(html2,
        '<input type="text" name="field" id="id_field" data-empty="" />'
    );

    t.end();
});

