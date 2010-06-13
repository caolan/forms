exports.text = function(opt){
    opt = opt || {};

    var w = {};
    w.classes = opt.classes;
    w.toHTML = function(name, opt){
        opt = opt || {};
        var html = '<input ';
        html += 'type="text" ';
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
