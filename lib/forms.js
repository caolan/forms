'use strict';

var async = require('async');
var is = require('is');
var http = require('http');
var querystring = require('qs');
var parse = require('url').parse;
var formidable = require('formidable');
var assign = require('object.assign');
var every = require('array.prototype.every');
var keys = require('object-keys');
var reduce = require('reduce');

exports.widgets = require('./widgets');
exports.fields = require('./fields');
exports.render = require('./render');
exports.validators = require('./validators');

exports.create = function (fields, options) {
    var opts = assign({}, options);

    var validatePastFirstError = !!opts.validatePastFirstError;

    keys(fields).forEach(function (k) {
        // if it's not a field object, create an object field.
        if (!is.fn(fields[k].toHTML) && is.object(fields[k])) {
            // eslint-disable-next-line no-param-reassign
            fields[k] = exports.fields.object(fields[k], opts);
        }
        // eslint-disable-next-line no-param-reassign
        fields[k].name = k;
    });
    var f = {
        fields: fields,
        bind: function (data) {
            var b = {
                toHTML: f.toHTML,
                fields: {}
            };
            keys(f.fields).forEach(function (k) {
                if (data != null || f.fields[k].required) {
                    b.fields[k] = f.fields[k].bind((data || {})[k]);
                }
            });
            b.data = reduce(b.fields, function (a, bField, k) {
                // eslint-disable-next-line no-param-reassign
                a[k] = bField.data;
                return a;
            }, {});
            b.validate = function () {
                var callback = arguments.length > 1 ? arguments[1] : arguments[0];

                async.forEach(keys(b.fields), function (k, asyncCallback) {
                    b.fields[k].validate(b, function (err, bound_field) {
                        b.fields[k] = bound_field;
                        asyncCallback(validatePastFirstError ? null : err);
                    });
                }, function (err) {
                    callback(err, b);
                });
            };
            b.isValid = function () {
                var form = this;
                return every(keys(form.fields), function (k) {
                    var field = form.fields[k];
                    if (is.fn(field.isValid)) {
                        return field.isValid();
                    }
                    return field.error === null || typeof field.error === 'undefined';
                });
            };
            return b;
        },
        handle: function (obj, callbacks) {
            if (typeof obj === 'undefined' || obj === null || (is.object(obj) && is.empty(obj))) {
                (callbacks.empty || callbacks.other)(f, callbacks);
            } else if (obj instanceof http.IncomingMessage) {
                if (obj.method === 'GET') {
                    var qs = parse(obj.url, { parseArrays: false }).query;
                    f.handle(querystring.parse(qs), callbacks);
                } else if (obj.method === 'POST' || obj.method === 'PUT') {
                    /*
                     * If the app is using bodyDecoder for connect or express,
                     * it has already put all the POST data into request.body.
                     */
                    if (obj.body) {
                        f.handle(obj.body, callbacks);
                    } else {
                        var form = new formidable.IncomingForm();
                        form.parse(obj, function (err, originalFields/* , files*/) {
                            if (err) {
                                throw err;
                            }
                            var parsedFields = querystring.parse(querystring.stringify(originalFields));
                            f.handle(parsedFields, callbacks);
                        });
                    }
                } else {
                    throw new Error('Cannot handle request method: ' + obj.method);
                }
            } else if (is.object(obj)) {
                f.bind(obj).validate(function (err, field) {
                    if (field.isValid()) {
                        (callbacks.success || callbacks.other)(field, callbacks);
                    } else {
                        (callbacks.error || callbacks.other)(field, callbacks);
                    }
                });
            } else {
                throw new Error('Cannot handle type: ' + typeof obj);
            }
        },
        toHTML: function () {
            var form = this;

            var iterator = arguments.length > 1 ? arguments[1] : arguments[0];
            var name = arguments.length > 1 ? arguments[0] : void 0;

            return reduce(form.fields, function (html, field, k) {
                var kname = is.string(name) ? name + '[' + k + ']' : k;
                return html + field.toHTML(kname, iterator);
            }, '');
        }
    };
    return f;
};
