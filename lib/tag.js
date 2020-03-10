'use strict';

var htmlEscape = require('./htmlEscape');
var is = require('is');
var keys = require('object-keys');
var reduce = require('reduce');

// generates a string for common HTML tag attributes
var attrs = function attrs(a) {
    if (typeof a.id === 'boolean') {
        // eslint-disable-next-line no-param-reassign
        a.id = a.id ? 'id_' + a.name : null;
    }
    if (is.array(a.classes) && a.classes.length > 0) {
        // eslint-disable-next-line no-param-reassign
        a['class'] = htmlEscape(a.classes.join(' '));
    }
    // eslint-disable-next-line no-param-reassign
    a.classes = null;
    var pairs = [];
    keys(a).forEach(function (field) {
        var value = a[field];
        if (typeof value === 'boolean') {
            value = value ? field : null;
        } else if (typeof value === 'number' && isNaN(value)) {
            value = null;
        }
        if (typeof value !== 'undefined' && value !== null) {
            pairs.push(htmlEscape(field) + '="' + htmlEscape(value) + '"');
        }
    });
    return pairs.length > 0 ? ' ' + pairs.join(' ') : '';
};

var selfClosingTags = {
    area: true,
    base: true,
    br: true,
    col: true,
    command: true,
    embed: true,
    hr: true,
    img: true,
    input: true,
    keygen: true,
    link: true,
    meta: true,
    param: true,
    source: true,
    track: true,
    wbr: true
};
var isSelfClosing = function (tagName) {
    return Object.prototype.hasOwnProperty.call(selfClosingTags, tagName);
};

var tag = function tag(tagName, attrsMap, content, contentIsEscaped) {
    var safeTagName = htmlEscape(tagName);
    var attrsHTML = !is.array(attrsMap) ? attrs(attrsMap) : reduce(attrsMap, function (html, map) {
        return html + attrs(map);
    }, '');
    var safeContent = contentIsEscaped ? content : htmlEscape(content);
    return '<' + safeTagName + attrsHTML + (isSelfClosing(safeTagName) ? ' />' : '>' + safeContent + '</' + safeTagName + '>');
};

tag.attrs = attrs;

module.exports = tag;
