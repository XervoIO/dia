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
  info: 'cyan'
, error: 'red'
, fail: 'red'
, pass: 'green'
});

var dash = exports;

//
// Helper functions for validating manifest properties.
// ===
//

//
// Validate a string value - check that the value exists, is a string,
// and is not empty.
//
var _validateString = function(value, name) {
  if (typeof value === 'undefined') {
    console.log('  check if exists', '[FAIL]'.fail);
    return console.log(util.format('    %s is required', name).fail);
  } else {
    console.log('  check if exists', '[PASS]'.pass);
    if (typeof value === 'string' && value.length > 0) {
      console.log(util.format('  check %s value', name), '[PASS]'.pass);
    } else {
      console.log(util.format('  check %s value', name), '[FAIL]'.fail);
      console.log(util.format('    %s must be a string and not empty', name).fail);
    }
  }
};

//
// Validate each property of a manifest.
//
var _validateManifest = function(manifest, fn) {
  console.log('\ntesting manifest id'.info);
  _validateString(manifest.id, 'id');

  console.log();
  console.log('testing manifest api'.info);
  if (typeof manifest.api === 'undefined') {
    console.log('  check if exists', '[FAIL]'.fail);
    return console.log('    api object is required'.fail);
  } else {
    console.log('  check if exists', '[PASS]'.pass);
  }

  console.log();
  console.log('testing config_vars'.info);
  if (typeof manifest.api.config_vars === 'undefined') {
    console.log('  check that config_vars exists', '[FAIL]'.fail);
  } else {
    console.log('  check that config_vars exists', '[PASS]'.pass);
  }

  if (!(manifest.api.config_vars instanceof Array)) {
    console.log('  check that config_vars is an array', '[FAIL]'.fail);
  } else {
    console.log('  check that config_vars is an array', '[PASS]'.pass);
    for (var i = 0; i < manifest.api.config_vars.length; i++) {
      if (!manifest.id || manifest.api.config_vars[i].indexOf(manifest.id.toUpperCase()) === -1) {
        console.log('  check that config_vars match manifest id', '[FAIL]'.fail);
        if (manifest.id) {
          // Only show error if the ID exists.
          console.log(util.format('    config variables must be prefixed with %s_', manifest.id.toUpperCase()).fail);
        }
      } else {
        console.log('  check that config_vars match manifest id', '[PASS]'.pass);
      }
    }
  }

  console.log();
  console.log('testing api authentication properties'.info);
  _validateString(manifest.api.password, 'api password');
  _validateString(manifest.api.sso_salt, 'api sso salt');

  console.log();
  console.log('testing production api properties'.info);
  if (typeof manifest.api.production === 'undefined') {
    return console.log('  check that production api exists\n', '[FAIL]'.fail);
  } else {
    console.log('  check that production api exists', '[PASS]'.pass);
  }

  _validateString(manifest.api.production.base_url, 'production base_url');
  _validateString(manifest.api.production.sso_url, 'production sso_url');

  console.log();
};

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

  dash.validateManifest(filename, function() {
    if (type === 'manifest') return;

    // TODO: Run other tests..
  });
};

//
// Validates the manifest for this add-on.
//
dash.validateManifest = function(filename, fn) {
  var manifest = filename || '';

  if (manifest.length > 0) {
    if (!fs.existsSync(manifest)) {
      console.log('  specified manifest does not exist\n'.fail);
    }
  } else {
    manifest = path.resolve('./', 'addon-manifest.json');
  }

  fs.readFile(manifest, { encoding: 'utf8' }, function(err, data) {
    if (err || !data) return console.log('  failed to open the specified manifest\n'.fail);

    _validateManifest(JSON.parse(data), fn);
  });
};

//
// Initialize a skeleton manifest.
//
dash.init = function(filename) {
  var reader = fs.createReadStream('./lib/addon-manifest.json');
  reader.on('error', function(err) {
    if (err) return console.log(err.message.fail);
  });
  
  var writer = fs.createWriteStream(filename);
  writer.on('error', function(err) {
    if (err) return console.log(err.message.fail);
  });
  
  writer.on('close', function() {
    console.log(util.format('Initialized new addon manifest in %s', filename).info);
  });
  
  reader.pipe(writer);
};
