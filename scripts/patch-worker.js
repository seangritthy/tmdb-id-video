const fs = require('fs');
const file = '.vercel/output/static/_worker.js/index.js';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  
  const polyfill = `
class MockXMLHttpRequest {
  constructor() {
    this._method = 'GET';
    this._url = '';
    this._headers = new Headers();
    this._body = null;
    this.onload = null;
    this.onerror = null;
    this.status = 0;
    this.statusText = '';
    this.response = null;
    this.responseText = '';
    this.responseURL = '';
  }
  open(method, url) {
    this._method = method;
    this._url = url;
  }
  setRequestHeader(name, value) {
    this._headers.set(name, value);
  }
  getAllResponseHeaders() {
    let headersString = '';
    this._headers.forEach((v, k) => { headersString += k + ': ' + v + '\\r\\n'; });
    return headersString;
  }
  send(body) {
    this._body = body;
    fetch(this._url, {
      method: this._method,
      headers: this._headers,
      body: this._body
    }).then(async (res) => {
      this.status = res.status;
      this.statusText = res.statusText;
      this.responseURL = res.url;
      const text = await res.text();
      this.responseText = text;
      this.response = text;
      this._headers = new Headers();
      res.headers.forEach((v, k) => { this._headers.set(k, v); });
      if (this.onload) this.onload();
    }).catch((err) => {
      if (this.onerror) this.onerror(err);
    });
  }
  abort() {}
}
globalThis.XMLHttpRequest = MockXMLHttpRequest;
`;

  content = polyfill + content;
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully prepended XMLHttpRequest polyfill to index.js!');
} else {
  console.log('index.js does not exist!');
}
