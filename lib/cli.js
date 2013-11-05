//
//     Dia
//     Copyright(c) 2013 Modulus <support@modulus.io>
//     MIT Licensed
//

var fs      = require('fs')
  , colors  = require('colors')
  , prompt  = require('prompt')
  , program = require('commander-plus')
  , dia     = require('./dia');

colors.setTheme({
  info: 'cyan'
, fail: 'red'
, pass: 'green'
});

exports.dia = dia;
exports.cli = program;

prompt.start();
prompt.message = '';
prompt.delimiter = '';

program
  .version('0.0.0')
  .option('-f, --filename <path>', 'path to manifest.json file - defaults to the current working directory', String, '')
  .option('-p, --plan <plan>', 'provision the specified plan instead of "test"', String, 'test');

program
  .command('config set', '<key> <value>', 'set a configuration value')
  .action(function(key, value) {
    dia.setConfig(key, value);
  });

program
  .command('config get', '<key>', 'get a configuration value')
  .action(function(key) {
    dia.getConfig(key);
  });

program
  .command('init', '', 'initialize a skeleton manifest')
  .action(function() {
    var out = program.filename || 'addon-manifest.json';

    if (fs.existsSync(out)) {
      prompt.get([{
        name: 'overwrite'
      , pattern: /^[yn]/
      , message: 'Response must be "y" or "n"'
      , description: 'Manifest already exists. Replace it? (y/n)'
      , required: true
      }], function(err, result) {
        if (typeof result !== 'undefined' && result.overwrite === 'y') {
          dia.init(out);
        } else {
          if (err) console.log();
          process.exit(0);
        }
      });
    } else {
      dia.init(out);
    }
  });

program
  .command('test', '', 'run all add-on tests')
  .action(function() {
    dia.test('all', program.filename);
  });

program
  .command('test manifest', '', 'test a manifest (run before each test)')
  .action(function() {
    dia.test('manifest', program.filename);
  });

program
  .command('test provision', '[params]', 'simulate a provision call')
  .action(function(params) {
    dia.test('provision', program.filename, params, program.plan);
  });

program
  .command('test deprovision', '<id>', 'simulate a deprovision call')
  .action(function(id) {
    dia.test('deprovision', program.filename, id, program.plan);
  });

program
  .command('test planchange', '<id> [new_plan]', 'simulate a plan change')
  .action(function(id, plan) {
    dia.test('planchange', program.filename, id, plan);
  });

program
  .command('test sso', '<id>', 'simulate single sign on authentication for the add-on with the specified ID')
  .action(function(id) {
    dia.test('sso', program.filename, id);
  });

program
  .command('create', '', 'create an add-on')
  .action(function() {
    if (typeof dia.userConfig.data === 'undefined') return console.log('\n  error: you must configure the API endpoint\n'.fail);

    var prompts = [{
        name: 'username'
      , description: 'Enter your username or email address (Modulus or GitHub)'
      , required: true
      }
    , {
        name: 'password'
      , description: 'Enter your password (Modulus or GitHub)'
      , hidden: true
      , required: true
      }
    ];

    prompt.get(prompts, function(err, result) {
      if (typeof result !== 'undefined') {
        dia.authenticate(result.username, result.password, function(err, user) {
          if (err) {
            typeof err === 'string' ? console.log(err.fail)
              : console.log('\n  invalid user credentials\n'.fail);

            return void 0;
          }
          if (!user) return console.log('\n  invalid user credentials\n'.fail);
          dia.create(program.filename, user);
        });
      } else {
        if (err) console.log();
        process.exit(0);
      }
    });
  });

program.parse(process.argv);

if (!program.args.length) {
  program.help();
}
