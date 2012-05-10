/*jslint node: true */

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

app.configure(function () {
    app.set('views', __dirname);
    app.set('view engine', 'jade');

    app.use(express.bodyParser());
    app.use(app.router);
});

// Create a beautiful form
var tags = forms.widgets.text({
    placeholder: 'Comma separated list of tags',
});

var choices = { auto: 'auto', restaurant: 'restaurant', theatres: 'theatres' };

var form = forms.create({
    comment: fields.bootstrap({
        label: 'Your comment is',
        widget: widgets.textarea({rows: 6}),
        required: true
    }),
    tags: fields.bootstrap({
        label: 'Tag your comment',
        widget: tags,
        help_text: 'See http://en.wikipedia.org/wiki/Tag',
        required: true
    }),
    category: fields.bootstrap({
        label: 'Select appopriate category for this product',
        choices: choices,
        widget: widgets.select(),
        validators: [function (form, field, callback) {
          if (field.data === '0') {
            callback('You need to select a category');
          } else {
            callback();
          }
        }],
        required: true
    }),
    emotion: fields.bootstrap({
        label: 'Your emotion about the product is',
        choices: { neutral: 'Neutral', happy: 'Happy', unhappy: 'Unhappy' },
        widget: widgets.select(),
        required: true
    }),
    location: fields.bootstrap({
        label: 'Location (optional)'
    })
});

app.get('/', function (req, res) {
    res.render('bootstrap', {
        locals: {
            title: 'Filling out the form...',
            form: form.toHTML()
        }
    });
});

app.post('/', function (req, res) {
    form.handle(req, {
        success: function (form) {
            res.render('page', {
                locals: {
                    title: 'Success!'
                }
            });
        },
        other: function (form) {
            res.render('bootstrap', {
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
