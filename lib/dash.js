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
dash.manifest = {};
dash.plan = 'test';

//
// Helper functions for validating manifest properties.
// ===
//

//
// Validate a string value - check that the value exists, is a string,
// and is not empty.
//
var _validateString = function(value, name, pass) {
  if (typeof value === 'undefined') {
    pass = false;
    console.log('  check if exists', '[FAIL]'.fail);
    return console.log(util.format('    %s is required', name).fail);
  } else {
    console.log('  check if exists', '[PASS]'.pass);
    if (typeof value === 'string' && value.length > 0) {
      console.log(util.format('  check %s value', name), '[PASS]'.pass);
    } else {
      hasError = false;
      console.log(util.format('  check %s value', name), '[FAIL]'.fail);
      console.log(util.format('    %s must be a string and not empty', name).fail);
    }
  }
};

//
// Validate each property of a manifest.
//
var _validateManifest = function(manifest, fn) {
  var pass = true;

  console.log('\ntesting manifest id'.info);
  _validateString(manifest.id, 'id');

  console.log();
  console.log('testing manifest api'.info);
  if (typeof manifest.api === 'undefined') {
    console.log('  check if exists', '[FAIL]'.fail);
    console.log('    api object is required'.fail);
    return fn(false);
  } else {
    console.log('  check if exists', '[PASS]'.pass);
  }

  console.log();
  console.log('testing config_vars'.info);
  if (typeof manifest.api.config_vars === 'undefined') {
    pass = false;
    console.log('  check that config_vars exists', '[FAIL]'.fail);
  } else {
    console.log('  check that config_vars exists', '[PASS]'.pass);
  }

  if (!(manifest.api.config_vars instanceof Array)) {
    pass = false;
    console.log('  check that config_vars is an array', '[FAIL]'.fail);
  } else {
    console.log('  check that config_vars is an array', '[PASS]'.pass);
    for (var i = 0; i < manifest.api.config_vars.length; i++) {
      if (!manifest.id || manifest.api.config_vars[i].indexOf(manifest.id.toUpperCase()) === -1) {
        pass = false;
        console.log('  check that config_vars match manifest id', '[FAIL]'.fail);
        if (manifest.id) {
          // Only show error if the ID exists.
          pass = false;
          console.log(util.format('    config variables must be prefixed with %s_', manifest.id.toUpperCase()).fail);
        }
      } else {
        console.log('  check that config_vars match manifest id', '[PASS]'.pass);
      }
    }
  }

  console.log();
  console.log('testing api authentication properties'.info);
  _validateString(manifest.api.password, 'api password', pass);
  _validateString(manifest.api.sso_salt, 'api sso salt', pass);

  console.log();
  console.log('testing production api properties'.info);
  if (typeof manifest.api.production === 'undefined') {
    console.log('  check that production api exists\n', '[FAIL]'.fail);
    return fn(false);
  } else {
    console.log('  check that production api exists', '[PASS]'.pass);
  }

  _validateString(manifest.api.production.base_url, 'production base_url', pass);
  _validateString(manifest.api.production.sso_url, 'production sso_url', pass);

  console.log();
  console.log('testing test api properties'.info);
  if (typeof manifest.api.test === 'undefined') {
    console.log('  check that test api exists\n', '[FAIL]'.fail);
    return fn(false);
  } else {
    console.log('  check that test api exists', '[PASS]'.pass);
  }

  _validateString(manifest.api.test.base_url, 'test base_url', pass);
  _validateString(manifest.api.test.sso_url, 'test sso_url', pass);

  console.log();
  fn(pass);
};

//
// Begin an add-on test routine.
//
dash.test = function() {
  var type, filename, options
    , args = Array.prototype.slice.call(arguments);

  type = args.shift();
  filename = args.shift();

  // Parse remaining arguments if present.
  if (args.length > 0) options = args.shift();
  if (args.length > 0) dash.plan = args.shift();

  dash.validateManifest(filename, function(result) {
    if (type === 'manifest' || !result) {
      return;
    }

    if (type === 'provision' || type === 'all') {
      dash.validatePost();
    }
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
    if (err || !data) {
      console.log(util.format('\n  failed to open the manifest at %s\n', manifest).fail);
      return fn(false);
    }

    dash.manifest = JSON.parse(data);
    _validateManifest(dash.manifest, fn);
  });
};

dash.validatePost = function() {
  var opts, i;
  console.log(util.format('testing POST to %s', dash.manifest.api.test.base_url).info);

  opts = {
    uri: dash.manifest.api.test.base_url
  , method: 'POST'
  , auth: {
      user: dash.manifest.id
    , pass: dash.manifest.api.password
    }
  , body: {
      options: {}
    , callback_url: 'http://localhost:8000/callback/999'
    , modulus_id: dash.manifest.id + '999'
    , plan: dash.plan
    }
  , json: true
  };

  request(opts, function(err, response) {
    if (err) {
      console.log('  check response code', '[FAIL]'.fail);
      console.log(util.format('    error posting to url: %s', err.message).fail);
      return console.log();
    }

    if (response.statusCode === 200) {
      console.log('  check authentication', '[PASS]'.pass);
    } else if (response.statusCode ) {
      console.log('  check authentication', '[FAIL]'.fail);
      console.log(util.format('    expected status code 200 but got %s', response.statusCode).fail);
      return console.log();
    }

    if (response.body) {
      if (!response.body.id) {
        console.log('  check response', '[FAIL]'.fail);
        console.log('    id not found in response'.fail);
        return console.log();
      }

      if (!response.body.config) {
        console.log('  check response', '[FAIL]'.fail);
        console.log('    config vars not found in response'.fail);
        return console.log();
      }

      for (i = 0; i < dash.manifest.api.config_vars.length; i++) {
        if (!response.body.config[dash.manifest.api.config_vars[i]]) {
          console.log('  check response', '[FAIL]'.fail);
          console.log(util.format('    config var %s not found in response', dash.manifest.api.config_vars[i]).fail);
          return console.log();
        }
      }

      console.log('  check response', '[PASS]'.pass);
    } else {
      console.log('  check response', '[FAIL]'.fail);
      console.log('    response body is empty'. fail);
    }

    console.log();
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
