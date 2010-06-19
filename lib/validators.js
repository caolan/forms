exports.matchField = function(match_field){
    return function(form, field, callback){
        if(form.fields[match_field].data != field.data){
            callback(Error('Does not match ' + match_field));
        }
        else callback();
    };
};

exports.above = function(val){
    return function(form, field, callback){
        if(field.data > val) callback();
        else callback(Error('Not above ' + val));
    }
};

exports.below = function(val){
    return function(form, field, callback){
        if(field.data < val) callback();
        else callback(Error('Not below ' + val));
    }
};

exports.between = function(min, max){
    return function(form, field, callback){
        if(field.data >= min && field.data <= max) callback();
        else callback(Error('Not between ' + min + ' and ' + max));
    }
};

exports.regexp = function(re){
    re = (typeof re == 'string') ? new RegExp(re): re;
    return function(form, field, callback){
        if(re.test(field.data)) callback();
        else callback(Error('Invalid format'));
    };
};
