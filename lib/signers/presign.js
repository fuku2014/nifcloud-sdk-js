var NIFCLOUD = require('../core');
var inherit  = NIFCLOUD.util.inherit;

/**
 * @api private
 */
var expiresHeader = 'presigned-expires';

/**
 * @api private
 */
function signedUrlBuilder(request) {
  var expires = request.httpRequest.headers[expiresHeader];

  delete request.httpRequest.headers['User-Agent'];
  delete request.httpRequest.headers['X-Amz-User-Agent'];

  if (request.service.getSignerClass() === NIFCLOUD.Signers.V4) {
    if (expires > 604800) { // one week expiry is invalid
      var message = 'Presigning does not support expiry time greater ' +
                    'than a week with SigV4 signing.';
      throw NIFCLOUD.util.error(new Error(), {
        code: 'InvalidExpiryTime', message: message, retryable: false
      });
    }
    request.httpRequest.headers[expiresHeader] = expires;
  } else if (request.service.getSignerClass() === NIFCLOUD.Signers.S3Aws ||
      request.service.getSignerClass() === NIFCLOUD.Signers.S3Nifcloud) {
    request.httpRequest.headers[expiresHeader] = parseInt(
      NIFCLOUD.util.date.unixTimestamp() + expires, 10).toString();
  } else {
    throw NIFCLOUD.util.error(new Error(), {
      message: 'Presigning only supports S3 or SigV4 signing.',
      code: 'UnsupportedSigner', retryable: false
    });
  }
}

/**
 * @api private
 */
function signedUrlSigner(request) {
  var endpoint = request.httpRequest.endpoint;
  var parsedUrl = NIFCLOUD.util.urlParse(request.httpRequest.path);
  var queryParams = {};

  if (parsedUrl.search) {
    queryParams = NIFCLOUD.util.queryStringParse(parsedUrl.search.substr(1));
  }

  NIFCLOUD.util.each(request.httpRequest.headers, function (key, value) {
    if (key === expiresHeader) key = 'Expires';
    queryParams[key] = value;
  });
  delete request.httpRequest.headers[expiresHeader];

  var auth = queryParams['Authorization'].split(' ');
  if (auth[0] === 'AWS') {
    auth = auth[1].split(':');
    queryParams['AWSAccessKeyId'] = auth[0];
    queryParams['Signature'] = auth[1];
  } else if (auth[0] === 'AWS4-HMAC-SHA256') { // SigV4 signing
    auth.shift();
    var rest = auth.join(' ');
    var signature = rest.match(/Signature=(.*?)(?:,|\s|\r?\n|$)/)[1];
    queryParams['X-Amz-Signature'] = signature;
    delete queryParams['Expires'];
  }
  delete queryParams['Authorization'];
  delete queryParams['Host'];

  // build URL
  endpoint.pathname = parsedUrl.pathname;
  endpoint.search = NIFCLOUD.util.queryParamsToString(queryParams);
}

/**
 * @api private
 */
NIFCLOUD.Signers.Presign = inherit({
  /**
   * @api private
   */
  sign: function sign(request, expireTime, callback) {
    request.httpRequest.headers[expiresHeader] = expireTime || 3600;
    request.on('build', signedUrlBuilder);
    request.on('sign', signedUrlSigner);
    request.removeListener('afterBuild',
      NIFCLOUD.EventListeners.Core.SET_CONTENT_LENGTH);
    request.removeListener('afterBuild',
      NIFCLOUD.EventListeners.Core.COMPUTE_SHA256);

    request.emit('beforePresign', [request]);

    if (callback) {
      request.build(function() {
        if (this.response.error) callback(this.response.error);
        else {
          callback(null, NIFCLOUD.util.urlFormat(request.httpRequest.endpoint));
        }
      });
    } else {
      request.build();
      if (request.response.error) throw request.response.error;
      return NIFCLOUD.util.urlFormat(request.httpRequest.endpoint);
    }
  }
});

module.exports = NIFCLOUD.Signers.Presign;
