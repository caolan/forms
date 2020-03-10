'use strict';

var http = require('http');
var util = require('util');
var fs = require('fs');
var forms = require('../lib/forms');
var jsontemplate = require('./json-template');
var parse = require('url').parse;

var fields = forms.fields,
    validators = forms.validators,
    widgets = forms.widgets;

// template for the example page
var template = jsontemplate.Template(String(fs.readFileSync(__dirname + '/page.jsont')));

/*
var inputWithOptionalAttributes = forms.widgets.text({
    placeholder: 'Where do you "work"?',
    'data-toggle': 'focus'
});
*/

var complexForm = forms.create({
    name: fields.string({ required: validators.required('%s is required, silly!') }),
    email: fields.email({ required: true, label: 'Email Address' }),
    website: fields.url(),
    password: fields.password({ required: true }),
    password_confirm: fields.password({
        required: true,
        validators: [validators.matchField('password')]
    }),
    phone_1: fields.string({ validators: [validators.requiresFieldIfEmpty('phone_2')] }),
    phone_2: fields.string({ validators: [validators.requiresFieldIfEmpty('phone_1')] }),
    options: fields.string({
        choices: {
            one: 'option one',
            two: 'option two',
            three: 'option three'
        },
        widget: widgets.select(),
        validators: [
            function (form, field, callback) {
                if (field.data === 'two') {
                    callback('two?! are you crazy?!');
                } else {
                    callback();
                }
            }
        ]
    }),
    more_options: fields.array({
        choices: {
            one: 'item 1',
            two: 'item 2',
            three: 'item 3'
        },
        widget: widgets.multipleCheckbox()
    }),
    even_more: fields.string({
        choices: {
            one: 'item 1',
            two: 'item 2',
            three: 'item 3'
        },
        widget: widgets.multipleRadio()
    }),
    and_more: fields.array({
        choices: {
            one: 'item 1',
            two: 'item 2',
            three: 'item 3'
        },
        widget: widgets.multipleSelect()
    }),
    notes: fields.string({ widget: widgets.textarea({ rows: 6 }) }),
    spam_me: fields['boolean'](),
    nested_1: { nested_2: { nested: fields.string() } }
});

http.createServer(function (req, res) {
    complexForm.handle(req, {
        success: function (form) {
            var req_data = parse(req.url, 1).query;
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write('<h1>Success!</h1>');
            res.write('<h2>' + util.inspect(req_data) + '</h2>');
            res.end('<pre>' + util.inspect(form.data) + '</pre>');
        },
        other: function (form) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(template.expand({
                form: form.toHTML(),
                method: 'POST',
                enctype: 'multipart/form-data'
            }));
        }
    });

}).listen(8080);

util.puts('Server running at http://127.0.0.1:8080/');
