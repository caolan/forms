var forms = require('forms');
var async = require('async');


exports.string = function(opt){
    opt = opt || {};

    var f = {};

    f.required = opt.required;
    f.widget = forms.widgets.text();
    f.validators = opt.validators;
    f.label = opt.label;

    f.labelElement = function(name, opt){
        var label = f.label;
        if(!label){
            label = name[0].toUpperCase() + name.substr(1).replace('_', ' ');
        }
        var id = (opt && opt.id) ? opt.id: 'id_' + name;
        return '<label for="' + id + '">' + label + '</label>';
    };
    f.parse = function(raw_data){
        if(raw_data !== undefined && raw_data !== null){
            return String(raw_data);
        }
        return '';
    };
    f.bind = function(raw_data, callback){
        f.value = raw_data;
        f.data = f.parse(raw_data);
        if(f.required && (
           raw_data === '' || raw_data === null || raw_data === undefined)){
            f.error = 'required field';
            process.nextTick(function(){callback(null, f)});
        }
        else {
            async.forEachSeries(f.validators || [], function(v, callback){
                v(f.data, raw_data, callback);
            }, function(err){
                f.error = err ? err.message : null;
                callback(err, f);
            });
        }
    };
    f.toHTML = function(name, opts){
        opts = opts || {};
        opts.value = f.value;
        return '<div class="field' +
            (f.error ? ' error': '') + (f.required ? ' required': '') + '">' +
            (f.error ? '<p class="error_msg">' + f.error + '</p>': '') +
            f.labelElement(name, opts) +
            f.widget.toHTML(name, opts) +
        '</div>';
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
