var NIFCLOUD = require('./core');

// Load browser API loader
NIFCLOUD.apiLoader = function(svc, version) {
  return NIFCLOUD.apiLoader.services[svc][version];
};

/**
 * @api private
 */
NIFCLOUD.apiLoader.services = {};

// Load the DOMParser XML parser
NIFCLOUD.XML.Parser = require('./xml/browser_parser');

// Load the XHR HttpClient
require('./http/xhr');

if (typeof window !== 'undefined') window.NIFCLOUD = NIFCLOUD;
if (typeof module !== 'undefined') module.exports  = NIFCLOUD;
