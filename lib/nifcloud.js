var NIFCLOUD   = require('./core');
module.exports = NIFCLOUD;

// Use default API loader function
NIFCLOUD.apiLoader = require('./api_loader').load;

// Load the xml2js XML parser
NIFCLOUD.XML.Parser = require('./xml/node_parser');

// Load Node HTTP client
require('./http/node');

// Load all service classes
require('./services');

// Load custom credential providers
require('./credentials/environment_credentials');

// Setup default chain providers
NIFCLOUD.CredentialProviderChain.defaultProviders = [
  function () { return new NIFCLOUD.EnvironmentCredentials('NIFCLOUD'); },
];

// Update configuration keys
NIFCLOUD.util.update(NIFCLOUD.Config.prototype.keys, {
  credentials: function () {
    var credentials = null;
    new NIFCLOUD.CredentialProviderChain([
      function () { return new NIFCLOUD.EnvironmentCredentials('NIFCLOUD'); },
    ]).resolve(function(err, creds) {
      if (!err) credentials = creds;
    });
    return credentials;
  },
  credentialProvider: function() {
    return new NIFCLOUD.CredentialProviderChain();
  },
  region: function() {
    return process.env.NIFCLOUD_REGION || process.env.AMAZON_REGION;
  }
});

// Reset configuration
NIFCLOUD.config = new NIFCLOUD.Config();
