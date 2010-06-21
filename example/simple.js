require.paths.push(__dirname + '/../lib');
require.paths.push(__dirname + '/../deps');


var http = require('http'),
    sys = require('sys'),
    fs = require('fs'),
    forms = require('forms'),
    jsontemplate = require('./json-template'),
    parse = require('url').parse;

var fields = forms.fields,
    validators = forms.validators,
    widgets = forms.widgets;

// template for the example page
var template = jsontemplate.Template(
    fs.readFileSync(__dirname + '/page.jsont').toString()
);

// our example registration form
var reg_form = forms.create({
    username: fields.string({required: true}),
    password: fields.password({required: true}),
    confirm:  fields.password({
        required: true,
        validators: [validators.matchField('password')]
    }),
    email: fields.email()
});


http.createServer(function(req, res){

    reg_form.handle(req, {
        success: function(form){
            var req_data = require('url').parse(req.url,1).query;
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('<h1>Success!</h1>');
            res.end('<pre>' + sys.inspect(form.data) + '</pre>');
        },
        // perhaps also have error and empty events
        other: function(form){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(template.expand({form: form.toHTML()}));
        }
    });

}).listen(8080);

sys.puts('Server running at http://127.0.0.1:8080/');
