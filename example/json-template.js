// Copyright (C) 2009 Andy Chu
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// $Id$

//
// JavaScript implementation of json-template.
//

// This is predefined in tests, shouldn't be defined anywhere else.  TODO: Do
// something nicer.
var log = log || function() {};
var repr = repr || function() {};


// The "module" exported by this script is called "jsontemplate":

var jsontemplate = function() {


// Regex escaping for common metacharacters (note that JavaScript needs 2 \\ --
// no raw strings!
var META_ESCAPE = {
  '{': '\\{',
  '}': '\\}',
  '{{': '\\{\\{',
  '}}': '\\}\\}',
  '[': '\\[',
  ']': '\\]'
};

function _MakeTokenRegex(meta_left, meta_right) {
  // TODO: check errors
  return new RegExp(
      '(' +
      META_ESCAPE[meta_left] +
      '.+?' +
      META_ESCAPE[meta_right] +
      '\n?)', 'g');  // global for use with .exec()
}

// 
// Formatters
//

function HtmlEscape(s) {
  return s.replace(/&/g,'&amp;').
           replace(/>/g,'&gt;').
           replace(/</g,'&lt;');
}

function HtmlTagEscape(s) {
  return s.replace(/&/g,'&amp;').
           replace(/>/g,'&gt;').
           replace(/</g,'&lt;').
           replace(/"/g,'&quot;');
}

// Default ToString can be changed
function ToString(s) {
  if (s === null) {
    return 'null';
  }
  return s.toString();
}

var DEFAULT_FORMATTERS = {
  'html': HtmlEscape,
  'htmltag': HtmlTagEscape,
  'html-attr-value': HtmlTagEscape,
  'str': ToString,
  'raw': function(x) {return x;}
};


//
// Template implementation
//

function _ScopedContext(context, undefined_str) {
  // The stack contains:
  //   The current context (an object).
  //   An iteration index.  -1 means we're NOT iterating.
  var stack = [{context: context, index: -1}];

  return {
    PushSection: function(name) {
      if (name === undefined || name === null) {
        return null;
      }
      var new_context = stack[stack.length-1].context[name] || null;
      stack.push({context: new_context, index: -1});
      return new_context;
    },

    Pop: function() {
      stack.pop();
    },

    next: function() {
      var stacktop = stack[stack.length-1];

      // Now we're iterating -- push a new mutable object onto the stack
      if (stacktop.index == -1) {
        stacktop = {context: null, index: 0};
        stack.push(stacktop);
      }

      // The thing we're iterating over
      var context_array = stack[stack.length-2].context;

      // We're already done
      if (stacktop.index == context_array.length) {
        stack.pop();
        return undefined;  // sentinel to say that we're done
      }

      stacktop.context = context_array[stacktop.index++];
      return true;  // OK, we mutated the stack
    },

    _Undefined: function(name) {
      if (undefined_str === undefined) {
        throw {
          name: 'UndefinedVariable', message: name + ' is not defined'
        };
      } else {
        return undefined_str;
      }
    },

    _LookUpStack: function(name) {
      var i = stack.length - 1;
      while (true) {
        var frame = stack[i];
        if (name == '$index') {
          if (frame.index == -1) {  // undefined value
            i--;
          } else {
            return frame.index - 1;
          }
        } else {
          var context = frame.context;
          if (typeof context !== 'object') {
            i--;
          } else {
            var value = context[name];
            if (value === undefined) {
              i--;
            } else {
              return value;
            }
          }
        }

        if (i <= -1) {
          return this._Undefined(name);
        }
      }
    },

    Lookup: function(name) {
      if (name == '@') {
        return stack[stack.length-1].context;
      }
      var parts = name.split('.');
      var value = this._LookUpStack(parts[0]);
      if (parts.length > 1) {
        for (var i=1; i<parts.length; i++) {
          value = value[parts[i]];
          if (value === undefined) {
            return this._Undefined(parts[i]);
          }
        }
      }
      return value;
    }

  };
}


function _Section(section_name) {
  var current_clause = [];
  var statements = {'default': current_clause};

  return {
    section_name: section_name, // public attribute

    Statements: function(clause) {
      clause = clause || 'default';
      return statements[clause] || [];
    },

    NewClause: function(clause_name) {
      var new_clause = [];
      statements[clause_name] = new_clause;
      current_clause = new_clause;
    },

    Append: function(statement) {
      current_clause.push(statement);
    }
  };
}


function _Execute(statements, context, callback) {
  for (var i=0; i<statements.length; i++) {
    var statement = statements[i];

    if (typeof(statement) == 'string') {
      callback(statement);
    } else {
      var func = statement[0];
      var args = statement[1];
      func(args, context, callback);
    }
  }
}


function _DoSubstitute(statement, context, callback) {
  var value;
  value = context.Lookup(statement.name);

  // Format values
  for (var i=0; i<statement.formatters.length; i++) {
    value = statement.formatters[i](value);
  }

  callback(value);
}


// for [section foo]
function _DoSection(args, context, callback) {

  var block = args;
  var value = context.PushSection(block.section_name);
  var do_section = false;

  // "truthy" values should have their sections executed.
  if (value) {
    do_section = true;
  }
  // Except: if the value is a zero-length array (which is "truthy")
  if (value && value.length === 0) {
    do_section = false;
  }

  if (do_section) {
    _Execute(block.Statements(), context, callback);
    context.Pop();
  } else {  // Empty list, None, False, etc.
    context.Pop();
    _Execute(block.Statements('or'), context, callback);
  }
}


function _DoRepeatedSection(args, context, callback) {
  var block = args;
  var pushed;

  if (block.section_name == '@') {
    // If the name is @, we stay in the enclosing context, but assume it's a
    // list, and repeat this block many times.
    items = context.Lookup('@');
    // TODO: check that items is an array; apparently this is hard in JavaScript
    //if type(items) is not list:
    //  raise EvaluationError('Expected a list; got %s' % type(items))
    pushed = false;
  } else {
    items = context.PushSection(block.section_name);
    pushed = true;
  }

  if (items && items.length > 0) {
    // Execute the statements in the block for every item in the list.
    // Execute the alternate block on every iteration except the last.  Each
    // item could be an atom (string, integer, etc.) or a dictionary.
    
    var last_index = items.length - 1;
    var statements = block.Statements();
    var alt_statements = block.Statements('alternate');

    for (var i=0; context.next() !== undefined; i++) {
      _Execute(statements, context, callback);
      if (i != last_index) {
        _Execute(alt_statements, context, callback);
      }
    }
  } else {
    _Execute(block.Statements('or'), context, callback);
  }

  if (pushed) {
    context.Pop();
  }
}


var _SECTION_RE = /(repeated)?\s*(section)\s+(\S+)?/;


// TODO: The compile function could be in a different module, in case we want to
// compile on the server side.
function _Compile(template_str, options) {
  var more_formatters = options.more_formatters ||
                        function (x) { return null; };

  // We want to allow an explicit null value for default_formatter, which means
  // that an error is raised if no formatter is specified.
  var default_formatter;
  if (options.default_formatter === undefined) {
    default_formatter = 'str';
  } else {
    default_formatter = options.default_formatter;
  }

  function GetFormatter(format_str) {
    var formatter = more_formatters(format_str) ||
                    DEFAULT_FORMATTERS[format_str];
    if (formatter === undefined) {
      throw {
        name: 'BadFormatter',
        message: format_str + ' is not a valid formatter'
      };
    }
    return formatter;
  }

  var format_char = options.format_char || '|';
  if (format_char != ':' && format_char != '|') {
    throw {
      name: 'ConfigurationError',
      message: 'Only format characters : and | are accepted'
    };
  }

  var meta = options.meta || '{}';
  var n = meta.length;
  if (n % 2 == 1) {
    throw {
      name: 'ConfigurationError',
      message: meta + ' has an odd number of metacharacters'
    };
  }
  var meta_left = meta.substring(0, n/2);
  var meta_right = meta.substring(n/2, n);

  var token_re = _MakeTokenRegex(meta_left, meta_right);
  var current_block = _Section();
  var stack = [current_block];

  var strip_num = meta_left.length;  // assume they're the same length

  var token_match;
  var last_index = 0;

  while (true) {
    token_match = token_re.exec(template_str);
    if (token_match === null) {
      break;
    } else {
      var token = token_match[0];
    }

    // Add the previous literal to the program
    if (token_match.index > last_index) {
      var tok = template_str.slice(last_index, token_match.index);
      current_block.Append(tok);
    }
    last_index = token_re.lastIndex;

    var had_newline = false;
    if (token.slice(-1) == '\n') {
      token = token.slice(null, -1);
      had_newline = true;
    }

    token = token.slice(strip_num, -strip_num);

    if (token.charAt(0) == '#') {
      continue;  // comment
    }

    if (token.charAt(0) == '.') {  // Keyword
      token = token.substring(1, token.length);

      var literal = {
          'meta-left': meta_left,
          'meta-right': meta_right,
          'space': ' ',
          'tab': '\t',
          'newline': '\n'
          }[token];

      if (literal !== undefined) {
        current_block.Append(literal);
        continue;
      }

      var section_match = token.match(_SECTION_RE);

      if (section_match) {
        var repeated = section_match[1];
        var section_name = section_match[3];
        var func = repeated ? _DoRepeatedSection : _DoSection;

        var new_block = _Section(section_name);
        current_block.Append([func, new_block]);
        stack.push(new_block);
        current_block = new_block;
        continue;
      }

      if (token == 'alternates with') {
        current_block.NewClause('alternate');
        continue;
      }

      if (token == 'or') {
        current_block.NewClause('or');
        continue;
      }

      if (token == 'end') {
        // End the block
        stack.pop();
        if (stack.length > 0) {
          current_block = stack[stack.length-1];
        } else {
          throw {
            name: 'TemplateSyntaxError',
            message: 'Got too many {end} statements'
          };
        }
        continue;
      }
    }

    // A variable substitution
    var parts = token.split(format_char);
    var formatters;
    var name;
    if (parts.length == 1) {
      if (default_formatter === null) {
          throw {
            name: 'MissingFormatter',
            message: 'This template requires explicit formatters.'
          };
      }
      // If no formatter is specified, the default is the 'str' formatter,
      // which the user can define however they desire.
      formatters = [GetFormatter(default_formatter)];
      name = token;
    } else {
      formatters = [];
      for (var j=1; j<parts.length; j++) {
        formatters.push(GetFormatter(parts[j]));
      }
      name = parts[0];
    }
    current_block.Append(
        [_DoSubstitute, { name: name, formatters: formatters}]);
    if (had_newline) {
      current_block.Append('\n');
    }
  }

  // Add the trailing literal
  current_block.Append(template_str.slice(last_index));

  if (stack.length !== 1) {
    throw {
      name: 'TemplateSyntaxError',
      message: 'Got too few {end} statements'
    };
  }
  return current_block;
}

// The Template class is defined in the traditional style so that users can add
// methods by mutating the prototype attribute.  TODO: Need a good idiom for
// inheritance without mutating globals.

function Template(template_str, options) {

  // Add 'new' if we were not called with 'new', so prototyping works.
  if(!(this instanceof Template)) {
    return new Template(template_str, options);
  }

  this._options = options || {};
  this._program = _Compile(template_str, this._options);
}

Template.prototype.render = function(data_dict, callback) {
  // options.undefined_str can either be a string or undefined
  var context = _ScopedContext(data_dict, this._options.undefined_str);
  _Execute(this._program.Statements(), context, callback);
};

Template.prototype.expand = function(data_dict) {
  var tokens = [];
  this.render(data_dict, function(x) { tokens.push(x); });
  return tokens.join('');
};


// We just export one name for now, the Template "class".
// We need HtmlEscape in the browser tests, so might as well export it.

return {Template: Template, HtmlEscape: HtmlEscape};

}();

// commonjs
for (var key in jsontemplate) exports[key] = jsontemplate[key];