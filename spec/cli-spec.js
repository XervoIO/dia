//     Dash version 0.0.0

//     (c) 2013 Modulus <support@modulus.io>
//     MIT Licensed

var cli  = require('../lib/cli').cli
  , dash = require('../lib/cli').dash;

describe('cli', function() {
  describe('test types', function() {
    it('should call test with correct test type of `all`', function() {
      spyOn(dash, 'test');

      cli.parse(['node', 'test', 'test']);

      expect(dash.test).wasCalled();
      expect(dash.test).wasCalledWith('all', '');
    });

    it('should call test with correct test type of `provision`', function() {
      spyOn(dash, 'test');

      cli.parse(['node', 'test', 'test provision']);

      expect(dash.test).wasCalled();
      expect(dash.test).wasCalledWith('provision', '', undefined, 'test');
    });

    it('should call test with correct test type of `deprovision`', function() {
      spyOn(dash, 'test');

      cli.parse(['node', 'test', 'test deprovision', 0]);

      expect(dash.test).wasCalled();
      expect(dash.test).wasCalledWith('deprovision', '', 0, 'test');
    });

    it('should call test with correct test type of `manifest`', function() {
      spyOn(dash, 'test');

      cli.parse(['node', 'test', 'test manifest']);

      expect(dash.test).wasCalled();
      expect(dash.test).wasCalledWith('manifest', '');
    });

    it('should call test with correct test type of `planchange`', function() {
      spyOn(dash, 'test');

      cli.parse(['node', 'test', 'test planchange', 0, 'foo']);

      expect(dash.test).wasCalled();
      expect(dash.test).wasCalledWith('planchange', '', 0, 'foo');
    });

    it('should call test with correct test type of `sso`', function() {
      spyOn(dash, 'test');

      cli.parse(['node', 'test', 'test sso', 'id']);

      expect(dash.test).wasCalled();
      expect(dash.test).wasCalledWith('sso', '', 'id');
    });
  });

  describe('skeleton manifest initialization', function() {
    it('should call #init', function() {
      spyOn(dash, 'init');

      cli.parse(['node', 'test', 'init']);

      expect(dash.init).wasCalled();
    });
  });

  describe('options', function() {
    it('should provide a filename path', function() {
      spyOn(dash, 'test');

      cli.parse(['node', 'test', '--filename=./path/to/addon-manifest.json', 'test']);

      expect(dash.test).wasCalled();
      expect(cli.filename).toEqual('./path/to/addon-manifest.json');
      expect(dash.test).wasCalledWith('all', './path/to/addon-manifest.json');
    });

    it('should provide a specific plan', function() {
      cli.filename = '';
      spyOn(dash, 'test');

      cli.parse(['node', 'test', '--plan=foo', 'test provision']);

      expect(dash.test).wasCalled();
      expect(cli.plan).toEqual('foo');
      expect(dash.test).wasCalledWith('provision', '', undefined, 'foo');
    });
  });

  describe('test functions are called', function() {
    
    //
    // Mock #validateManifest to avoid the I/O operation.
    //
    beforeEach(function() {
      spyOn(dash, 'validateManifest').andCallFake(function() {
        dash.manifest = {};
        dash.manifest.api = {};
        dash.manifest.api.test = {};

        return arguments[1](true);
      });
    });
    
    it('should call #validateManifest on `manifest`', function() {
      cli.parse(['node', 'test', 'test manifest']);

      // Already spied upon in beforeEach.
      expect(dash.validateManifest).wasCalled();
    });

    it('should call #validatePost on `provision`', function() {
      spyOn(dash, 'validatePost');

      cli.parse(['node', 'test', 'test provision']);

      expect(dash.validatePost).wasCalled();
    });

    it('should call #validatePut on `planchange`', function() {
      spyOn(dash, 'validatePut');

      cli.parse(['node', 'test', 'test planchange', 0, 'foo']);

      expect(dash.validatePut).wasCalled();
    });

    it('should call #validateSso on `sso`', function() {
      spyOn(dash, 'validateSso');

      cli.parse(['node', 'test', 'test sso', 0]);

      expect(dash.validateSso).wasCalled();
    });

    it('should call #validateDelete on `deprovision`', function() {
      spyOn(dash, 'validateDelete');

      cli.parse(['node', 'test', 'test deprovision', 0]);

      expect(dash.validateDelete).wasCalled();
    });
  });
});
