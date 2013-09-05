//     Dash version 0.0.0

//     (c) 2013 Modulus <support@modulus.io>
//     MIT Licensed

var request = require('request')
  , colors  = require('colors')
  , path    = require('path')
  , util    = require('util')
  , crypto  = require('crypto')
  , fs      = require('fs');

colors.setTheme({
  info: 'cyan'
, fail: 'red'
, pass: 'green'
});

var dash = exports;
dash.manifest = {};
dash.plan = 'test';
dash.id = 0;

//
// Helper functions for validating manifest properties.
// ===
//

//
// Validate a string value - check that the value exists, is a string,
//    and is not empty.
//
var validateString = function(value, name, pass) {
  if (typeof value === 'undefined') {
    pass = false;
    console.log('  check if exists', '[FAIL]'.fail);
    return console.log(util.format('    %s is required', name).fail);
  } else {
    console.log('  check if exists', '[PASS]'.pass);
    if (typeof value === 'string' && value.length > 0) {
      console.log(util.format('  check %s value', name), '[PASS]'.pass);
    } else {
      pass = false;
      console.log(util.format('  check %s value', name), '[FAIL]'.fail);
      console.log(util.format('    %s must be a string and not empty', name).fail);
    }
  }
};

//
// Validate each property of a manifest.
//
var validateManifestInternal = function(manifest, fn) {
  var pass = true;

  console.log('\ntesting manifest id'.info);
  validateString(manifest.id, 'id');

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
    if (manifest.api.config_vars.length === 0) {
      console.log('  check that config_vars contains at lease one config var', '[FAIL]'.fail);
    } else {
      console.log('  check that config_vars contains at lease one config var', '[PASS]'.pass);
    }

    console.log('  check that config_vars is an array', '[PASS]'.pass);
    for (var i = 0; i < manifest.api.config_vars.length; i++) {
      if (!manifest.id || manifest.api.config_vars[i].indexOf(manifest.id.toUpperCase()) !== 0) {
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
  validateString(manifest.api.password, 'api password', pass);
  validateString(manifest.api.sso_salt, 'api sso salt', pass);

  console.log();
  console.log('testing production api properties'.info);
  if (typeof manifest.api.production === 'undefined') {
    console.log('  check for production api', '[FAIL]'.fail);
    console.log();
    return fn(false);
  } else {
    console.log('  check for production api', '[PASS]'.pass);
  }

  validateString(manifest.api.production.base_url, 'production base_url', pass);
  validateString(manifest.api.production.sso_url, 'production sso_url', pass);

  console.log();
  console.log('testing test api properties'.info);
  if (typeof manifest.api.test === 'undefined') {
    console.log('  check for test api', '[FAIL]'.fail);
    console.log();
    return fn(false);
  } else {
    console.log('  check for test api', '[PASS]'.pass);
  }

  validateString(manifest.api.test.base_url, 'test base_url', pass);
  validateString(manifest.api.test.sso_url, 'test sso_url', pass);

  console.log();
  fn(pass);
};

//
// POST invalid single sign on authentication data and check
//    the result.
//
var sendInvalidSso = function(id, fn) {
  var opts = {
    uri: dash.manifest.api.test.sso_url
  , method: 'POST'
  , body: {
      id: id
    , timestamp: parseInt(Date.now() / 1000, 10)
    , email: 'user@example.com'
    , token: 'invalid'
    , 'nav-data': ''
    }
  , json: true
  };

  console.log('testing invalid single sign on authentication'.info);

  request(opts, function(err, response) {
    if (err) {
      console.log('  check response code', '[FAIL]'.fail);
      console.log(util.format('    error attempting to authenticate single sign on user: %s', err.message).fail);
      console.log();
      return fn ? fn() : void 0;
    }

    if (response.statusCode === 403) {
      console.log('  check successful single sign on response', '[PASS]'.pass);
    } else if (response.statusCode ) {
      console.log('  check successful single sign on response', '[FAIL]'.fail);
      console.log(util.format('    expected status code 403 but got %s', response.statusCode).fail);
      console.log();
      return fn ? fn() : void 0;
    }

    console.log();
    fn();
  });
};

//
// POST valid single sign on authentication data and check
//    the result.
//
var sendValidSso = function(id) {
  var timestamp = parseInt(Date.now() / 1000, 10)
    , preToken = id + ':' + dash.manifest.api.sso_salt + ':' + timestamp
    , token = crypto.createHash('sha1').update(preToken).digest('hex');

  var opts = {
    uri: dash.manifest.api.test.sso_url
  , method: 'POST'
  , body: {
      id: id
    , timestamp: timestamp
    , email: 'user@example.com'
    , token: token
    , 'nav-data': ''
    }
  , json: true
  };

  console.log('testing valid single sign on authentication'.info);

  request(opts, function(err, response) {
    if (err) {
      console.log('  check response code', '[FAIL]'.fail);
      console.log(util.format('    error attempting to authenticate single sign on user: %s', err.message).fail);
      return console.log();
    }

    if (response.statusCode === 200) {
      console.log('  check successful single sign on response', '[PASS]'.pass);
    } else {
      console.log('  check successful single sign on response', '[FAIL]'.fail);
      console.log(util.format('    expected status code 200 but got %s', response.statusCode).fail);
      return console.log();
    }

    console.log();
  });
};

//
// Add-On test functions.
// ===
//

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
    if (type === 'manifest' || !result || typeof dash.manifest.api.test === 'undefined') return;
    if (type === 'all') {
      dash.validatePost(function() {
        dash.validateDelete(function() {
          dash.validatePut(function() {
            dash.validateSso(options || dash.manifest.id);
          });
        });
      });
    } else {
      if (type === 'provision') dash.validatePost();
      if (type === 'sso') dash.validateSso(options);
      if (type === 'planchange') dash.validatePut();
      if (type === 'deprovision') {
        dash.id = options;
        dash.validateDelete();
      }
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
    validateManifestInternal(dash.manifest, fn);
  });
};

