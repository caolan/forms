/*jslint node: true */
'use strict';

/* 
 *  You need to additionally install express, jade for this to work 
 *
 *     $ npm install express jade
*/

var http = require('http'),
    sys = require('sys'),
    fs = require('fs'),
    forms = require('../lib/forms'),
    express = require('express'),
    app = module.exports = express.createServer();

var fields = forms.fields,
    validators = forms.validators,
    widgets = forms.widgets;

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

app.configure(function () {
    app.set('views', __dirname);
    app.set('view engine', 'jade');

    app.use(express.bodyParser());
    app.use(app.router);
});

app.get('/', function (req, res) {
    res.render('page', {
        locals: {
            title: 'Filling out the form...',
            form: reg_form.toHTML()
        }
    });
});

app.post('/', function (req, res) {
    reg_form.handle(req, {
        success: function (form) {
            res.render('page', {
                locals: {
                    title: 'Success!'
                }
            });
        },
        other: function (form) {
            res.render('page', {
                locals: {
                    title: 'Failed!',
                    form: form.toHTML()
                }
            });
        }
    });
});

if (!module.parent) {
    app.listen(8080);
    sys.puts('Express server running at http://127.0.0.1:8080/');
}

