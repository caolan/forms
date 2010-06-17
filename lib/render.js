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

exports.div = function(name, field){
    return '<div class="' + field.classes().join(' ') + '">' +
        field.errorHTML() +
        field.labelHTML(name) +
        field.widget.toHTML(name, {value: field.value}) +
    '</div>';
};

exports.p = function(name, field){
    return '<p class="' + field.classes().join(' ') + '">' +
        field.errorHTML() +
        field.labelHTML(name) +
        field.widget.toHTML(name, {value: field.value}) +
    '</p>';
};

exports.li = function(name, field){
    return '<li class="' + field.classes().join(' ') + '">' +
        field.errorHTML() +
        field.labelHTML(name) +
        field.widget.toHTML(name, {value: field.value}) +
    '</li>';
};

exports.table = function(name, field){
    return '<tr class="' + field.classes().join(' ') + '">' +
        '<th>' + field.labelHTML(name) + '</th>' +
        '<td>' +
            field.errorHTML() +
            field.widget.toHTML(name, {value: field.value}) +
        '</td>' +
    '</tr>';
};
