var fs = require('fs');

//
// User configuration constructor.
//
function UserConfig() {
  this.dir = getUserHome() + '/.modulus/';
  if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir);
};

//
// Attempt to load the configuration file and attach the content to the `data`
//    property. If no file exists, the `data` property is null.
//
UserConfig.prototype.load = function() {
  var configFile = this.dir + 'current-moddia.json';
  if (fs.existsSync(configFile)) {
    try {
      this.data = JSON.parse(fs.readFileSync(configFile));
    } catch(e) {
      this.data = null;
    }
    return true;
  } else {
    return false;
  }
};

//
// Save the specified data object to the configuration file.
//
UserConfig.prototype.save = function(data) {
  var configFile = this.dir + 'current-moddia.json';
  fs.writeFileSync(configFile, JSON.stringify(data));
  return true;
};

//
// Clear out the configuration file.
//
UserConfig.prototype.clear = function() {
  var configFile = this.dir + 'current-moddia.json';
  fs.writeFileSync(configFile, '');
  return true;
};

//
// Get the local machine's home directory for the current user.
//
var getUserHome = function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

module.exports = UserConfig;
