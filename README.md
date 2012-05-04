# Forms

Constructing a good form by hand is a lot of work. Popular frameworks like
Ruby on Rails and Django contain code to make this process less painful.
This module is an attempt to provide the same sort of helpers for node.js.

    npm install forms

## Contribute

This code is still in its infancy, and I'd really appreciate any contributions,
bug reports, or advice. Especially on the following key areas:

* __Creating sensible default rendering functions that generate flexible,
  accessible markup__. This is an early priority because without being
  confident that the standard markup won't change under their feet, developers
  will not be able to adopt the module for any sort of production use.
* __Exploring write-once validation that works on the client and the server__.
  There are some unique advantages to using the same language at both ends,
  let's try and make the most of it!
* __Ensuring it's easy to use with existing node web frameworks__. Ideally this
  module would integrate well with projects using any of the popular frameworks.
### Contributors

* [luddep](http://github.com/luddep)
* [jedp](https://github.com/jedp)
* [ljharb](https://github.com/ljharb)


## Example

Creating an example registration form:

    var forms = require('forms'),
        fields = forms.fields,
        validators = forms.validators;

    var reg_form = forms.create({
        username: fields.string({required: true}),
        password: fields.password({required: true}),
        confirm:  fields.password({
            required: true,
            validators: [validators.matchField('password')]
        }),
        email: fields.email()
    });

Rendering a HTML representation of the form:

    reg_form.toHTML();

Would produce:

    <div class="field required">
        <label for="id_username">Username</label>
        <input type="text" name="username" id="id_username" value="test" />
    </div>
    <div class="field required">
        <label for="id_password">Password</label>
        <input type="password" name="password" id="id_password" value="test" />
    </div>
    <div class="field required">
        <label for="id_confirm">Confirm</label>
        <input type="password" name="confirm" id="id_confirm" value="test" />
    </div>
    <div class="field">
        <label for="id_email">Email</label>
        <input type="text" name="email" id="id_email" />
    </div>

You'll notice you have to provide your own form tags and submit button, its
more flexible this way ;)

Handling a request:

    function myView(req, res) {

        reg_form.handle(req, {
            success: function (form) {
                // there is a request and the form is valid
                // form.data contains the submitted data
            },
            error: function (form) {
                // the data in the request didn't validate,
                // calling form.toHTML() again will render the error messages
            },
            empty: function (form) {
                // there was no form data in the request
            }
        });

    }

That's it! For more detailed / working examples look in the example folder.
An example server using the form above can be run by doing:

    node example/simple.js

## Available types

A list of the fields, widgets, validators and renderers available as part of
the forms module. Each of these components can be switched with customised
components following the same API.

### Fields

* string
* number
* boolean
* array
* password
* email
* url

### Widgets

* text
* password
* hidden
* checkbox
* select
* textarea
* multipleCheckbox
* multipleRadio
* multipleSelect

### Validators

* matchField
* min
* max
* range
* minLength
* maxLength
* rangeLength
* regexp
* email
* url

### Renderers

* div
* p
* li
* table


## API

A more detailed look at the methods and attributes available. Most of these
you will not need to use directly.

### forms.create(fields)
Converts a form definition (an object literal containing field objects) into a
form object.


### Form object

#### Attributes

* fields - Object literal containing the field objects passed to the create
  function

#### form.handle(req, callbacks)
Inspects a request or object literal and binds any data to the correct fields.

#### form.bind(data)
Binds data to correct fields, returning a new bound form object.

#### form.toHTML(iterator)
Runs toHTML on each field returning the result. If an iterator is specified,
it is called for each field with the field name and object as its arguments,
the iterator's results are concatenated to create the HTML output, allowing
for highly customised markup.


### Bound Form object

Contains the same methods as the unbound form, plus:

#### Attributes

* data - Object containing all the parsed data keyed by field name
* fields - Object literal containing the field objects passed to the create
  function

#### form.validate(callback)
Calls validate on each field in the bound form and returns the resulting form
object to the callback.

#### form.isValid()
Checks all fields for an error attribute. Returns false if any exist, otherwise
returns true.

#### form.toHTML(iterator)
Runs toHTML on each field returning the result. If an iterator is specified,
it is called for each field with the field name and object as its arguments,
the iterator's results are concatenated to create the HTML output, allowing
for highly customised markup.


### Field object

#### Attributes

* label - Optional label text which overrides the default
* required - Boolean describing whether the field is mandatory
* validators - An array of functions which validate the field data
* widget - A widget object to use when rendering the field
* id - An optional id to override the default
* choices - A list of options, used for multiple choice fields

#### field.parse(rawdata)

Coerces the raw data from the request into the correct format for the field,
returning the result, e.g. '123' becomes 123 for the number field.

#### field.bind(rawdata)

Returns a new bound field object. Calls parse on the data and stores in the
bound field's data attribute, stores the raw value in the value attribute.

#### field.errorHTML()

Returns a string containing a HTML element containing the fields error
message, or an empty string if there is no error associated with the field.

#### field.labelText(name)

Returns a string containing the label text from field.label, or defaults to
using the field name with underscores replaced with spaces and the first
letter capitalised.

#### field.labelHTML(name, id)

Returns a string containing a label element with the correct 'for' attribute
containing the text from field.labelText(name).

#### field.classes()

Returns an array of default CSS classes considering the field's attributes,
e.g. ['field', 'required', 'error'] for a required field with an error message.

#### field.toHTML(name, iterator)

Calls the iterator with the name and field object as arguments. Defaults to
using forms.render.div as the iterator, which returns a HTML representation of
the field label, error message and widget wrapped in a div.

### Bound Field object

_same as field object, but with a few extensions_

#### Attributes

* value - The raw value from the request data
* data - The request data coerced to the correct format for this field
* error - An error message if the field fails validation

#### validate(callback)

Checks if the field is required and whether it is empty. Then runs the
validator functions in order until one fails or they all pass. If a validator
fails, the resulting message is stored in the field's error attribute.


### Widget object

#### Attributes

* classes - Custom classes to add to the rendered widget
* type - A string representing the widget type, e.g. 'text' or 'checkbox'

#### toHTML(name, field)

Returns a string containing a HTML representation of the widget for the given
field.


### Validator

A function that accepts a bound form, bound field and a callback as arguments.
It should apply a test to the field to assert its validity. Once processing
has completed it must call the callback with no arguments if the field is
valid or with an error message if the field is invalid.


### Renderer

A function which accepts a name and field as arguments and returns a string
containing a HTML representation of the field.
