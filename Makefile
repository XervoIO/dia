SRC = lib/cli.js lib/dia.js spec/dia-spec.js \
	lib/user-config.js librarian/index.js librarian/util.js \
	librarian/http.js

test:
	@node node_modules/.bin/jshint $^
	@node node_modules/.bin/jasmine-node spec --verbose
