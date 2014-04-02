//
//     Dia
//     Copyright(c) 2014 Modulus <support@modulus.io>
//     MIT Licensed
//

module.exports = function (dia) {

  var internals = {};
  var utils = require('./utils');

  //
  // Bootstrap and attach each of the validators.
  //

  internals.manifest    = require('./manifest')(dia, utils);
  internals.provision   = require('./provision')(dia, utils);
  internals.deprovision = require('./deprovision')(dia, utils);
  internals.planchange  = require('./planchange')(dia, utils);
  internals.sso         = require('./sso')(dia, utils);

  return internals;

};
