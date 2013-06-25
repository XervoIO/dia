/*!
 * Dash
 * Copyright(c) 2013 Modulus <support@modulus.io>
 * MIT Licensed
 */

var cli  = require('../lib/cli').cli
  , dash = require('../lib/cli').dash;

describe('cli', function() {

  describe('test types', function() {

    it('should call test with correct test type of `all`', function(done) {
      spyOn(dash, 'test');

      cli.parse(['node', 'test', 'test all']);

      expect(dash.test).wasCalled();
      expect(dash.test).wasCalledWith('all', '');

      done();
    });

    it('should call test with correct test type of `provision`', function(done) {
      spyOn(dash, 'test');

      cli.parse(['node', 'test', 'test provision']);

      expect(dash.test).wasCalled();
      expect(dash.test).wasCalledWith('provision', '', undefined, 'test');

      done();
    });

    it('should call test with correct test type of `deprovision`', function(done) {
      spyOn(dash, 'test');

      cli.parse(['node', 'test', 'test deprovision', 0]);

      expect(dash.test).wasCalled();
      expect(dash.test).wasCalledWith('deprovision', '', 0, 'test');

      done();
    });
  });

  describe('initialization', function() {
    it('should call init', function(done) {
      spyOn(dash, 'init');

      cli.parse(['node', 'test', 'init']);

      expect(dash.init).wasCalled();

      done();
    });
  });

  describe('options', function() {
    it('should provide a filename path', function(done) {
      spyOn(dash, 'test');

      cli.parse(['node', 'test', '--filename=./path/to/addon-manifest.json', 'test all']);

      expect(dash.test).wasCalled();
      expect(cli.filename).toEqual('./path/to/addon-manifest.json');
      expect(dash.test).wasCalledWith('all', './path/to/addon-manifest.json');

      done();
    });

    it('should provide a specific plan', function(done) {
      cli.filename = '';
      spyOn(dash, 'test');

      cli.parse(['node', 'test', '--plan=foo', 'test provision']);

      expect(dash.test).wasCalled();
      expect(cli.plan).toEqual('foo');
      expect(dash.test).wasCalledWith('provision', '', undefined, 'foo');

      done();
    });
  });
});
