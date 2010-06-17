var forms = require('forms'),
    async = require('async');


exports.string = function(opt){
    opt = opt || {};

    var f = {};

    f.required = opt.required;
    f.widget = forms.widgets.text();
    f.validators = opt.validators;
    f.label = opt.label;

    f.parse = function(raw_data){
        if(raw_data !== undefined && raw_data !== null){
            return String(raw_data);
        }
        return '';
    };
    f.bind = function(raw_data, callback){
        var b = {};
        // clone field object:
        for(var k in f) b[k] = f[k];
        b.value = raw_data;
        b.data = b.parse(raw_data);
        if(b.required && (
           raw_data === '' || raw_data === null || raw_data === undefined)){
            b.error = 'required field';
            process.nextTick(function(){callback(null, b)});
        }
        else {
            async.forEachSeries(b.validators || [], function(v, callback){
                v(b.data, raw_data, callback);
            }, function(err){
                b.error = err ? err.message : null;
                callback(err, b);
            });
        }
    };
    f.errorHTML = function(){
        return this.error ? '<p class="error_msg">' + this.error + '</p>': '';
    };
    f.labelHTML = function(name, id){
        var label = this.label;
        if(!label){
            label = name[0].toUpperCase() + name.substr(1).replace('_', ' ');
        }
        return '<label for="' + (id || 'id_'+name) + '">' + label + '</label>';
    };
    f.classes = function(){
        var r = ['field'];
        if(this.error) r.push('error');
        if(this.required) r.push('required');
        return r;
    },
    f.toHTML = function(name, iterator){
        return (iterator || forms.render.div)(name, this);
    };

    return f;
};


exports.number = function(opt){
    opt = opt || {};
    var f = exports.string(opt);

    f.parse = function(raw_data){
        if(raw_data === null || raw_data === ''){
            return NaN;
        }
        return Number(raw_data);
    };
    return f;
};
