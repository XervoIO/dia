//
//     Dia
//     Copyright(c) 2014 Modulus <support@modulus.io>
//     MIT Licensed
//

var request = require('request');
var util = require('util');

module.exports = function (dia) {

  //
  // DELETE to the API endpoint to simulate a deprovision call
  //    and validate the response.
  //
  return function (fn) {
    var opts = {
      uri: dia.manifest.api.test.base_url + '/' + dia.id,
      method: 'DELETE',
      auth: {
        user: dia.manifest.id,
        pass: dia.manifest.api.password
      }
    };

    console.log(util.format('testing DELETE to %s/%s', dia.manifest.api.test.base_url, dia.id).info);

    request(opts, function (err, response) {
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

};
