Dash
===

Test Modulus add-ons quickly and easily.

## Commands and Options

Run `$ dash -h` for a complete list of commands and options.

    Usage: dash [options] [command]

    Commands:

      init                   initialize a skeleton manifest
      test all               test an add-on
      test manifest          test a manifest (run before each test)
      test provision [params] simulate a provision call
      test deprovision <id>  simulate a deprovision call
      test planchange <id> <new_plan> simulate a plan change

    Options:

      -h, --help             output usage information
      -V, --version          output the version number
      -f, --filename <path>  path to manifest.json file - defaults to the current working directory
      -p, --plan <plan>      provision the specified plan instead of "test"
