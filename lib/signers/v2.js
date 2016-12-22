var NIFCLOUD = require('../core');
var inherit  = NIFCLOUD.util.inherit;

/**
 * @api private
 */
NIFCLOUD.Signers.V2 = inherit(NIFCLOUD.Signers.RequestSigner, {
  addAuthorization: function addAuthorization(credentials, date) {

    if (!date) date = NIFCLOUD.util.date.getDate();

    var r = this.request;

    r.params.Timestamp        = NIFCLOUD.util.date.iso8601(date);
    r.params.SignatureVersion = '2';
    r.params.SignatureMethod  = 'HmacSHA256';
    r.params.AccessKeyId      = credentials.accessKeyId;

    if (credentials.sessionToken) {
      r.params.SecurityToken = credentials.sessionToken;
    }

    delete r.params.Signature; // delete old Signature for re-signing
    r.params.Signature = this.signature(credentials);

    r.body = NIFCLOUD.util.queryParamsToString(r.params);
    r.headers['Content-Length'] = r.body.length;
  },

  signature: function signature(credentials) {
    return NIFCLOUD.util.crypto.hmac(credentials.secretAccessKey, this.stringToSign(), 'base64');
  },

  stringToSign: function stringToSign() {
    var parts = [];
    parts.push(this.request.method);
    parts.push(this.request.endpoint.host.toLowerCase());
    parts.push(this.request.pathname());
    parts.push(NIFCLOUD.util.queryParamsToString(this.request.params));
    return parts.join('\n');
  }

});

module.exports = NIFCLOUD.Signers.V2;
