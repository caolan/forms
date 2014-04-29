0.4.1 / 2014-04-24
==================
  * Updating dependencies
  * Adding digits and integer validators

0.4.0 / 2014-04-07
==================
  * Using https URLs in package.json
  * Updating async and tape.
  * Using `is` to check for things
  * Using better tape matchers, and `is` functions
  * Merge pull request [#107](https://github.com/caolan/forms/issues/107) from timjrobinson/nested_fields_fix_fix
    Fixed bug where .bind with incomplete data was removing fields from form.
  * Fixed bug where if you bind data to a form fields that were missing from the data were being removed from the form.
  * Adding `npm run coverage`
  * Merge pull request [#106](https://github.com/caolan/forms/issues/106) from timjrobinson/nested_fields_fix
    Fixed null object error when a nested form is submitted but one of the subsections is missing.
  * Fixed null pointer error when a nested form is submitted but one of the subsections is missing.
  * Adding another matchValue test.
  * Fixing whitespace; a bit of cleanup.
  * Add plan statements, and using the "t" convention inside tests.
  * Adding a matchValue validator.
    Relates to [#82](https://github.com/caolan/forms/issues/82).
  * Removing the express example, primarily because it doesn't work with express 3. Also, the dependency stuff is weird.
    This should go in a separate repo rather than living inside `forms`.
    Closes [#93](https://github.com/caolan/forms/issues/93). Relates to [#105](https://github.com/caolan/forms/issues/105).
  * Merge pull request [#99](https://github.com/caolan/forms/issues/99) from Flaise/master
    Made `%s` string formatting tokens optional in field validator error messages.
  * Oops! Make sure we're running all tests
  * Made `%s` string formatting tokens optional in field validator error messages.
  * Add number widget.
    From [#83](https://github.com/caolan/forms/issues/83).
  * Pass an enctype in the simple example
  * Updating json-template.
    Note: it can't be installed from npm because the package.json is invalid.
  * Merge pull request [#101](https://github.com/caolan/forms/issues/101) from caolan/use_tape_for_tests
    Use tape for tests
  * Converting tests over to tape instead of nodeunit.
  * Using tape for tests instead.
  * Adding "alphanumeric" to README, per [#98](https://github.com/caolan/forms/issues/98)
  * Merge pull request [#98](https://github.com/caolan/forms/issues/98) from Flaise/master
    Added alphanumeric validator for convenience.
  * Added alphanumeric validator for convenience.
  * Updating deps
  * Updating dev deps
  * Merge pull request [#92](https://github.com/caolan/forms/issues/92) from shinnn/master
    Replace "!!!" with "doctype"
  * Replace "!!!" with "doctype"
  * Merge pull request [#91](https://github.com/caolan/forms/issues/91) from kukulili-labs/master
    Add optional "tabindex"attribute to widgets
  * Fix test
  * Add optional "tabindex"attribute to widgets
  * Updating browserify
  * Remove node 0.6 workaround; test down to node 0.4
  * Adding `is`
  * Merge pull request [#89](https://github.com/caolan/forms/issues/89) from timjrobinson/label-text
    Made label text for camel case or dash separated field names format nicely
  * Updating dependencies
  * Renaming variables.
  * Made label text for camel case or dash separated field names format nicely.
  * Make the complex example use POST and be multipart-encoded.
  * Use formidable to handle multipart-encoded form data.
  * HTML attributes should be double quoted.
  * Pass the method into the example template.
  * submit buttons are so much better than submit inputs.
  * Test in node 0.11 too
  * Unset strict SSL for node 0.6 in Travis-CI
  * Rearranging badges
  * Adding npm badge and version svg.
  * Updating browserify.
  * Merge branch 'required_validator'. Closes [#81](https://github.com/caolan/forms/issues/81).
  * Use String() instead of the toString prototype method.
  * When the "required" option is true, use the default "required" validator. Otherwise, use the passed-in validator.
  * Adding a "required" validator.
  * Upgrading browserify.

0.3.0 / 2013-09-16
==================

  * v0.3.0
  * Merge pull request [#80](https://github.com/caolan/forms/issues/80) from path/dynamic-widget-attributes
    Add support for dynamic widget attributes
  * Add support for dynamic widget attributes
    Sometimes it is desirable to set widget attributes after the form is
    created. This makes it possible and should be fully backwards
    compatible.
  * Adding dev dependency badge.
  * Rearranging dependencies.
  * s/\t/    /g
  * Merge branch 'nested_fields_merge' - merges [#77](https://github.com/caolan/forms/issues/77), fixes [#11](https://github.com/caolan/forms/issues/11)
  * Using arguments.length to shift arguments.
  * Adding spacing.
  * Reverting this line.
  * Bumping dev deps.
  * Adding a trailing newline.
  * Adding a nested example.
  * Merge pull request [#77](https://github.com/caolan/forms/issues/77)

0.2.3 / 2013-08-25
==================

  * v0.2.3
  * Adding testling browsers.
  * style corrections
  * Adding Travis CI info to the README. Closes [#42](https://github.com/caolan/forms/issues/42).
  * Fixing indentation.
  * Fixing a syntax error.
  * Reusing some common placeholder functions in these tests.
  * Fixing a bug in my port of the String#trim shim, and cleaning it up a bit.
  * Moving a misplaced semicolon.
  * Moving this logic up into the closure.
  * Combining var declarations.
  * Removing arbitrary line breaks.
  * Making sure "use strict" is always inside a function.
  * Merge pull request [#78](https://github.com/caolan/forms/issues/78) from caolan/either_or
    Adds "requiresFieldIfEmpty" validator
  * Adding requiresFieldIfEmpty validator.
  * If any field validator functions have a forceValidation property set, validate even when empty.
  * take object literals as nested fields
  * Adding ES5's String#trim
  * Removing an extra space
  * compatibility
