SRC = ./lib/cli.js ./lib/dia.js ./spec/dia-spec.js

test:
	@node node_modules/.bin/jshint $^
	@node node_modules/.bin/jasmine-node spec --verbose
