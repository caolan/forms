/*jslint node: true */
'use strict';
var test = require('tape');
var tag = require('../lib/tag');

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

