//
//     Dia
//     Copyright(c) 2014 Modulus <support@modulus.io>
//     MIT Licensed
//

var util = require('util');
var path = require('path');
var fs   = require('fs');

module.exports = function (dia, utils) {

  //
  // Validate each property of a manifest.
  //
  var validateManifestInternal = function (manifest, fn) {
    var pass = true;

    console.log('\ntesting manifest id'.info);
    utils.validateString(manifest.id, 'id');

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
    utils.validateString(manifest.api.password, 'api password', pass);
    utils.validateString(manifest.api.sso_salt, 'api sso salt', pass);

    console.log();
    console.log('testing production api properties'.info);
    if (typeof manifest.api.production === 'undefined') {
      console.log('  check for production api', '[FAIL]'.fail);
      console.log();
      return fn(false);
    } else {
      console.log('  check for production api', '[PASS]'.pass);
    }

    utils.validateString(manifest.api.production.base_url, 'production base_url', pass);
    utils.validateString(manifest.api.production.sso_url, 'production sso_url', pass);

    console.log();
    console.log('testing test api properties'.info);
    if (typeof manifest.api.test === 'undefined') {
      console.log('  check for test api', '[FAIL]'.fail);
      console.log();
      return fn(false);
    } else {
      console.log('  check for test api', '[PASS]'.pass);
    }

    utils.validateString(manifest.api.test.base_url, 'test base_url', pass);
    utils.validateString(manifest.api.test.sso_url, 'test sso_url', pass);

    console.log();
    fn(pass);
  };

  //
  // Validates the manifest.
  //
  return function (filename, fn) {
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

};
