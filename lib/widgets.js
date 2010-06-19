var input = function(type){
    return function(opt){
        var opt = opt || {};
        var w = {};
        w.classes = opt.classes || [];
        w.toHTML = function(name, f){
            var f = f || {};
            var html = '<input';
            html += ' type="' + type + '"';
            html += ' name="' + name + '"';
            html += ' id=' + (f.id ? '"' + f.id + '"': '"id_' + name + '"');
            if(w.classes.length){
                html += ' class="' + w.classes.join(' ') + '"';
            }
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
        var html = '<select';
        html += ' name="' + name + '"';
        html += ' id=' + (f.id ? '"' + f.id + '"': '"id_' + name + '"');
        html += (w.classes.length) ? ' class="' + w.classes.join(' ') + '"': '';
        html += '>';
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
        var html = '<textarea';
        html += ' name="' + name + '"';
        html += ' id=' + (f.id ? '"' + f.id + '"': '"id_' + name + '"');
        html += (w.classes.length) ? ' class="' + w.classes.join(' ') + '"': '';
        html += '>';
        html += f.value ? f.value : '';
        return html + '</textarea>';
    }
    return w;
};
