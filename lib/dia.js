//
//     Dia
//     Copyright(c) 2013 Modulus <support@modulus.io>
//     MIT Licensed
//

var librarian  = require('./librarian')
  , UserConfig = require('./user-config')
  , randpass   = require('randpass')
  , request    = require('request')
  , path       = require('path')
  , util       = require('util')
  , url        = require('url')
  , crypto     = require('crypto')
  , fs         = require('fs');

var dia = exports;
dia.manifest = {};
dia.plan = 'test';
dia.id = 0;

var userConfig = dia.userConfig = new UserConfig();
userConfig.load();

if (userConfig.data && userConfig.data.api_uri) {
  var durl = url.parse(userConfig.data.api_uri);

  //
  // Initialize librarian if the user has configured the API endpoint.
  //
  if (durl.protocol === 'https:') {
    librarian.init(durl.hostname, durl.port || 443, true);
  } else {
    librarian.init(durl.hostname, durl.port || 80, false);
  }
}

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
    uri: dia.manifest.api.test.sso_url
  , method: 'POST'
  , body: {
      id: id
    , timestamp: parseInt(Date.now() / 1000, 10)
    , email: dia.manifest.id + '999' + '@example.com'
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
    , preToken = id + ':' + dia.manifest.api.sso_salt + ':' + timestamp
    , token = crypto.createHash('sha1').update(preToken).digest('hex');

  var opts = {
    uri: dia.manifest.api.test.sso_url
  , method: 'POST'
  , body: {
      id: id
    , timestamp: timestamp
    , email: dia.manifest.id + '999' + '@example.com'
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

    if (response.statusCode === 302) {

      // Follow the redirect URL and verify that a 200 is returned.
      var getUrl = response.headers.location;
      if (getUrl.indexOf('http') < 0) {
        getUrl = response.request.uri.protocol + '//' + response.request.uri.host + response.headers.location;
      }

      request.get(getUrl, function(err, response) {
        if (err) {
          console.log('  check successful single sign on response', '[FAIL]'.fail);
          console.log(util.format('    unable to GET %s: %s', getUrl, err).fail);
          return console.log();
        }

        if (response.statusCode !== 200) {
          console.log(response.body);
          console.log('  check successful single sign on response', '[FAIL]'.fail);
          console.log(util.format('    expected status code 200 but got %s', response.statusCode).fail);
          return console.log();
        }

        console.log('  check successful single sign on response', '[PASS]'.pass);
        return console.log();
      });
    } else {
      console.log('  check successful single sign on response', '[FAIL]'.fail);
      console.log(util.format('    expected status code 302 but got %s', response.statusCode).fail);
      return console.log();
    }
  });
};

//
// Configuration
// ===
//

//
// Set a configuration value
//
dia.setConfig = function(key, value) {
  var data = userConfig.data || {};

  //
  // Attempt to parse the value into a JavaScript object. This will ensure that
  //    booleans and numbers are stored correctly.
  //
  try {
    data[key] = JSON.parse(value);
  } catch (e) {
    data[key] = value;
  }
  userConfig.save(data);

  console.log('\n  configuration key saved\n'.info);
};

//
// Get configuration value for the specified key.
//
dia.getConfig = function(key) {
  if (userConfig.data && typeof userConfig.data[key] !== 'undefined') {
    console.log('\n ', userConfig.data[key].info, '\n');
  } else {
    console.log('\n  key not found\n'.fail);
  }
};

//
// Add-On test functions.
// ===
//

//
// Begin an add-on test routine.
//
dia.test = function() {
  var type, filename, options
    , args = Array.prototype.slice.call(arguments);

  type = args.shift();
  filename = args.shift();

  // Parse remaining arguments if present.
  if (args.length > 0) {
    options = args.shift();
  }
  if (args.length > 0) {
    dia.plan = args.shift();
  }

  dia.validateManifest(filename, function(result) {
    if (type === 'manifest' || !result || typeof dia.manifest.api.test === 'undefined') return;
    if (type === 'all') {
      dia.validatePost(function() {
        dia.validatePut(function() {
          dia.validateDelete(function() {
            dia.validateSso(options || dia.id);
          });
        });
      });
    } else {
      if (type === 'provision') {
        dia.validatePost();
      }
      if (type === 'planchange') {
        dia.id = options;
        dia.validatePut();
      }
      if (type === 'deprovision') {
        dia.id = options;
        dia.validateDelete();
      }
      if (type === 'sso') {
        dia.validateSso(options);
      }
    }
  });
};

//
// Validates the manifest for this add-on.
//
dia.validateManifest = function(filename, fn) {
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

    dia.manifest = JSON.parse(data);
    validateManifestInternal(dia.manifest, fn);
  });
};

