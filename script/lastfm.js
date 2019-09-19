const crypto = require('crypto');
const got = require('got');
const API_ROOT = 'https://ws.audioscrobbler.com/2.0/';
const AUTH_URL = 'https://www.last.fm/api/auth/';

class LastFm {

  constructor(key, secret) {
    Object.defineProperty(this, 'key', { value: key });
    Object.defineProperty(this, 'secret', { value: secret });
  }

  sign(method, params = {}) {
    const allParams = Object.assign({}, params, { method: method });
    const concatinated = Object.keys(allParams).sort().map(key => {
      return key + allParams[key];
    }).join('') + this.secret;

    return crypto.createHash('md5').update(concatinated).digest("hex");
  }

  get(method, params = {}) {
    let allParams = Object.assign({}, params, { method: method, api_key: this.key, format: 'json' })
    return got(API_ROOT, { query: allParams, json: true }).then(response => response.body);
  }

  getSigned(method, params = {}) {
    let allParams = Object.assign({}, params, { method: method, api_key: this.key })
    // Sign the request
    Object.assign(allParams, { api_sig: this.sign(method, allParams), format: 'json' });
    return got(API_ROOT, { query: allParams, json: true }).then(response => response.body);
  }

  getAuthed(session, method, params = {}) {
    return this.getSigned(method, Object.assign({}, params, { sk: session }))
  }

  post(session, method, params = {}) {
    let allParams = Object.assign({}, params, { method: method, api_key: this.key, sk: session })
    // Sign the request
    Object.assign(allParams, { api_sig: this.sign(method, allParams), format: 'json' });
    return got.post(API_ROOT, { query: allParams, json: true }).then(response => response.body);
  }

  authToken() {
    return this.getSigned('auth.getToken').then(result => {
      return result.token;
    }).catch(error => {
      console.log(error)
    });
  }

  authUrl(token) {
    return `${AUTH_URL}?api_key=${this.key}&token=${token}`;
  }

}

module.exports = LastFm;
