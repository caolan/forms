var input = function(type){
    return function(opt){
        opt = opt || {};

        var w = {};
        w.classes = opt.classes;
        w.toHTML = function(name, opt){
            opt = opt || {};
            var html = '<input ';
            html += 'type="' + type + '" ';
            html += 'name="' + name + '" ';
            html += opt.id ? 'id="' + opt.id + '" ': 'id="id_' + name + '" ';
            if(w.classes){
                html += 'class="' + w.classes.join(' ') + '" ';
            }
            if(opt.value){
                html += 'value="' + opt.value + '" ';
            }
            return html + '/>';
        }
        return w;
    };
};

exports.text = input('text');
exports.password = input('password');
exports.checkbox = input('checkbox');
exports.hidden = input('hidden');
