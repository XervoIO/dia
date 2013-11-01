//
//     Copyright(c) 2013 Modulus <support@modulus.io>
//     MIT Licensed
//

var librarian_util = require('./util'),
              util = require('util'),
                 _ = require('underscore'),
              http = require('./http');

var librarian = {};
librarian.user = {};
librarian.billing = {};
librarian.addOns = {};
librarian.project = {};
librarian.pu = {};
librarian.host = {};
librarian.servo = {};
librarian.activity = {};
librarian.stats = {};
librarian.database = {};
librarian.ssl = {};
librarian.billing = {};
librarian.promo = {};
librarian.usage = {};
librarian.deployLogs = {};
librarian.hook = {};
librarian.util = librarian_util;

librarian._http = null;

librarian.init = function(host, port, ssl) {
  if(!ssl) {
    ssl = false;
  }
  librarian._http = new http(host, port, ssl);
  return this;
};

//-----------------------------------------------------------------------------
// Request Forwarding
//-----------------------------------------------------------------------------

//Regex to process a URL with variables
var urlRegex = /(:.+?)(?=:|[\/?]|$)/;

//Returns a function that express can use to process a request, but doesn't use
//express' body parser so the request is raw and unprocessed by express.
librarian.forward = function(senderMehtod, senderURLPattern, targetURL, urlParams, headers, callback) {
  return function(req, res, next) {
    if(req.url.match(senderURLPattern) && req.method === senderMehtod) {
      var tURL = targetURL;
      if(urlRegex.test(tURL) === true && urlParams !== null) {
        tURL = processURL(targetURL, urlParams, req, res);
        if(tURL === null) {
          callback({error: 'Bad URL'}, req, res);
          return;
        }
      } else if(urlTest === false && urlParams !== null) {
        callback({error: 'URL Error'}, req, res);
        return;
      }

      //Add any extra headers
      for(var h in headers) {
        req.headers[h] = headers[h];
      }

      librarian._http.forward(tURL, req, function(result, data) {
        if(result !== null) {
          if(result.error || result.erros) {
            callback(result, null, req, res);
          } else {
            callback(null, result, req, res);
          }

        } else {
          callback(null, null, req, res);
        }
      });

      return;
    } else {
      return next();
    }
  };
};

//Sets the variables in a URL based on a set of values/functions
var processURL = function(url, params, req, res) {
  var param, urlSplit = url.split(urlRegex);
  for(var p = 0; p < urlSplit.length; p++) {
    if(urlSplit[p].length > 0 && urlSplit[p].substring(0, 1) === ':') {
      param = urlSplit[p].substring(1);
      if(params.hasOwnProperty(param)) {
        if(typeof params[param] === 'function') {
          urlSplit[p] = params[param](req, res);
        } else {
          urlSplit[p] = params[param];
        }

        if(urlSplit[p] === null) {
          return null;
        }
      } else {
        return null;
      }
    }
  }

  return urlSplit.join('');
};

//-----------------------------------------------------------------------------
librarian.raw = function(url, method, data, callback) {
  if(checkInit(callback)) {
    librarian._http.request(url, method, data, callback);
  }
};

//-----------------------------------------------------------------------------
// USERS
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
librarian.user.create = function(user, callback) {
  if(checkInit(callback)) {
    librarian._http.request('/user/create', 'POST', user, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.user.update = function(user, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/user/%s?authToken=%s', user.id, authToken), 'PUT', user, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.user.get = function(userId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/user/%s?authToken=%s', userId, authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.user.getAll = function(authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/users?authToken=%s', authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.user.getCount = function(authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/users/count?authToken=%s', authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.user.authenticate = function(login, passwordHash, callback) {
  if(checkInit(callback)) {
    librarian._http.request('/user/authenticate', 'POST', { login : login, password: passwordHash }, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.user.authenticateOAuth = function(type, token, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/user/authenticate?type=%s&token=%s', type, token), 'POST', {}, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.user.createOAuthUser = function(type, token, email, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/user/create?type=%s&token=%s&email=%s', type, token, email), 'POST', {}, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.user.link = function(userId, type, authToken, token, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/user/%s/link?type=%s&authToken=%s&token=%s', userId, type, authToken, token), 'POST', {}, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.user.unlink = function(userId, type, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/user/%s/unlink?type=%s&authToken=%s', userId, type, authToken), 'POST', {}, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.user.delete = function(userId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/user/%s?authToken=%s', userId, authToken), 'DELETE', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.user.getRoles = function(userId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/user/%s/roles?authToken=%s', userId, authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.user.getRole = function(userId, projectId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/user/%s/roles/%s?authToken=%s', userId, projectId, authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.user.activity = function(userId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/user/%s/activity?authToken=%s', userId, authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.user.unlock = function(userId, betaKey, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/user/%s/unlock?authToken=%s', userId, authToken), 'POST', { key: betaKey }, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.user.resetPassword = function(email, callback) {
  if(checkInit(callback)) {
    librarian._http.request('/user/password-reset', 'POST', { email: email }, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.user.getDatabases = function(userId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/user/%s/databases?authToken=%s', userId, authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
// ADDONS
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
librarian.addOns.getById = function(id, callback) {
  if (checkInit(callback)) {
    librarian._http.request(util.format('/addons/%s', id), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.addOns.create = function(providerId, authToken, manifest, callback) {
  if (checkInit(callback)) {
    var data = {
      providerId: providerId,
      manifest: manifest,
    };

    librarian._http.request(util.format('/addon?authToken=%s', authToken), 'POST',  data, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.addOns.update = function(providerId, addOnId, authToken, manifest, callback) {
  if (checkInit(callback)) {
    librarian._http.request(
      util.format('/addon?authToken=%s', authToken), 'PUT', { providerId: providerId, addOnId: addOnId, manifest: manifest, plans: plans }, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.addOns.delete = function(providerId, authToken, addOnId, callback) {
  if (checkInit(callback)) {
    librarian._http.request(
      util.format('/addon?authToken=%s', authToken), 'DELETE', { providerId: providerId, addOnId: addOnId }, callback);
  }
};

//-----------------------------------------------------------------------------
var checkInit = function(callback) {
  if(librarian._http === null) {
    callback({ error: 'librarian API is not initialized.  Call init().' });
    return false;
  }
  return true;
};


module.exports = librarian;