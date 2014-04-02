//
//     Dia
//     Copyright(c) 2014 Modulus <support@modulus.io>
//     MIT Licensed
//

var request = require('request');
var util = require('util');

module.exports = function (dia) {
  //
  // POST to the API endpoint specified in the manifest to simulate
  //    a provision call and validate the response.
  //
  return function (fn) {
    var opts, i;
    console.log(util.format('testing POST to %s', dia.manifest.api.test.base_url).info);

    opts = {
      uri: dia.manifest.api.test.base_url,
      method: 'POST',
      auth: {
        user: dia.manifest.id,
        pass: dia.manifest.api.password
      },
      body: {
        options: {},
        callback_url: 'http://localhost:8000/callback/999',
        modulus_id: dia.manifest.id + '999',
        email: dia.manifest.id + '999' + '@example.com',
        plan: dia.plan,
        region: 'us-east-1'
      },
      json: true
    };

    request(opts, function (err, response) {
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

};
