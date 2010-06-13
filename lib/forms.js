var async = require('async');


exports.widgets = require('./widgets');
exports.fields = require('./fields');

exports.create = function(fields){
    var f = {
        fields: fields,
        toHTML: function(){
            return Object.keys(f.fields).map(function(k){
                return f.fields[k].toHTML(k);
            }).join('');
        },
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
        }
    };
    return f;
};
