//
//     Dia
//     Copyright(c) 2013 Modulus <support@modulus.io>
//     MIT Licensed
//

var cli  = require('../lib/cli').cli;
var dia  = require('../lib/cli').dia;

describe('test types', function() {
  it('should call test with correct test type of `all`', function() {
    spyOn(dia, 'test');

    cli.parse(['node', 'test', 'test']);

    expect(dia.test).wasCalled();
    expect(dia.test).wasCalledWith('all', '');
  });

  it('should call test with correct test type of `provision`', function() {
    spyOn(dia, 'test');

    cli.parse(['node', 'test', 'test provision']);

    expect(dia.test).wasCalled();
    expect(dia.test).wasCalledWith('provision', '', undefined, 'test');
  });

  it('should call test with correct test type of `deprovision`', function() {
    spyOn(dia, 'test');

    cli.parse(['node', 'test', 'test deprovision', 0]);

    expect(dia.test).wasCalled();
    expect(dia.test).wasCalledWith('deprovision', '', 0, 'test');
  });

  it('should call test with correct test type of `manifest`', function() {
    spyOn(dia, 'test');

    cli.parse(['node', 'test', 'test manifest']);

    expect(dia.test).wasCalled();
    expect(dia.test).wasCalledWith('manifest', '');
  });

  it('should call test with correct test type of `planchange`', function() {
    spyOn(dia, 'test');

    cli.parse(['node', 'test', 'test planchange', 0, 'foo']);

    expect(dia.test).wasCalled();
    expect(dia.test).wasCalledWith('planchange', '', 0, 'foo');
  });

  it('should call test with correct test type of `sso`', function() {
    spyOn(dia, 'test');

    cli.parse(['node', 'test', 'test sso', 'id']);

    expect(dia.test).wasCalled();
    expect(dia.test).wasCalledWith('sso', '', 'id');
  });

  it('should call config get with the correct parameters', function() {
    spyOn(dia, 'getConfig');

    cli.parse(['node', 'test', 'config get', 'test']);

    expect(dia.getConfig).wasCalled();
    expect(dia.getConfig).wasCalledWith('test');
  });

  it('should call config set with the correct parameters', function() {
    spyOn(dia, 'setConfig');

    cli.parse(['node', 'test', 'config set', 'test', 'value']);

    expect(dia.setConfig).wasCalled();
    expect(dia.setConfig).wasCalledWith('test', 'value');
  });
});

describe('skeleton manifest initialization', function() {
  it('should call #init', function() {
    spyOn(dia, 'init');

    cli.parse(['node', 'test', 'init']);

    expect(dia.init).wasCalled();
  });
});

describe('options', function() {
  it('should provide a filename path', function() {
    spyOn(dia, 'test');

    cli.parse(['node', 'test', '--filename=./path/to/addon-manifest.json', 'test']);

    expect(dia.test).wasCalled();
    expect(cli.filename).toEqual('./path/to/addon-manifest.json');
    expect(dia.test).wasCalledWith('all', './path/to/addon-manifest.json');
  });

  it('should provide a specific plan', function() {
    cli.filename = '';
    spyOn(dia, 'test');

    cli.parse(['node', 'test', '--plan=foo', 'test provision']);

    expect(dia.test).wasCalled();
    expect(cli.plan).toEqual('foo');
    expect(dia.test).wasCalledWith('provision', '', undefined, 'foo');
  });
});
