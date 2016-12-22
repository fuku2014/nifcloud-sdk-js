var fs       = require('fs');
var path     = require('path');
var NIFCLOUD = require('./core');
var apis     = require('./api_loader');

// define services using map
apis.services.forEach(function(identifier) {
  var name     = apis.serviceName(identifier);
  var versions = apis.serviceVersions(identifier);
  NIFCLOUD[name]  = NIFCLOUD.Service.defineService(identifier, versions);

  // load any customizations from lib/services/<svcidentifier>.js
  var svcFile = path.join(__dirname, 'services', identifier + '.js');
  if (fs.existsSync(svcFile)) require('./services/' + identifier);
});
