//
//     Dia
//     Copyright(c) 2014 Modulus <support@modulus.io>
//     MIT Licensed
//

var UserConfig = require('./user-config');
var librarian  = require('./librarian');
var randpass   = require('randpass');
var request    = require('request');
var path       = require('path');
var util       = require('util');
var url        = require('url');
var fs         = require('fs');

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
} else {
  librarian.init('api.onmodulus.net', 443, true);
}

var validators = require('./validators')(dia);

//
// Run the specified tests.
//
dia.test = function () {
  var type, filename, options;
  var args = Array.prototype.slice.call(arguments);

  type = args.shift();
  filename = args.shift();

  // Parse remaining arguments if present.
  if (args.length > 0) {
    options = args.shift();
  }
  if (args.length > 0) {
    dia.plan = args.shift();
  }

  validators.manifest(filename, function (result) {
    if (type === 'manifest' || !result || typeof dia.manifest.api.test === 'undefined') {
      return;
    }

    if (type === 'all') {
      validators.provision(function () {
        validators.planchange(function () {
          validators.deprovision(function () {
            validators.sso(options || dia.id);
          });
        });
      });
    } else {
      if (type === 'provision') {
        validators.provision();
      }
      if (type === 'planchange') {
        dia.id = options;
        validators.planchange();
      }
      if (type === 'deprovision') {
        dia.id = options;
        validators.deprovision();
      }
      if (type === 'sso') {
        validators.sso(options);
      }
    }
  });
};

//
// Set a configuration value
//
dia.setConfig = function (key, value) {
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
dia.getConfig = function (key) {
  if (userConfig.data && typeof userConfig.data[key] !== 'undefined') {
    console.log('\n ', userConfig.data[key].info, '\n');
  } else {
    console.log('\n  key not found\n'.fail);
  }
};

//
// Initialize a skeleton manifest to the specified filename/specifier.
//
dia.init = function (filename) {
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
dia.authenticate = function (username, password, fn) {
  librarian.user.authenticate(username, librarian.util.createHash(password), function (err, user) {
    if (err) {
      var token = null;
      var userData = new Buffer(util.format('%s:%s', username, password), 'ascii').toString('base64');

      var opts = {
        url: 'https://api.github.com/authorizations',
        headers: {
          'User-Agent': 'https://modulus.io/',
          authorization: util.format('basic %s', userData)
        },
        json: true
      };

      request.get(opts, function (error, response, body) {
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
dia.create = function (filename, user) {
  if (!user.flags.isProvider) {
    return console.log('\n  you must opt into the Modulus provider program\n'.fail);
  }
  if (!user.flags.isVerifiedProvider) {
    return console.log('\n  you must be verified to create an add-on\n'.fail);
  }

  if (filename.length > 0) {
    if (!fs.existsSync(filename)) {
      console.log('  specified manifest does not exist\n'.fail);
    }
  } else {
    filename = path.resolve('./', 'addon-manifest.json');
  }

  fs.readFile(filename, { encoding: 'utf8' }, function (err, data) {
    if (err || !data) {
      return console.log(util.format('\n  failed to open the manifest at %s\n', filename).fail);
    }

    var manifest = JSON.parse(data);

    librarian.addOns.create(user.id, user.authToken, manifest, function (err, addon) {
      if (err) {
        return console.log('\n  failed to create add-on'.fail);
      }

      if (addon.err) {
        console.log('\n  failed to create add-on'.fail);
        if (addon.code === 11000) {
          return console.log(util.format('  add-on \'%s\' already exists\n', manifest.id).fail);
        }
        return console.log(util.format('  error code: %s', addon.code).fail);
      }

      console.log('successfully created add-on.\n'.info);
    });
  });
};
