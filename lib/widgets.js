    // Required modules
var jade   = require('jade'),
    fs     = require('fs'),
    events = require('events'),

    /**
     * Returns the template path for a given widget file.
     * @param {String} file
     * @return String
     */
    fieldFile = function(file) {
      return __dirname + '/templates/widgets/' + file + '.jade';
    },

    /**
     * Creates a Widget object with some default configuration.
     * @param {String} type
     * @param {Object} defaults
     * @return Widget
     */
    create = function(type, defaults) {
      defaults       = defaults || {};
      defaults.value = defaults.value || null;

      return function(opts) {
        var x, y, obj, widget, attrs={};

        for (x in defaults) {
          attrs[x] = defaults[x];
        }

        for (x in opts) {
          // Cast to array if default is array.
          if (attrs[x] instanceof Array && !opts[x] instanceof Array) opts[x] = [opts[x]];
          // Cast arrays into objects if default is object.
          if (!attrs[x] instanceof Array && attrs[x] instanceof Object && opts[x] instanceof Array) {
            obj = {};
            for (y=0; y<opts[x].length; y++) {
              obj[opts[x][y]] = opts[x][y];
            }
            opts[x] = obj;
          }
          attrs[x] = opts[x];
        }

        widget = new Widget(type, attrs);

        if (attrs.hasOwnProperty('beforeRender')) {
          widget.on('beforeRender', attrs.beforeRender);
          delete attrs.beforeRender;
        }

        return widget;
      };
    },

    createInput = function(type) {
      return create(type, {
        type: type,
        template: Widget.templates.INPUT
      });
    },

    /**
     * A class representing a widget.
     * @class Widget
     * @extends events.EventEmitter
     * @param {String} name The widget name, ie "input", "select" etc.
     * @param {Object} attrs Key value attributes and configuration.
     */
    Widget = function(type, attrs) {
      this.attrs = attrs;
      this.type  = type;
      events.EventEmitter.call(this);
    };

Widget.prototype = new events.EventEmitter();

/**
 * Returns the widget as HTML.
 * @for Widget
 * @param {String} name The name attribute.
 * @param {Object} attrs Other attributes.
 * @return String
 */
Widget.prototype.toHTML = function(name, attrs) {
  var attrs = attrs || {},
      fieldTemplate, fieldData, field, x;

  for (x in this.attrs) {
    if (!attrs.hasOwnProperty(x)) {
      attrs[x] = this.attrs[x];
    }
  }
  
  fieldTemplate = attrs.template || fieldFile(this.type);
  fieldData     = fs.readFileSync(fieldTemplate);

  this.emit('beforeRender', attrs);

  field      = jade.compile(fieldData, { self: true }),
  attrs.name = name;
  attrs.id   = attrs.id || name;

  return field(attrs);
};

Widget.templates = {
  INPUT: fieldFile('input'),
  MULTIPLE_CHECKBOX: fieldFile('multipleCheckbox'),
  MULTIPLE_RADIO: fieldFile('multipleRadio'),
  SELECT: fieldFile('select'),
  TEXTAREA: fieldFile('textArea')
};

// Exports

exports.create = create;
exports.Widget = Widget;

exports.text = createInput('text');
exports.password = createInput('password');
exports.hidden = createInput('hidden');
exports.radio = createInput('radio');
exports.date = createInput('date');

exports.checkbox = create('checkbox', {
  type: 'checkbox',
  template: Widget.templates.INPUT,
  beforeRender: function(attrs) {
    var x;
    if (attrs.value) {
      attrs.checked = true;
      delete attrs.value;
    }
  }
});

exports.select = create('select', {
  choices: {},
  value: []
});

exports.multipleSelect = create('multipleSelect', {
  choices: {},
  value: [],
  multiple: true,
  template: Widget.templates.SELECT
});

exports.multipleCheckbox = create('multipleCheckbox', {
  choices: {},
  value: []
});

exports.multipleRadio = create('multipleRadio', {
  choices: {}
});

exports.textarea = create('textarea');

