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
  console.log('Initializing librarian for %s:%s', host, port);
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
// BILLING
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
librarian.billing.get = function(userId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/billing/%s?authToken=%s', userId, authToken), 'GET', callback);
  }
};

librarian.billing.getUser = function(userId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/billing/user/%s?authToken=%s', userId, authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.billing.updateUser = function(userId, user, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/billing/user/%s?authToken=%s', userId, authToken), 'PUT', user, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.billing.getInvoices = function(userId, months, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/billing/user/%s/invoices?months=%s&authToken=%s',
      userId, months, authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.billing.updateInvoice = function(invoiceId, invoice, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/billing/invoice/%s?authToken=%s',
      invoiceId, authToken), 'PUT', invoice, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.billing.getInvoice = function(invoiceId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/billing/invoice/%s?authToken=%s', invoiceId, authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.billing.getAllUsers = function(authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/billing/users?authToken=%s', authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.billing.create = function(userId, data, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/billing/%s?authToken=%s', userId, authToken), 'POST', data, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.billing.update = function(userId, data, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/billing/%s?authToken=%s', userId, authToken), 'PUT', data, callback);
  }
};

librarian.billing.delete = function(userId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/billing/%s?authToken=%s', userId, authToken), 'DELETE', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.usage.current = function(userId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/usage/%s/current?authToken=%s', userId, authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.billing.createInvoice = function(invoice, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/invoice/create?authToken=%s', authToken), 'POST', invoice, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.billing.getUnpaidInvoices = function(authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/invoice/unpaid?authToken=%s', authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
// ADDONS
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
librarian.addOns.getAll = function(callback) {
  if (checkInit(callback)) {
    librarian._http.request('/addons', 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.addOns.getById = function(id, callback) {
  if (checkInit(callback)) {
    librarian._http.request(util.format('/addons/%s', id), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.addOns.getByProject = function(projectId, authToken, callback) {
  if (checkInit(callback)) {
    librarian._http.request(util.format('/addons/project/%d?authToken=%s', projectId, authToken), 'GET', callback);
  }
}

//-----------------------------------------------------------------------------
librarian.addOns.getProviderAddOns = function(providerId, authToken, callback) {
  if (checkInit(callback)) {
    librarian._http.request(util.format('/vendor/apps/%d?authToken=%s', providerId, authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.addOns.getConfigVars = function(projectId, authToken, callback) {
  if (checkInit(callback)) {
    librarian._http(util.format('/addon/config-vars/%d?authToken=%s', projectId, authToken), 'GET', callback);
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
librarian.addOns.provision = function(userId, authToken, addOnId, plan, projectId, options, callback) {
  if (checkInit(callback)) {
    var url = util.format('/addon/provision/%s?authToken=%s&addonid=%s&plan=%s&projectid=%s',
      userId,
      authToken,
      addOnId,
      plan,
      projectId);

    librarian._http.request(url, 'POST', options, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.addOns.deprovision = function(projectId, authToken, modulusId, callback) {
  if (checkInit(callback)) {
    var url = util.format('/addon/deprovision/%d?authToken=%s&modulusid=%s',
       projectId,
       authToken,
       modulusId);

    librarian._http.request(url, 'POST', {}, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.addOns.providerOptIn = function(userId, callback) {
  if (checkInit(callback)) {
    librarian._http.request('/provider/' + userId + '/opt-in', 'POST', {}, callback);
  }
}

//-----------------------------------------------------------------------------
// PROMO CODES
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
librarian.promo.redeem = function(code, userId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/promo/%s/redeem/%s?authToken=%s', code, userId, authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
// PROJECTS
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
librarian.project.create = function(project, isShallow, authToken, callback) {
  if(checkInit(callback)) {
    if(_.isFunction(isShallow)) {
      callback = isShallow;
      isShallow = false;
    }
    librarian._http.request(
      util.format('/project/create?isShallow=%s&authToken=%s', isShallow, authToken), 'POST', project, callback);
  }
};

/**
 * Finds projects based on filter criteria.
 * @static
 * @param {object} filter An object with one property - either
 * userId or projectId.  The value of the property is the search value.
 * If projectId is specified the result will be a single project object or null
 * if the project wasn't found.  If userId is specified the result will be an
 * array of project objects or an empty array if none were found.
 * @param {function} callback
 */
 //-----------------------------------------------------------------------------
librarian.project.find = function(filter, authToken, callback) {
  if(checkInit(callback)) {
    if(typeof filter.userId !== 'undefined') {
      // Find all projects based on user.
      librarian._http.request(util.format('/user/%s/projects?authToken=%s', filter.userId, authToken), 'GET', callback);
    }
    else if(typeof filter.projectId !== 'undefined') {
      // Find the project with the specified id.
      librarian._http.request(util.format('/project/%s?authToken=%s', filter.projectId, authToken), 'GET', callback);
    }
  }
};

//-----------------------------------------------------------------------------
librarian.project.getAll = function(authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/projects?authToken=%s', authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.project.getCount = function(authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/projects/count?authToken=%s', authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.project.update = function(project, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/project/%s?authToken=%s', project.id, authToken), 'PUT', project, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.project.getFiles = function(projectId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/project/%s/files?authToken=%s', projectId, authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.project.getLog = function(projectId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/project/%s/logs?authToken=%s', projectId, authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.project.getDeployLogs = function(projectId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/project/%s/deploy-logs?authToken=%s', projectId, authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.project.saveDeployLogs = function(projectId, authToken, logs, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/project/%s/deploy-logs?authToken=%s', projectId, authToken), 'POST', logs, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.project.uploadProgress = function(projectId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/project/%s/upload-progress?authToken=%s', projectId, authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.project.saveVars = function(projectId, vars, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/project/%s/env-vars?authToken=%s', projectId, authToken), 'POST', vars, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.project.saveDomains = function(projectId, domains, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/project/%s/domains?authToken=%s', projectId, authToken), 'POST', domains, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.project.delete = function(projectId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/project/%s?authToken=%s', projectId, authToken), 'DELETE', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.project.stop = function(projectId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/project/%s/stop?authToken=%s', projectId, authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.project.restart = function(projectId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/project/%s/restart?authToken=%s', projectId, authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.project.start = function(projectId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/project/%s/start?authToken=%s', projectId, authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.project.scale = function(projectId, instances, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/project/%s/scale?authToken=%s', projectId, authToken), 'POST', instances, callback);
  }
};

//-----------------------------------------------------------------------------
// HOSTS
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
librarian.host.get = function(hostId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/host/%s?authToken=%s', hostId, authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.host.getAll = function(authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/hosts?authToken=%s', authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.host.getAvailable = function(authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/available-host?authToken=%s', authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.host.create = function(host, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/host/create?authToken=%s', authToken), host, 'POST', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.host.update = function(host, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/host/%s?authToken=%s', host.id, authToken), 'PUT', host, callback);
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

//-----------------------------------------------------------------------------
// SERVOS
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
librarian.servo.get = function(servoId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/servo/%s?authToken=%s', servoId, authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.servo.getAll = function(authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/servos?authToken=%s', authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.servo.create = function(servo, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/servo/create?authToken=%s', authToken), 'POST', servo, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.servo.update = function(servo, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/servo/%s?authToken=%s', servo.id, authToken), 'PUT', servo, callback);
  }
};

//-----------------------------------------------------------------------------
// ACTIVITY
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
librarian.activity.create = function(activity, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/activity/create?authToken=%s', authToken), 'POST', activity, callback);
  }
};

//-----------------------------------------------------------------------------
// CONTACT
//-----------------------------------------------------------------------------

/**
 * Sends a email to Modulus support.
 * @static
 * @param {object} form Form object { email: 'test@example.com', message: 'Something' }
 * @param {function} callback
 */
//-----------------------------------------------------------------------------
librarian.contact = function(form, callback) {
  if(checkInit(callback)) {
    librarian._http.request('/contact', 'POST', form, callback);
  }
};

//-----------------------------------------------------------------------------
// STATS
//-----------------------------------------------------------------------------

/**
 * Gets stat data.
 * @static
 * @param {string} name The name of the stat to retrieve.
 * e.g. atlas_response_global
 * @param {string} type The type of aggregation ('average' or 'sum')
 * @param {int} resolution The number of seconds to group data by
 * @param {int} duration The number of seconds into the past to retrieve data
 * @param {function} callback
 */
//-----------------------------------------------------------------------------
librarian.stats.get = function(name, type, resolution, duration, authToken, callback) {
  if(checkInit(callback)) {
    var url = util.format('/stats?name=%s&type=%s&resolution=%s&duration=%s&authToken=%s',
      name, type, resolution, duration, authToken);

    librarian._http.request(url, 'GET', callback);
  }
};

/**
 * Gets route stat data.
 * @static
 * @param {string} type The type of aggregation ('average' or 'sum')
 * e.g. atlas_response_global
 * @param {string} sort How the data should be sorted. Possible values are
 * 'count', 'average', 'bandwidth', or 'value'.
 * @param {int} duration The number of seconds into the past to retrieve data
 * @param {int} limit The number of unique routes to retrieve.
 * @param {function} callback
 */
//-----------------------------------------------------------------------------
librarian.stats.routes = function(type, sort, duration, limit, authToken, callback) {
  if(checkInit(callback)) {
    var url = util.format('/stats/routes?type=%s&sort=%s&duration=%s&limit=%s&authToken=%s',
      type, sort, duration, limit, authToken);
    librarian._http.request(url, 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
// DATABASE
//-----------------------------------------------------------------------------

/**
 * Creates a new database.
 * @param {object} db The database to create. Object should contain
 * a name and an optional array of users. User object should contain
 * username and password properties.
 * @param {function} callback
 */
 //-----------------------------------------------------------------------------
librarian.database.create = function(db, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/db/create?authToken=%s', authToken), 'POST', db, callback);
  }
};

 //-----------------------------------------------------------------------------
librarian.database.get = function(dbId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/db/%s?authToken=%s', dbId, authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.database.delete = function(id, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/db/%s?authToken=%s', id, authToken), 'DELETE', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.database.getAll = function(authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/dbs?authToken=%s', authToken), 'GET', callback);
  }
};

/**
 * Create a user in the specified database.
 * @param {string} dbId The database id.
 * @param {object} user The new user. Required to have username and password
 * fields.
 * @param {function} callback Returns the newly created user.
 */
//-----------------------------------------------------------------------------
librarian.database.createUser = function(dbId, user, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/db/%s/user/create?authToken=%s', dbId, authToken), 'POST', user, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.database.deleteUser = function(dbId, uId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/db/%s/user/%s?authToken=%s', dbId, encodeURIComponent(uId), authToken), 'DELETE', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.database.updateUser = function(dbId, uId, user, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/db/%s/user/%s?authToken=%s', dbId, encodeURIComponent(uId), authToken), 'PUT', user, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.database.update = function(dbId, db, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/db/%s?authToken=%s', dbId, authToken), 'PUT', db, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.database.collections = function(dbId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/db/%s/collections?authToken=%s', dbId, authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.database.exportCollections = function(dbId, username, password, collections, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/db/%s/export?authToken=%s', dbId, authToken), 'POST',
      { username: username, password: password, collections: collections }, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.database.exportStatus = function(statusKey, callback) {
  if(checkInit(callback)) {
    librarian._http.request('/db/export-status?key=' + statusKey, 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
// SSL
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
librarian.ssl.getAll = function(authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/ssls?authToken=%s', authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.ssl.getForProject = function(projectId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/project/%s/ssl?authToken=%s', projectId, authToken), 'GET', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.ssl.create = function(cert, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/project/%s/ssl/create?authToken=%s', cert.projectId, authToken), 'POST', cert, callback);
  }
};

//-----------------------------------------------------------------------------
librarian.ssl.delete = function(sslId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/ssl/%s?authToken=%s', sslId, authToken), 'DELETE', callback);
  }
};

//-----------------------------------------------------------------------------
librarian.ssl.get = function(sslId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/ssl/%s?authToken=%s', sslId, authToken), 'GET', callback);
  }
};


//-----------------------------------------------------------------------------
// DEPLOY LOGS
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
librarian.deployLogs.getCount = function(authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/deploy-logs/count?authToken=%s', authToken), 'GET', callback);
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

//-----------------------------------------------------------------------------
// WEBHOOKS
//-----------------------------------------------------------------------------
librarian.hook.get = function(source, sourceId, type, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/hook?source=%s&sourceId=%s&type=%s&authToken=%s', source, sourceId, type, authToken), 'GET', callback);
  }
};


librarian.hook.create = function(hook, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/hook?authToken=%s', authToken), 'POST', hook, callback);
  }
};

librarian.hook.update = function(hookId, hook, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/hook/%s?authToken=%s', hookId, authToken), 'PUT', hook, callback);
  }
};

librarian.hook.delete = function(hookId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/hook/%s?authToken=%s', hookId, authToken), 'DELETE', callback);
  }
};

librarian.hook.test = function(source, sourceId, authToken, callback) {
  if(checkInit(callback)) {
    librarian._http.request(util.format('/hook/test?authToken=%s', authToken), 'POST', {source:source,sourceId:sourceId}, callback);
  }
};


module.exports = librarian;