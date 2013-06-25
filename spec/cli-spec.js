/*!
 * Dash
 * Copyright(c) 2013 Modulus <support@modulus.io>
 * MIT Licensed
 */

var cli  = require('../lib/cli').cli
  , dash = require('../lib/cli').dash;

describe('cli', function() {

  describe('#test', function() {

    it('`all` should call test with correct test type', function(done) {
      spyOn(dash, 'test');

      cli.parse(['node', 'test', 'test all']);

      expect(dash.test).wasCalled();
      expect(dash.test).wasCalledWith('all', '');

      done();
    });

    xit('`all` with filename should provide a path', function(done) {
      spyOn(dash, 'test');

      cli.parse(['node', 'test', '--filename=./path/to/addon-manifest.json', 'test all']);

      expect(dash.test).wasCalled();
      expect(cli.filename).toEqual('./path/to/addon-manifest.json');
      expect(dash.test).wasCalledWith('all', './path/to/addon-manifest.json');

      done();
    });

    it('`provision` should call test with correct test type', function(done) {
      spyOn(dash, 'test');

      cli.parse(['node', 'test', 'test provision']);

      expect(dash.test).wasCalled();
      expect(dash.test).wasCalledWith('provision', '', undefined);

      done();
    });

    it('`deprovision` should call with correct test type', function(done) {
      spyOn(dash, 'test');

      cli.parse(['node', 'test', 'test deprovision', 0]);

      expect(dash.test).wasCalled();
      expect(dash.test).wasCalledWith('deprovision', '', 0);

      done();
    });

    it('should call init', function(done) {
      spyOn(dash, 'init');

      cli.parse(['node', 'test', 'init']);

      expect(dash.init).wasCalled();

      done();
    });
  });
});
