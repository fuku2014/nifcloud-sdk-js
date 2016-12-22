var NIFCLOUD = require('../core');
var inherit  = NIFCLOUD.util.inherit;

require('./v3');

/**
 * @api private
 */
NIFCLOUD.Signers.V3Https = inherit(NIFCLOUD.Signers.V3, {
  authorization: function authorization(credentials) {
    return 'AWS3-HTTPS ' +
      'AWSAccessKeyId=' + credentials.accessKeyId + ',' +
      'Algorithm=HmacSHA256,' +
      'Signature=' + this.signature(credentials);
  },

  stringToSign: function stringToSign() {
    return this.request.headers['X-Amz-Date'];
  }
});

module.exports = NIFCLOUD.Signers.V3Https;
