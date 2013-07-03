SRC = ./lib/cli.js ./lib/dash.js ./spec/cli-spec.js ./spec/dash-spec.js

test:
	./node_modules/.bin/jasmine-node spec --verbose

lint: $(SRC)
	./node_modules/.bin/jshint $^

build: lint test