//
// POST to the API endpoint specified in the manifest to simulate
//    a provision call and validate the response.
//
dia.validatePost = function(fn) {
  var opts, i;
  console.log(util.format('testing POST to %s', dia.manifest.api.test.base_url).info);

  opts = {
    uri: dia.manifest.api.test.base_url
  , method: 'POST'
  , auth: {
      user: dia.manifest.id
    , pass: dia.manifest.api.password
    }
  , body: {
      options: {}
    , callback_url: 'http://localhost:8000/callback/999'
    , modulus_id: dia.manifest.id + '999'
    , email: dia.manifest.id + '999' + '@example.com'
    , plan: dia.plan
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

      dia.id = response.body.id;

      if (!response.body.config) {
        console.log('  check response', '[FAIL]'.fail);
        console.log('    config vars not found in response'.fail);
        console.log();
        return fn ? fn() : void 0;
      } else {
        for (i = 0; i < dia.manifest.api.config_vars.length; i++) {
          if (!response.body.config[dia.manifest.api.config_vars[i]]) {
            console.log('  check response', '[FAIL]'.fail);
            console.log(util.format('    config var %s not found in response', dia.manifest.api.config_vars[i]).fail);
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
dia.validateDelete = function(fn) {
  var opts = {
    uri: dia.manifest.api.test.base_url + '/' + dia.id
  , method: 'DELETE'
  , auth: {
      user: dia.manifest.id
    , pass: dia.manifest.api.password
    }
  };

  console.log(util.format('testing DELETE to %s/%s', dia.manifest.api.test.base_url, dia.id).info);

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
dia.validatePut = function(fn) {
  var opts = {
    uri: dia.manifest.api.test.base_url + '/' + dia.id
  , method: 'PUT'
  , auth: {
      user: dia.manifest.id
    , pass: dia.manifest.api.password
    }
  , body: {
      plan: dia.plan || 'foo'
    , modulus_id: dia.manifest.id + '999'
    }
  , json: true
  };

  console.log(util.format('testing PUT to %s/%s', dia.manifest.api.test.base_url, dia.id).info);

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

    if (typeof response.body === 'undefined') {
      console.log('  check response', '[FAIL]'.fail);
      console.log('    config vars not found in response'.fail);
      console.log();
      return fn ? fn() : void 0;
    } else {
      if (typeof response.body.message === 'undefined') {
        console.log('  check response', '[FAIL]'.fail);
        console.log('    message not found in response'.fail);
        console.log();
        return fn ? fn() : void 0;
      }
      if (response.body.config) {
        for (var i = 0; i < dia.manifest.api.config_vars.length; i++) {
          if (!response.body.config[dia.manifest.api.config_vars[i]]) {
            console.log('  check response', '[FAIL]'.fail);
            console.log(util.format('    config var %s not found in response', dia.manifest.api.config_vars[i]).fail);
            console.log();
            return fn ? fn() : void 0;
          }
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
dia.validateSso = function(id) {
  sendInvalidSso(id, function() {
    sendValidSso(id);
  });
};

//
// Initialize a skeleton manifest to the specified filename.
//
dia.init = function(filename) {
  var manifest = {
    id: 'myaddon',
    api: {
      config_vars: [ 'MYADDON_URL' ],
      regions: 'us',
      password: randpass({ length: 32, symbols: false, capitals: false }),
      sso_salt: randpass({ length: 32, symbols: false, capitals: false }),
      production: {
        base_url: 'https://yourapp.com/modulus/resources',
        ssl_url: 'https://yourapp.com/sso/login'
      },
      test: {
        base_url: 'http://localhost:3000/modulus/resources',
        ssl_url: 'http://localhost:3000/sso/login'
      }
    }
  };

  fs.writeFile(filename, JSON.stringify(manifest, null, ' '));
};

//
// Authenticate with Modulus' API using the specified username and password.
//
dia.authenticate = function(username, password, fn) {
  librarian.user.authenticate(username, librarian.util.createHash(password), function(err, user) {
    if (err) {
      var token = null
        , userData = new Buffer(util.format('%s:%s', username, password), 'ascii').toString('base64');

      var opts = {
        url: 'https://api.github.com/authorizations',
        headers: {
          'User-Agent': 'https://modulus.io/',
          authorization: util.format('basic %s', userData)
        },
        json: true
      };

      request.get(opts, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          for (var i = 0; i < body.length; i++) {
            // Find the authorization for the Modulus GitHub application in
            //    order to get the user's OAuth token.
            if (body[i].app.name === 'Modulus') {
              token = body[i].token;
              break;
            }
          }

          if (token) {
            librarian.user.authenticateOAuth('github', token, fn);
          } else {
            fn(new Error('User Not found.'), null);
          }
        } else {
          if (response.statusCode === 403) {
            fn(new Error('User Not found.'), null);
          } else {
            fn(new Error('User Not found.'), null);
          }
        }
      });
    } else {
      return fn(null, user);
    }
  });
};

//
// Create an add-on. Validates the manifest then POSTs the manifest object to
//    Modulus to be created.
//
dia.create = function(filename, user) {
  if (!userConfig.data) return console.log('\n  you must configured the API endpoint\n'.fail);
  if (!user.flags.isProvider) return console.log('\n  you must opt into the Modulus provider program\n'.fail);
  if (!user.flags.isVerified) return console.log('\n  you must be verified to create an add-on\n'.fail);

  if (filename.length > 0) {
    if (!fs.existsSync(filename)) {
      console.log('  specified manifest does not exist\n'.fail);
    }
  } else {
    filename = path.resolve('./', 'addon-manifest.json');
  }

  fs.readFile(filename, { encoding: 'utf8' }, function(err, data) {
    if (err || !data) {
      return console.log(util.format('\n  failed to open the manifest at %s\n', filename).fail);
    }

    var manifest = JSON.parse(data);
    validateManifestInternal(manifest, function(result) {
      if (result) {
        console.log('creating add-on'.info);
        librarian.addOns.create(user.id, user.authToken, manifest, function(err, addon) {
          if (err) return console.log('\n  failed to create add-on'.fail);
          if (addon.err) {
            console.log('\n  failed to create add-on'.fail);
            if (addon.code === 11000) {
              return console.log(util.format('  add-on \'%s\' already exists\n', manifest.id).fail);
            }
            return console.log(util.format('  error code: %s', addon.code).fail);
          }
          console.log('successfully created add-on.\n'.info);
        });
      } else {
        console.log('  unable to create add-on because the specified manifest is invalid\n'.fail);
      }
    });
  });
};
