SRC = ./lib/cli.js ./lib/dash.js ./spec/dash-spec.js

test:
	@./node_modules/.bin/jshint $^
	@./node_modules/.bin/jasmine-node spec --verbose
