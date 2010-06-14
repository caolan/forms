exports.field = {
    classes: function(f){
        return 'field' +
            (f.error ? ' error': '') +
            (f.required ? ' required': '');
    },
    errorMsg: function(f){
        return (f.error ? '<p class="error_msg">' + f.error + '</p>': '');
    },
    labelElement: function(f, name, id){
        var label = f.label;
        if(!label){
            label = name[0].toUpperCase() + name.substr(1).replace('_', ' ');
        }
        return '<label for="' + (id || 'id_'+name) + '">' + label + '</label>';
    }
}

exports.div = function(form){
    return Object.keys(form.fields).reduce(function(html, name){
        var f = form.fields[name];
        return html +
            '<div class="' + exports.field.classes(f) + '">' +
                exports.field.errorMsg(f) +
                exports.field.labelElement(f, name) +
                f.widget.toHTML(name, {value: f.value}) +
            '</div>';
    }, '');
};

exports.p = function(form){
    return Object.keys(form.fields).reduce(function(html, name){
        var f = form.fields[name];
        return html +
            '<p class="' + exports.field.classes(f) + '">' +
                exports.field.errorMsg(f) +
                exports.field.labelElement(f, name) +
                f.widget.toHTML(name, {value: f.value}) +
            '</p>';
    }, '');
};

exports.ul = function(form){
    return '<ul>' +
        Object.keys(form.fields).reduce(function(html, name){
            var f = form.fields[name];
            return html +
                '<li class="' + exports.field.classes(f) + '">' +
                    exports.field.errorMsg(f) +
                    exports.field.labelElement(f, name) +
                    f.widget.toHTML(name, {value: f.value}) +
                '</li>';
        }, '') +
        '</ul>';
};

exports.table = function(form){
    return '<table>' +
        Object.keys(form.fields).reduce(function(html, name){
            var f = form.fields[name];
            return html + '<tr class="' + exports.field.classes(f) + '">' +
                '<th>' + exports.field.labelElement(f, name) + '</th>' +
                '<td>' +
                    exports.field.errorMsg(f) +
                    f.widget.toHTML(name, {value: f.value}) +
                '</td>' +
            '</tr>';
        }, '') +
        '</table>';
};
