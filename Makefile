SRC = $(wildcard lib/*.js) $(wildcard lib/validators/*.js) $(wildcard spec/*.js)

test: $(SRC)
	@node_modules/.bin/jshint $^
	@node_modules/.bin/jasmine-node spec --verbose
