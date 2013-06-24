/*!
 * Dash
 * Copyright(c) 2013 Modulus <support@modulus.io>
 * MIT Licensed
 */

var program = require('commander-plus')
  , colors  = require('colors')
  , dash    = require('./dash');

exports.dash = dash;
exports.cli  = program;

program
  .version('0.0.0');

program
  .command('test', '[path]', 'test an add-on')
  .action(function(path) {
    dash.test(path);
  });

program.parse(process.argv);

if (!program.args.length) {
  program.help();
}
