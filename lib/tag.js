var htmlEscape = require('./htmlEscape');

// generates a string for common HTML tag attributes
var attrs = function attrs(a) {
    if (typeof a.id === 'boolean') {
        a.id = a.id ? 'id_' + a.name : null;
    }
    if (Array.isArray(a.classes) && a.classes.length > 0) {
        a['class'] = htmlEscape(a.classes.join(' '));
    }
    a.classes = null;
    var pairs = [];
    Object.keys(a).map(function (field) {
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
    return selfClosingTags.hasOwnProperty(tagName);
};

var tag = function tag(tagName, attrsMap, content) {
    tagName = htmlEscape(tagName);
    var attrsHTML = !Array.isArray(attrsMap) ? attrs(attrsMap) : attrsMap.reduce(function (html, attrsMap) {
        return html + attrs(attrsMap);
    }, '');
    return '<' + tagName + attrsHTML + (isSelfClosing(tagName) ? ' />' : '>' + content + '</' + tagName + '>');
};

tag.attrs = attrs;

module.exports = tag;

