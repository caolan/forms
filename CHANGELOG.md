1.1.4 / 2015-09-22
===================
  * [Deps] update `async`, `object.assign`, `string.prototype.trim`, `qs`, `is`
  * [Dev Deps] update `tape`, `jscs`, `evalmd`, `eslint`, `@ljharb/eslint-config`, `nsp`
  * [Docs] Switch from vb.teelaun.ch to versionbadg.es for the npm version badge SVG.
  * [Tests] Add `evalmd` to verify that code example blocks in the README are correct.
  * [Tests] up to `io.js` `v3.3`, `node` `v4.1`

1.1.3 / 2015-08-08
===================
  * [Fix] Ensure that nested required fields, even when the nesting namespace is omitted, are still validated (#165)
  * [Fix] Ensure `validatePastFirstError` setting propagates through to object fields
  * [Fix] Disable `parseArrays` in `qs.parse`
  * [Refactor] Use `string.prototype.trim` package instead of my copy-pasted code.
  * [Deps] Update `async`, `qs`, `object.assign`
  * [Dev Deps] Update `eslint`, `tape`; add my shared `eslint` config
  * [Tests] Test up to `io.js` `v3.0`
  * [Tests] Add `npm run security`
  * [Docs] Update bootstrap example to avoid duplicate form-control classes (#163)

1.1.2 / 2015-05-30
===================
  * Code cleanup: Avoid ES3 syntax errors, just in case.
  * Code cleanup: Avoid reusing variables.
  * Code cleanup: Remove or use unused variables.
  * Code cleanup: Avoid reassigning function params, for performance
  * Test up to `io.js` `v2.1`, and latest `node`
  * Add `npm run eslint`
  * Update `tape`, `jscs`, `is`, `formidable`, `qs`, `object.assign`, `covert`, `async`

1.1.1 / 2015-01-06
===================
  * Fix validation error bug with nested fields. (#153)
  * Update `formidable`, `jscs`

1.1.0 / 2014-12-16
===================
  * Use label text instead of field name consistently in error messages
  * Fix support of zero values in inputs (#147)
  * Update `qs`, `is`, `object.assign`, `tape`, `covert`, `jscs`

1.0.0 / 2014-09-29
===================
  * v1.0.0 - it’s time.
  * Update CHANGELOG

0.10.0 / 2014-09-24
===================
  * Updating `testling`, `qs`, `jscs`, `tape`
  * Cleaning up URLs in README
  * Adding license and downloads badges.
  * Adding a single "license" field to package.json

0.9.6 / 2014-09-03
==================
  * Updating `is`, `jscs`, `qs`, `jscs`

0.9.5 / 2014-08-29
==================
  * Updating `formidable`, `qs`, `jscs`

0.9.4 / 2014-08-28
==================
  * Updating `qs`

0.9.2 / 2014-08-25
==================
  * Updating `is`, `covert`, `tape`
  * Clean up README (#139); use SVG badges instead of PNG

0.9.1 / 2014-08-07
==================
  * Updating `qs` and `tape`

0.9.0 / 2014-07-30
==================
  * Add option to disable automatic error rendering (#138)

0.8.2 / 2014-07-30
==================
  * Add `hideError` option to disable automatic error rendering (#138)

0.8.1 / 2014-07-24
==================
  * Fix/add support for empty <option> value attributes (#137)

0.8.0 / 2014-07-23 (mispublished and unpublished)
==================
  * Fix inability to disable ID attribute (#128)
  * Add support for callback chaining (#129)

0.7.0 / 2014-05-20
==================
 * Properly compare using string values in select, multipleSelect, multipleCheckbox, and multipleRadio
 * Add "placeholder" to textarea elements

0.6.0 / 2014-05-03
==================
 * Add fieldsetClasses, legendClasses, and labelClasses

0.5.0 / 2014-05-01
==================
  * Added new form-level validatePastFirstErrorOption. When true, all fields will validate, instead of stopping at the first error.
  * Internal refactoring for improved HTML tag generation

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
  * Removing the express example, primarily because it doesn’t work with express 3. Also, the dependency stuff is weird.
    This should go in a separate repo rather than living inside `forms`.
    Closes [#93](https://github.com/caolan/forms/issues/93). Relates to [#105](https://github.com/caolan/forms/issues/105).
  * Merge pull request [#99](https://github.com/caolan/forms/issues/99) from Flaise/master
    Made `%s` string formatting tokens optional in field validator error messages.
  * Oops! Make sure we’re running all tests
  * Made `%s` string formatting tokens optional in field validator error messages.
  * Add number widget.
    From [#83](https://github.com/caolan/forms/issues/83).
  * Pass an enctype in the simple example
  * Updating json-template.
    Note: it can’t be installed from npm because the package.json is invalid.
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
  * Merge branch "required_validator". Closes [#81](https://github.com/caolan/forms/issues/81).
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
  * Merge branch "nested_fields_merge" - merges [#77](https://github.com/caolan/forms/issues/77), fixes [#11](https://github.com/caolan/forms/issues/11)
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
  * Adding ES5’s String#trim
  * Removing an extra space
  * compatibility
