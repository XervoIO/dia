SRC = ./lib/cli.js ./lib/dash.js ./spec/dash-spec.js

build: lint test

lint: $(SRC)
	@./node_modules/.bin/jshint $^

test:
	@./node_modules/.bin/jasmine-node spec --verbose
