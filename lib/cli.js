/*!
 * Dash
 * Copyright(c) 2013 Modulus <support@modulus.io>
 * MIT Licensed
 */

var program = require('commander-plus')
  , dash    = require('./dash');

exports.dash = dash;
exports.cli  = program;

program
  .version('0.0.0')
  .option('-f, --filename <path>', 'path to manifest.json file - defaults to the current working directory', String, '');

program
  .command('init', '', 'initialize a skeleton manifest')
  .action(function() {
    dash.init();
  });

program
  .command('test all', '', 'test an add-on')
  .action(function() {
    dash.test('all', program.filename);
  });

program
  .command('test provision', '[params]', 'simulate a provision call')
  .action(function(params) {
    dash.test('provision', program.filename, params);
  });

program
  .command('test deprovision', '<id>', 'simulate a deprovision call')
  .action(function(id) {
    dash.test('deprovision', program.filename, id);
  });

program
  .command('test planchange', '<id> <new_plan>', 'simulate a plan change')
  .action(function(id, plan) {
    dash.test('planchange', program.filename, id, plan);
  });

program.parse(process.argv);

if (!program.args.length) {
  program.help();
}