//
// POST to the API endpoint specified in the manifest to simulate
//    a provision call and validate the response.
//
dash.validatePost = function(fn) {
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
    , region: 'us-east-1'
    }
  , json: true
  };

  request(opts, function(err, response) {
    if (err) {
      console.log('  check response code', '[FAIL]'.fail);
      console.log(util.format('    error attempting to provision: %s', err.message).fail);
      console.log();
      return fn ? fn() : void 0;
    }
    if (response.statusCode === 200) {
      console.log('  check authentication', '[PASS]'.pass);
    } else {
      console.log('  check authentication', '[FAIL]'.fail);
      console.log(util.format('    expected status code 200 but got %s', response.statusCode).fail);
      console.log();
      return fn ? fn() : void 0;
    }

    if (response.body) {
      if (typeof response.body.id === 'undefined') {
        console.log('  check response', '[FAIL]'.fail);
        console.log('    id not found in response'.fail);
        console.log();
        return fn ? fn() : void 0;
      }

      dash.id = response.body.id;

      if (!response.body.config) {
        console.log('  check response', '[FAIL]'.fail);
        console.log('    config vars not found in response'.fail);
        console.log();
        return fn ? fn() : void 0;
      } else {
        for (i = 0; i < dash.manifest.api.config_vars.length; i++) {
          if (!response.body.config[dash.manifest.api.config_vars[i]]) {
            console.log('  check response', '[FAIL]'.fail);
            console.log(util.format('    config var %s not found in response', dash.manifest.api.config_vars[i]).fail);
            console.log();
            return fn ? fn() : void 0;
          }
        }
      }

      console.log('  check response', '[PASS]'.pass);
    } else {
      console.log('  check response', '[FAIL]'.fail);
      console.log('    response body is empty'. fail);
    }

    console.log();
    fn && fn();
  });
};

//
// DELETE to the API endpoint to simulate a deprovision call
//    and validate the response.
//
dash.validateDelete = function(fn) {
  var opts = {
    uri: dash.manifest.api.test.base_url + '/' + dash.id || 0
  , method: 'DELETE'
  , auth: {
      user: dash.manifest.id
    , pass: dash.manifest.api.password
    }
  };

  console.log(util.format('testing DELETE to %s/%d', dash.manifest.api.test.base_url, dash.id).info);

  request(opts, function(err, response) {
    if (err) {
      console.log('  check response code', '[FAIL]'.fail);
      console.log(util.format('    error attempting to deprovision: %s', err.message).fail);
      console.log();
      return fn ? fn() : void 0;
    }

    if (response.statusCode === 200) {
      console.log('  check authentication', '[PASS]'.pass);
    } else if (response.statusCode ) {
      console.log('  check authentication', '[FAIL]'.fail);
      console.log(util.format('    expected status code 200 but got %s', response.statusCode).fail);
      console.log();
      return fn ? fn() : void 0;
    }

    console.log('  check response', '[PASS]'.pass);
    console.log();
    fn && fn();
  });
};

//
// PUT to the API endpoint to simulate a planchange call
//    and validate the response.
//
dash.validatePut = function(fn) {
  var opts = {
    uri: dash.manifest.api.test.base_url + '/' + dash.id
  , method: 'PUT'
  , auth: {
      user: dash.manifest.id
    , pass: dash.manifest.api.password
    }
  , body: {
      plan: dash.plan || 'foo'
    , modulus_id: dash.manifest.id + '999'
    }
  , json: true
  };

  console.log(util.format('testing PUT to %s/%d', dash.manifest.api.test.base_url, dash.id).info);

  request(opts, function(err, response) {
    if (err) {
      console.log('  check response code', '[FAIL]'.fail);
      console.log(util.format('    error attempting to planchange: %s', err.message).fail);
      console.log();
      return fn ? fn() : void 0;
    }

    if (response.statusCode === 200) {
      console.log('  check authentication', '[PASS]'.pass);
    } else if (response.statusCode ) {
      console.log('  check authentication', '[FAIL]'.fail);
      console.log(util.format('    expected status code 200 but got %s', response.statusCode).fail);
      console.log();
      return fn ? fn() : void 0;
    }

    if (typeof response.body === 'undefined' || !response.body.config) {
      console.log('  check response', '[FAIL]'.fail);
      console.log('    config vars not found in response'.fail);
      console.log();
      return fn ? fn() : void 0;
    } else {
      for (var i = 0; i < dash.manifest.api.config_vars.length; i++) {
        if (!response.body.config[dash.manifest.api.config_vars[i]]) {
          console.log('  check response', '[FAIL]'.fail);
          console.log(util.format('    config var %s not found in response', dash.manifest.api.config_vars[i]).fail);
          console.log();
          return fn ? fn() : void 0;
        }
      }
    }

    console.log('  check response', '[PASS]'.pass);
    console.log();
    fn && fn();
  });
};

//
// Simulate single sign on authentication and check the response.
//
dash.validateSso = function(id) {
  sendInvalidSso(id, function() {
    sendValidSso(id);
  });
};

//
// Initialize a skeleton manifest to the specified filename.
//
dash.init = function(filename) {
  var reader = fs.createReadStream(path.join(__dirname, 'addon-manifest.json'));

  reader.on('error', function(err) {
    if (err) return console.log(err.message.fail);
  });

  var writer = fs.createWriteStream(filename);
  writer.on('error', console.error);

  writer.on('close', function() {
    console.log(util.format('Initialized new addon manifest in %s', filename).info);
  });

  reader.pipe(writer);
};
