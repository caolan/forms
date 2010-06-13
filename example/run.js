require.paths.push(__dirname + '/../lib');
require.paths.push(__dirname + '/../deps');


var http = require('http'),
    sys = require('sys'),
    fs = require('fs'),
    forms = require('forms'),
    jsontemplate = require('./json-template'),
    parse = require('url').parse;


// template for the page which displays the form
var template = jsontemplate.Template(
    fs.readFileSync(__dirname + '/page.jsont').toString()
);


http.createServer(function(req, res){
    // parse the url for pathname and query data
    req.url = parse(req.url, true);

    if(req.url.pathname == '/'){
        // create a new form object
        var form = forms.create({
            name:  forms.fields.string({required: true}),
            email: forms.fields.string()
        });

        /*
        form.handle(req.url.query, {
            success: function(data){
                res.writeHead(302, {'Location': '/success'});
                res.end();
            },
            // perhaps also have error and empty events
            other: function(form){
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(template.expand({form: form.toHTML()}));
            }
        });
        */

        // if we got some data
        if(req.url.query){
            form.bind(req.url.query, function(err, form){
                if(form.isValid()){
                    // the form data is valid, redirect to success page!
                    res.writeHead(302, {'Location': '/success'});
                    res.end();
                }
                else {
                    // return the html for the form:
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.end(template.expand({form: form.toHTML()}));
                }
            });
        }
        else {
            // return the html for the form:
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(template.expand({form: form.toHTML()}));
        }
    }
    else if(req.url.pathname == '/success'){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('<h1>Form submitted!</h1>');
    }
}).listen(8080);

sys.puts('Server running at http://127.0.0.1:8080/');
