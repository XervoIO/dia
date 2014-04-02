//
//     Dia
//     Copyright(c) 2014 Modulus <support@modulus.io>
//     MIT Licensed
//

var request = require('request');
var util    = require('util');

module.exports = function (dia) {

  //
  // PUT to the API endpoint to simulate a planchange call
  //    and validate the response.
  //
  return function (fn) {
    var opts = {
      uri: dia.manifest.api.test.base_url + '/' + dia.id,
      method: 'PUT',
      auth: {
        user: dia.manifest.id,
        pass: dia.manifest.api.password
      },
      body: {
        plan: dia.plan || 'foo',
        modulus_id: dia.manifest.id + '999'
      },
      json: true
    };

    console.log(util.format('testing PUT to %s/%s', dia.manifest.api.test.base_url, dia.id).info);

    request(opts, function (err, response) {
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

};
