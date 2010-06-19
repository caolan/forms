var field_attrs = function(a){
    html = ' name="' + a.name + '"';
    html += ' id=' + (a.id ? '"' + a.id + '"': '"id_' + a.name + '"');
    html += (a.classes.length) ? ' class="' + a.classes.join(' ') + '"': '';
    return html;
};

var input = function(type){
    return function(opt){
        var opt = opt || {};
        var w = {};
        w.classes = opt.classes || [];
        w.toHTML = function(name, f){
            var f = f || {};
            var html = '<input';
            html += ' type="' + type + '"';
            html += field_attrs({name: name, id: f.id, classes: w.classes});
            if(f.value){
                html += ' value="' + f.value + '"';
            }
            return html + ' />';
        }
        return w;
    };
};

exports.text = input('text');
exports.password = input('password');
exports.checkbox = input('checkbox');
exports.hidden = input('hidden');

exports.select = function(opt){
    var opt = opt || {};
    var w = {};
    w.classes = opt.classes || [];
    w.toHTML = function(name, f){
        var f = f || {};
        var html = '<select' + field_attrs({
            name: name,
            id: f.id,
            classes: w.classes
        }) + '>';
        html += Object.keys(f.choices).reduce(function(html, k){
            return html + '<option value="' + k + '"' +
            ((f.value && f.value === k) ? ' selected="selected"': '') + '>' +
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
    w.toHTML = function(name, f){
        var f = f || {};
        var html = '<textarea' + field_attrs({
            name: name,
            id: f.id,
            classes: w.classes
        }) + '>';
        html += f.value ? f.value : '';
        return html + '</textarea>';
    }
    return w;
};
