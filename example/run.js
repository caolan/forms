require.paths.push(__dirname + '/../lib');
require.paths.push(__dirname + '/../deps');


var http = require('http'),
    sys = require('sys'),
    fs = require('fs'),
    forms = require('forms'),
    jsontemplate = require('./json-template'),
    parse = require('url').parse;


// template for the example page
var template = jsontemplate.Template(
    fs.readFileSync(__dirname + '/page.jsont').toString()
);


http.createServer(function(req, res){
    // create a new form object
    var form = forms.create({
        name:  forms.fields.string({required: true}),
        email: forms.fields.string(),
        password: forms.fields.string({
            widget: forms.widgets.password()
        }),
        options: forms.fields.string({
            choices: {
                one: 'option one',
                two: 'option two',
                three: 'option three'
            },
            widget: forms.widgets.select()
        }),
        spam_me: forms.fields.boolean()
    });

    form.handle(req, {
        success: function(form){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('<h1>Success!</h1>');
            res.end('<pre>' + JSON.stringify(form.data) + '</pre>');
        },
        // perhaps also have error and empty events
        other: function(form){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(template.expand({form: form.toHTML()}));
        }
    });

}).listen(8080);

sys.puts('Server running at http://127.0.0.1:8080/');
