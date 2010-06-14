var async = require('async'),
    http = require('http'),
    parse = require('url').parse;


exports.widgets = require('./widgets');
exports.fields = require('./fields');
exports.render = require('./render');

exports.create = function(fields){
    var f = {
        fields: fields,
        bind: function(data, callback){
            async.forEach(Object.keys(f.fields), function(k, callback){
                return f.fields[k].bind(data[k], callback);
            }, function(err){
                callback(err, f);
            });
        },
        isValid: function(){
            return Object.keys(f.fields).every(function(k){
                return f.fields[k].error == null;
            });
        },
        get data(){
            return Object.keys(f.fields).reduce(function(a,k){
                a[k] = f.fields[k].data;
                return a;
            }, {});
        },
        handle: function(obj, callbacks){
            if(obj === undefined || obj === null){
                (callbacks.empty || callbacks.other)(f);
            }
            else if(obj instanceof http.IncomingMessage){
                f.handle(parse(obj.url, 1).query, callbacks);
            }
            else if(typeof obj === 'object'){
                f.bind(obj, function(err, f){
                    if(f.isValid()){
                        (callbacks.success || callbacks.other)(f);
                    }
                    else {
                        (callbacks.error || callbacks.other)(f);
                    }
                });
            }
            else throw new Error('Cannot handle type: ' + typeof obj);
        }
    };
    return f;
};
