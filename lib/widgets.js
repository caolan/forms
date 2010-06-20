// generates a string for common widget attributes
var attrs = function(a){
    html = ' name="' + a.name + '"';
    html += ' id=' + (a.id ? '"' + a.id + '"': '"id_' + a.name + '"');
    html += (a.classes.length) ? ' class="' + a.classes.join(' ') + '"': '';
    return html;
};

// used to generate different input elements varying only by type attribute
var input = function(type){
    return function(opt){
        var opt = opt || {};
        var w = {};
        w.classes = opt.classes || [];
        w.type = type;
        w.toHTML = function(name, f){
            var f = f || {};
            var html = '<input';
            html += ' type="' + type + '"';
            html += attrs({name: name, id: f.id, classes: w.classes});
            html += f.value ? ' value="' + f.value + '"': '';
            return html + ' />';
        }
        return w;
    };
};

exports.text = input('text');
exports.password = input('password');
exports.hidden = input('hidden');

exports.checkbox = function(opt){
    var opt = opt || {};
    var w = {};
    w.classes = opt.classes || [];
    w.type = 'checkbox';
    w.toHTML = function(name, f){
        var f = f || {};
        var html = '<input type="checkbox"';
        html += attrs({name: name, id: f.id, classes: w.classes});
        html += f.value ? ' checked="checked"': '';
        return html + ' />';
    }
    return w;
};

exports.select = function(opt){
    var opt = opt || {};
    var w = {};
    w.classes = opt.classes || [];
    w.type = 'select';
    w.toHTML = function(name, f){
        var f = f || {};
        var html = '<select' + attrs({
            name: name,
            id: f.id,
            classes: w.classes
        }) + '>';
        html += Object.keys(f.choices).reduce(function(html, k){
            return html + '<option value="' + k + '"' +
            ((f.value && f.value == k) ? ' selected="selected"': '') + '>' +
                f.choices[k] +
            '</option>';
        }, '');
        return html + '</select>';
    }
    return w;
};

exports.textarea = function(opt){
    var opt = opt || {};
    var w = {};
    w.classes = opt.classes || [];
    w.type = 'textarea';
    w.toHTML = function(name, f){
        var f = f || {};
        var html = '<textarea' + attrs({
            name: name,
            id: f.id,
            classes: w.classes
        });
        html += opt.rows ? ' rows="' + opt.rows + '"': '';
        html += opt.cols ? ' cols="' + opt.cols + '"': '';
        html += '>';
        html += f.value ? f.value : '';
        return html + '</textarea>';
    }
    return w;
};

exports.multipleCheckbox = function(opt){
    var opt = opt || {};
    var w = {};
    w.classes = opt.classes || [];
    w.type = 'multipleCheckbox';
    w.toHTML = function(name, f){
        var f = f || {};
        return Object.keys(f.choices).reduce(function(html, k){
            // input element
            html += '<input type="checkbox"';
            html += ' name="' + name + '"';

            var id = f.id ? f.id + '_' + k: 'id_' + name + '_' + k;
            html += ' id="' + id + '"';

            if(w.classes.length)
                html += ' class="' + w.classes.join(' ') + '"';

            html += ' value="' + k + '"';

            if(f.value instanceof Array){
                if(f.value.some(function(v){return v == k;})){
                    html += ' checked="checked"';
                }
            }
            else html += (f.value == k) ? ' checked="checked"': '';

            html += '>';

            // label element
            html += '<label for="' + id + '">' + f.choices[k] + '</label>';

            return html;
        }, '');
    };
    return w;
};

exports.multipleRadio = function(opt){
    var opt = opt || {};
    var w = {};
    w.classes = opt.classes || [];
    w.type = 'multipleRadio';
    w.toHTML = function(name, f){
        var f = f || {};
        return Object.keys(f.choices).reduce(function(html, k){
            // input element
            html += '<input type="radio"';
            html += ' name="' + name + '"';

            var id = f.id ? f.id + '_' + k: 'id_' + name + '_' + k;
            html += ' id="' + id + '"';

            if(w.classes.length)
                html += ' class="' + w.classes.join(' ') + '"';

            html += ' value="' + k + '"';

            if(f.value instanceof Array){
                if(f.value.some(function(v){return v == k;})){
                    html += ' checked="checked"';
                }
            }
            else html += (f.value == k) ? ' checked="checked"': '';

            html += '>';

            // label element
            html += '<label for="' + id + '">' + f.choices[k] + '</label>';

            return html;
        }, '');
    };
    return w;
};

exports.multipleSelect = function(opt){
    var opt = opt || {};
    var w = {};
    w.classes = opt.classes || [];
    w.type = 'multipleSelect';
    w.toHTML = function(name, f){
        var f = f || {};
        var html = '<select multiple="mulitple"' + attrs({
            name: name,
            id: f.id,
            classes: w.classes
        }) + '>';
        html += Object.keys(f.choices).reduce(function(html, k){
            html += '<option value="' + k + '"';
            if(f.value instanceof Array){
                if(f.value.some(function(v){return v == k;})){
                    html += ' selected="selected"';
                }
            }
            else if(f.value && f.value == k){
                html += ' selected="selected"';
            }
            html += '>' + f.choices[k] + '</option>';
            return html;
        }, '');
        return html + '</select>';
    }
    return w;
};
