Dash
===

Test Modulus add-ons quickly and easily.

Install using `$ [sudo] npm install -g modulus-dash`

Run all tests for your add-on by running `$ dash test` or test individual endpoints (see below). Use the `-f` option to specify the
location of the manifest for your add-on; otherwise, the current working directory will be used.

## Commands and Options

Run `$ dash -h` for a complete list of commands and options.

    Usage: dash [options] [command]

    Commands:

      init                   initialize a skeleton manifest
      test                   run all add-on tests
      test manifest          test a manifest (run before each test)
      test provision [params] simulate a provision call
      test deprovision <id>  simulate a deprovision call
      test planchange <id> [new_plan] simulate a plan change
      test sso <id>          simulate single sign on authentication for the add-on with the specified ID

    Options:

      -h, --help             output usage information
      -V, --version          output the version number
      -f, --filename <path>  path to manifest.json file - defaults to the current working directory
      -p, --plan <plan>      provision the specified plan instead of "test"

Released under the MIT license.
