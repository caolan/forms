/*jslint node: true */
'use strict';

var async = require('async'),
    http = require('http'),
    querystring = require('querystring'),
    parse = require('url').parse;


exports.widgets = require('./widgets');
exports.fields = require('./fields');
var Field = exports.fields.obj;
exports.render = require('./render');
exports.validators = require('./validators');

var bracketify = exports.bracketify = function bracketify(names) {
    var filteredNames = names.filter(function (name) { return name; });
    return encodeURIComponent(filteredNames.slice(0, 1)) + filteredNames.slice(1).map(function (n) { return '[' + encodeURIComponent(n) + ']'; }).join('');
};
var dotify = exports.dotify = function dotify(names) {
    var filteredNames = names.filter(function (name) { return name; });
    return filteredNames.join('.');
};

var setName = function setName(fields, parent_names) {
    Object.keys(fields).forEach(function (k) {
        var names = [].concat(parent_names).concat(k);
        if (fields[k].field instanceof Field) {
            fields[k].name = bracketify(names);
            if (!fields[k].id) {
                fields[k].id = 'id_' + dotify(names);
            }
        } else if (typeof fields[k] === 'object') {
            setName(fields[k], names);
        }
    });
};

var bindFields = function bindFields(bFields, fields, data) {
    Object.keys(fields).forEach(function (k) {
        if (fields[k].field instanceof Field) {
            bFields[k] = fields[k].bind(data[k]);
        } else if (typeof fields[k] === 'object') {
            var bkFields = {};
            bindFields(bkFields, fields[k], data[k]);
            bFields[k] = bkFields;
        }
    });
};

exports.create = function (fields) {
    setName(fields);
    var f = {
        fields: fields,
        bind: function (data) {
            var b = {
              toHTML: f.toHTML,
              fields: {}
            };
            bindFields(b.fields, f.fields, data);
            b.data = Object.keys(b.fields).reduce(function (a, k) {
                a[k] = b.fields[k].data;
                return a;
            }, {});
            b.validate = function (callback) {
                async.forEach(Object.keys(b.fields), function validateFields(bFields, k, callback) {
                    if (bFields[k].field instanceof Field) {
                        bFields[k].validate(b, function (err, bound_field) {
                            bFields[k] = bound_field;
                            callback(err);
                        });
                    } else {
                      var bkFields = bFields[k];
                      async.forEach(Object.keys(bkFields), validateFields.bind(null, bkFields), function (err) { callback(err, bkFields); });
                    }
                }.bind(null, b.fields), function (err) {
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
            if (typeof obj === 'undefined' || obj === null || (typeof obj === 'object' && Object.keys(obj).length === 0)) {
                (callbacks.empty || callbacks.other)(f);
            } else if (obj instanceof http.IncomingMessage) {
                if (obj.method === 'GET') {
                    f.handle(parse(obj.url, 1).query, callbacks);
                } else if (obj.method === 'POST' || obj.method === 'PUT') {
                    // If the app is using bodyDecoder for connect or express,
                    // it has already put all the POST data into request.body.
                    if (obj.body) {
                        f.handle(obj.body, callbacks);
                    } else {
                        var buffer = '';
                        obj.addListener('data', function (chunk) {
                            buffer += chunk;
                        });
                        obj.addListener('end', function () {
                            f.handle(querystring.parse(buffer), callbacks);
                        });
                    }
                } else {
                    throw new Error('Cannot handle request method: ' + obj.method);
                }
            } else if (typeof obj === 'object') {
                f.bind(obj).validate(function (err, f) {
                    if (f.isValid()) {
                        (callbacks.success || callbacks.other)(f);
                    } else {
                        (callbacks.error || callbacks.other)(f);
                    }
                });
            } else {
                throw new Error('Cannot handle type: ' + typeof obj);
            }
        },
        toHTML: function (iterator) {
            var form = this;
            return Object.keys(form.fields).map(function toHTML(fields, k) {
                var html;
                if (fields[k].field instanceof Field) {
                    html = fields[k].toHTML(fields[k].name || k, iterator);
                } else if (typeof fields[k] === 'object') {
                    html = Object.keys(fields[k]).map(toHTML.bind(null, fields[k])).join('');
                }
                return html;
            }.bind(null, form.fields)).join('');
        }
    };
    return f;
};

