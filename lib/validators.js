exports.matchField = function(match_field){
    return function(form, field, callback){
        if(form.fields[match_field].data != field.data){
            callback(Error('Does not match ' + match_field));
        }
        else callback();
    };
};
