SRC = ./lib/cli.js ./lib/dia.js ./spec/dia-spec.js

test:
	@./node_modules/.bin/jshint $^
	@./node_modules/.bin/jasmine-node spec --verbose
