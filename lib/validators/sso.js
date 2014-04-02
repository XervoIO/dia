//
//     Dia
//     Copyright(c) 2014 Modulus <support@modulus.io>
//     MIT Licensed
//

var request = require('request');
var crypto = require('crypto');
var util = require('util');

module.exports = function (dia) {

  //
  // POST invalid single sign on authentication data and check
  //    the result.
  //
  var sendInvalidSso = function (id, fn) {
    var opts = {
      uri: dia.manifest.api.test.sso_url,
      method: 'POST',
      body: {
        id: id,
        timestamp: parseInt(Date.now() / 1000, 10),
        email: dia.manifest.id + '999' + '@example.com',
        token: 'invalid',
        'nav-data': ''
      },
      json: true
    };

    console.log('testing invalid single sign on authentication'.info);

    request(opts, function (err, response) {
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
  var sendValidSso = function (id) {
    var timestamp = parseInt(Date.now() / 1000, 10);
    var preToken  = id + ':' + dia.manifest.api.sso_salt + ':' + timestamp;
    var token     = crypto.createHash('sha1').update(preToken).digest('hex');

    var opts = {
      uri: dia.manifest.api.test.sso_url,
      method: 'POST',
      body: {
        id: id,
        timestamp: timestamp,
        email: dia.manifest.id + '999' + '@example.com',
        token: token,
        'nav-data': ''
      },
      json: true
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

        request.get(getUrl, function (err, response) {
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
  // Simulate single sign on authentication and check the response.
  //
  return function (id) {
    sendInvalidSso(id, function () {
      sendValidSso(id);
    });
  };

};
