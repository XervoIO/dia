SRC = $(wildcard lib/*.js) $(wildcard spec/*.js)

test: $(SRC)
	@node node_modules/.bin/jshint $^
	@node node_modules/.bin/jasmine-node spec --verbose
