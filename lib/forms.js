var async = require('async'),
    http = require('http'),
    querystring = require('querystring'),
    parse = require('url').parse;


exports.widgets = require('./widgets');
exports.fields = require('./fields');
exports.render = require('./render');
exports.validators = require('./validators');

exports.create = function(fields){
    var f = {
        fields: fields,
        bind: function(data){
            var b = {};
            b.toHTML = f.toHTML;
            b.fields = f.fields;
            Object.keys(b.fields).forEach(function(k){
                b.fields[k] = f.fields[k].bind(data[k]);
            });
            b.data = Object.keys(b.fields).reduce(function(a,k){
                a[k] = b.fields[k].data;
                return a;
            }, {});
            b.validate = function(callback){
                async.forEach(Object.keys(b.fields), function(k, callback){
                    f.fields[k].validate(b, function(err, bound_field){
                        b.fields[k] = bound_field;
                        callback(err);
                    });
                }, function(err){
                    callback(err, b);
                });
            };
            b.isValid = function(){
                var form = this;
                return Object.keys(form.fields).every(function(k){
                    return form.fields[k].error == null;
                });
            };
            return b;
        },
        handle: function(obj, callbacks){
            if(obj === undefined || obj === null){
                (callbacks.empty || callbacks.other)(f);
            }
            else if(obj instanceof http.IncomingMessage){
                if(obj.method === 'GET'){
                    f.handle(parse(obj.url, 1).query, callbacks);
                }
                else if(obj.method === 'POST'){
                    var buffer = '';
                    obj.addListener('data', function(chunk){
                        buffer += chunk;
                    });
                    obj.addListener('end', function(){
                        f.handle(querystring.parse(buffer), callbacks);
                    });
                }
                else throw new Error(
                    'Cannot handle request method: ' + obj.method
                );
            }
            else if(typeof obj === 'object'){
                f.bind(obj).validate(function(err, f){
                    if(f.isValid()){
                        (callbacks.success || callbacks.other)(f);
                    }
                    else {
                        (callbacks.error || callbacks.other)(f);
                    }
                });
            }
            else throw new Error('Cannot handle type: ' + typeof obj);
        },
        toHTML: function(iterator){
            var form = this;
            return Object.keys(form.fields).reduce(function(html, k){
                return html + form.fields[k].toHTML(k, iterator);
            }, '');
        }
    };
    return f;
};
