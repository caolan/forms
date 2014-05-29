/*jslint node: true */
'use strict';

var async = require('async'),
    is = require('is'),
    http = require('http'),
    querystring = require('qs'),
    parse = require('url').parse,
    formidable = require('formidable');


exports.widgets = require('./widgets');
exports.fields = require('./fields');
exports.render = require('./render');
exports.validators = require('./validators');

exports.create = function (fields, opts) {
    if (!opts) { opts = {}; }

    var validatePastFirstError = !!opts.validatePastFirstError;

    Object.keys(fields).forEach(function (k) {
        // if it's not a field object, create an object field.
        if (!is.fn(fields[k].toHTML) && is.object(fields[k])) {
            fields[k] = exports.fields.object(fields[k]);
        }
        fields[k].name = k;
    });
    var f = {
        fields: fields,
        bind: function (data) {
            var b = {};
            b.toHTML = f.toHTML;
            b.fields = {};
            Object.keys(f.fields).forEach(function (k) {
                if (data != null) {
                    b.fields[k] = f.fields[k].bind(data[k]);
                }
            });
            b.data = Object.keys(b.fields).reduce(function (a, k) {
                a[k] = b.fields[k].data;
                return a;
            }, {});
            b.validate = function (obj, callback) {
                if (arguments.length === 1) {
                    obj = callback;
                    callback = arguments[0];
                }

                async.forEach(Object.keys(b.fields), function (k, callback) {
                    b.fields[k].validate(b, function (err, bound_field) {
                        b.fields[k] = bound_field;
                        callback(validatePastFirstError ? null : err);
                    });
                }, function (err) {
                    callback(err, b);
                });
            };
            b.isValid = function () {
                var form = this;
                return Object.keys(form.fields).every(function (k) {
                    return form.fields[k].error === null || typeof form.fields[k].error === 'undefined';
                });
            };
            return b;
        },
        handle: function (obj, callbacks) {
            if (typeof obj === 'undefined' || obj === null || (is.object(obj) && is.empty(obj))) {
                (callbacks.empty || callbacks.other)(f, callbacks);
            } else if (obj instanceof http.IncomingMessage) {
                if (obj.method === 'GET') {
                    var qs = parse(obj.url).query;
                    f.handle(querystring.parse(qs), callbacks);
                } else if (obj.method === 'POST' || obj.method === 'PUT') {
                    // If the app is using bodyDecoder for connect or express,
                    // it has already put all the POST data into request.body.
                    if (obj.body) {
                        f.handle(obj.body, callbacks);
                    } else {
                        var form = new formidable.IncomingForm();
                        form.parse(obj, function (err, fields, files) {
                            if (err) { throw err; }
                            fields = querystring.parse(querystring.stringify(fields));
                            f.handle(fields, callbacks);
                        });
                    }
                } else {
                    throw new Error('Cannot handle request method: ' + obj.method);
                }
            } else if (is.object(obj)) {
                f.bind(obj).validate(function (err, f) {
                    if (f.isValid()) {
                        (callbacks.success || callbacks.other)(f, callbacks);
                    } else {
                        (callbacks.error || callbacks.other)(f, callbacks);
                    }
                });
            } else {
                throw new Error('Cannot handle type: ' + typeof obj);
            }
        },
        toHTML: function (name, iterator) {
            var form = this;

            if (arguments.length === 1) {
                name = iterator;
                iterator = arguments[0];
            }

            return Object.keys(form.fields).reduce(function (html, k) {
                var kname = is.string(name) ? name + '[' + k + ']' : k;
                return html + form.fields[k].toHTML(kname, iterator);
            }, '');
        }
    };
    return f;
};

