/*
from hogan https://github.com/twitter/hogan.js/blob/master/lib/template.js#L317-L327
*/
module.exports = (function () {
    'use strict';

    var rAmp = /&/g,
        rLt = /</g,
        rGt = />/g,
        rApos = /\'/g,
        rQuot = /\"/g,
        hChars = /[&<>\"\']/;

    var coerceToString = function (val) {
        return String(val || '');
    };

    var htmlEscape = function (str) {
        str = coerceToString(str);
        return hChars.test(str) ?
            str.replace(rAmp, '&amp;')
                .replace(rLt, '&lt;')
                .replace(rGt, '&gt;')
                .replace(rApos, '&#39;')
                .replace(rQuot, '&quot;') :
            str;
    };

    return htmlEscape;
}());

