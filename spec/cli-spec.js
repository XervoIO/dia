/*!
 * Dash
 * Copyright(c) 2013 Modulus <support@modulus.io>
 * MIT Licensed
 */

var cli  = require('../lib/cli').cli
  , dash = require('../lib/cli').dash;

describe('cli', function() {

  describe('#test', function() {

    it('should succeed with no path', function(done) {
      spyOn(dash, 'test');

      cli.parse(['node', 'test', 'test']);

      expect(dash.test).wasCalled();

      done();
    });

    it('should accept a path', function(done) {
      spyOn(dash, 'test');

      cli.parse(['node', 'test', 'test', './path/to/addon']);

      expect(dash.test).wasCalled();
      expect(dash.test).wasCalledWith('./path/to/addon');

      done();
    });
  });
});
