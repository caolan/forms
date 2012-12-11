/*jslint node: true */

exports.trim = function (val) {
	var chars = '\\r\\n\\t\\s';
	
	return function (field, callback) {
        callback(field.data.replace(new RegExp('^['+chars+']+|['+chars+']+$', 'g'), ''));
    };
};

exports.toUpperCase = function (val) {	
	return function (field, callback) {
        callback(field.data.toUpperCase());
    };
};