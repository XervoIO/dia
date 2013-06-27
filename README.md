Dash
===

Check your provider API implementation for a Modulus add-on quickly and easily.

## Installation

Install using `$ [sudo] npm install -g modulus-dash`

## Testing an add-on

Implement your add-on provider API following the instructions found in the [Modulus codex](https://modulus.io/docs/addons/provider-api) or start with the example add-on project [here](https://github.com.fiveisprime/example-addon). Once your API is implemented, start your server up at the base test URL configured in your manifest and run `$ dash test` with your manifest (either from the working directory that contains the manifest or use the `-f` option).

Run all tests for your add-on by running `$ dash test` or test individual endpoints (see below). Use the `-f` option to specify the
location of the manifest for your add-on; otherwise, the current working directory will be used.

_Note: the provided manifest will be validated for each check_

Failed checks will provide a description of what is missing or incorrect. Once all checks pass, submit your add-on to Modulus.

## Commands and options

Run `$ dash -h` for a complete list of commands and options.

    Usage: dash [options] [command]

    Commands:

      init                              initialize a skeleton manifest
      test                              run all add-on tests
      test manifest                     test a manifest (run before each test)
      test provision [params]           simulate a provision call
      test deprovision <id>             simulate a deprovision call
      test planchange <id> [new_plan]   simulate a plan change
      test sso <id>                     simulate single sign on authentication for the add-on with the specified ID

    Options:

      -h, --help             output usage information
      -V, --version          output the version number
      -f, --filename <path>  path to manifest.json file - defaults to the current working directory
      -p, --plan <plan>      provision the specified plan instead of "test"

### Released under the MIT license.
