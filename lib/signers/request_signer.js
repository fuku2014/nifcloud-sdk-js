var NIFCLOUD   = require('../core');
var inherit = NIFCLOUD.util.inherit;

/**
 * @api private
 */
NIFCLOUD.Signers.RequestSigner = inherit({
  constructor: function RequestSigner(request) {
    this.request = request;
  }
});

NIFCLOUD.Signers.RequestSigner.getVersion = function getVersion(version) {
  switch (version) {
    case 'v2':         return NIFCLOUD.Signers.V2;
    case 'v3':         return NIFCLOUD.Signers.V3;
    case 'v4':         return NIFCLOUD.Signers.V4;
    case 's3aws':      return NIFCLOUD.Signers.S3Aws;
    case 's3nifcloud': return NIFCLOUD.Signers.S3Nifcloud;
    case 'v3https':    return NIFCLOUD.Signers.V3Https;
  }
  throw new Error('Unknown signing version ' + version);
};

require('./v2');
require('./v3');
require('./v3https');
require('./v4');
require('./s3aws');
require('./s3nifcloud');
require('./presign');
