// Polyfill XMLHttpRequest for Cloudflare Workers / Edge runtime where it is not defined
// but some compiled packages (like whatwg-fetch bundled in edge primitives) expect it.

class MockXMLHttpRequest {
  _method: string = 'GET';
  _url: string = '';
  _headers: Headers = new Headers();
  _body: any = null;
  onload: (() => void) | null = null;
  onerror: ((err: any) => void) | null = null;
  ontimeout: (() => void) | null = null;
  status: number = 0;
  statusText: string = '';
  response: any = null;
  responseText: string = '';
  responseURL: string = '';

  open(method: string, url: string) {
    this._method = method;
    this._url = url;
  }

  setRequestHeader(name: string, value: string) {
    this._headers.set(name, value);
  }

  getAllResponseHeaders() {
    let headersString = '';
    this._headers.forEach((value, name) => {
      headersString += `${name}: ${value}\r\n`;
    });
    return headersString;
  }

  send(body: any) {
    this._body = body;
    // Execute fetch asynchronously using native global fetch
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

      // Copy response headers
      this._headers = new Headers();
      res.headers.forEach((v, k) => {
        this._headers.set(k, v);
      });

      if (this.onload) this.onload();
    }).catch((err) => {
      if (this.onerror) this.onerror(err);
    });
  }

  abort() {}
}

export function initPolyfill() {
  if (typeof (globalThis as any)['XMLHttpRequest'] === 'undefined') {
    (globalThis as any)['XMLHttpRequest'] = MockXMLHttpRequest;
  }
}

// Call on module load too
initPolyfill();
