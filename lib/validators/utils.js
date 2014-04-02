//
//     Dia
//     Copyright(c) 2014 Modulus <support@modulus.io>
//     MIT Licensed
//

var util = require('util');

//
// Validate a string value - check that the value exists, is a string,
//    and is not empty.
//
exports.validateString = function(value, name, pass) {
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
