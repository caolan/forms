/*jslint node: true */
'use strict';

var http = require('http'),
    util = require('util'),
    fs = require('fs'),
    forms = require('../lib/forms'),
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
    personal: {
        name: fields.string({required: true, label: 'Name'}),
        email: fields.email({required: true, label: 'Email'}),
        address: {
            address1: fields.string({required: true, label: 'Address 1'}),
            address2: fields.string({label: 'Address 2'}),
            city: fields.string({required: true, label: 'City'}),
            state: fields.string({required: true, label: 'State'}),
            zip: fields.number({required: true, label: 'ZIP'})
        }
    }
});

http.createServer(function (req, res) {
    reg_form.handle(req, {
        success: function (form) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('<h1>Success!</h1>');
            res.end('<pre>' + util.inspect(form.data) + '</pre>');
        },
        // perhaps also have error and empty events
        other: function (form) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(template.expand({
                form: form.toHTML(),
                enctype: '',
                method: 'GET'
            }));
        }
    });

}).listen(8080);

util.puts('Server running at http://127.0.0.1:8080/');

