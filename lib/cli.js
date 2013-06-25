/*!
 * Dash
 * Copyright(c) 2013 Modulus <support@modulus.io>
 * MIT Licensed
 */

var fs      = require('fs')
  , prompt  = require('prompt')
  , program = require('commander-plus')
  , dash    = require('./dash');

exports.dash = dash;
exports.cli  = program;

prompt.start();
prompt.message = '';
prompt.delimiter = '';

program
  .version('0.0.0')
  .option('-f, --filename <path>', 'path to manifest.json file - defaults to the current working directory', String, '')
  .option('-p, --plan <plan>', 'provision the specified plan instead of "test"', String, 'test');

program
  .command('init', '', 'initialize a skeleton manifest')
  .action(function() {
    var out = program.filename || './addon-manifest.json';
    
    if (fs.existsSync(out)) {
      prompt.get([{
        name: 'overwrite'
      , pattern: /^[yn]/
      , message: 'Response must be "y" or "n"'
      , description: 'Manifest already exists. Replace it? (y/n)'
      , required: true
      }], function(err, result) {
        if (typeof result !== 'undefined' && result.overwrite === 'y') {
          dash.init(out);
        } else {
          if (err) console.log();
          process.exit(0);
        }
      });
    } else {
      dash.init(out);
    }
    
  });

program
  .command('test all', '', 'test an add-on')
  .action(function() {
    dash.test('all', program.filename);
  });

program
  .command('test manifest', '', 'test a manifest (run before each test)')
  .action(function() {
    dash.test('manifest', program.filename);
  });

program
  .command('test provision', '[params]', 'simulate a provision call')
  .action(function(params) {
    dash.test('provision', program.filename, params, program.plan);
  });

program
  .command('test deprovision', '<id>', 'simulate a deprovision call')
  .action(function(id) {
    dash.test('deprovision', program.filename, id, program.plan);
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
