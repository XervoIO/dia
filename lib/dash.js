/*!
 * Dash
 * Copyright(c) 2013 Modulus <support@modulus.io>
 * MIT Licensed
 */

var request = require('request')
  , colors  = require('colors')
  , path    = require('path')
  , util    = require('util')
  , fs      = require('fs');

colors.setTheme({
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'cyan',
  data: 'grey',
  warn: 'yellow',
  debug: 'blue',
  error: 'red',
  fail: 'red',
  pass: 'green'
});

var dash = exports;

//
// Begin an add-on test routine.
//
dash.test = function() {
  var type, filename, options, plan
    , args = Array.prototype.slice.call(arguments);

  type = args.shift();
  filename = args.shift();

  // Parse remaining arguments if present.
  if (args.length > 0) options = args.shift();
  if (args.length > 0) plan = args.shift();

  dash.validateManifest(filename, function(err) {
    console.log('\n  [test :: manifest]'.info);
    if (err) return console.log(err.fail);
    console.log('  PASS\n'.pass);

    // Run the next test based on the specified type.
    console.log(util.format('\n  [test :: %s]', type).info);
  });
};

//
// Validates the manifest for this add-on.
//
dash.validateManifest = function(filename, fn) {
  var manifest = filename || '';

  if (manifest.length > 0) {
    if (!fs.existsSync(manifest)) {
      return fn('  specified file does not exist\n'.error);
    }
  } else {
    manifest = path.resolve('./', 'addon-manifest.json');
  }

  fn('  FAIL\n');
};

//
// Initialize a skeleton manifest.
//
dash.init = function() {
  
};
