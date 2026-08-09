const fs = require('fs');
const path = require('path');

const indexFile = '.vercel/output/static/_worker.js/index.js';
const chunkDir = '.vercel/output/static/_worker.js/__next-on-pages-dist__/webpack';

function patchIndex() {
  if (!fs.existsSync(indexFile)) {
    console.error('index.js does not exist!');
    process.exit(1);
  }

  let indexContent = fs.readFileSync(indexFile, 'utf8');
  const capture = [
    '// CF-PATCHED: native fetch + XMLHttpRequest capture',
    'if (typeof globalThis._cfNativeFetch === "undefined") {',
    '  globalThis._cfNativeFetch = globalThis.fetch;',
    '}',
    '',
    'if (typeof globalThis.XMLHttpRequest === "undefined") {',
    '  class CFMockXMLHttpRequest {',
    '    constructor() {',
    '      this._method = "GET";',
    '      this._url = "";',
    '      this._headers = new Headers();',
    '      this._body = null;',
    '      this.onload = null;',
    '      this.onerror = null;',
    '      this.status = 0;',
    '      this.statusText = "";',
    '      this.response = null;',
    '      this.responseText = "";',
    '      this.responseURL = "";',
    '    }',
    '',
    '    open(method, url) {',
    '      this._method = method;',
    '      this._url = url;',
    '    }',
    '',
    '    setRequestHeader(name, value) {',
    '      this._headers.set(name, value);',
    '    }',
    '',
    '    getAllResponseHeaders() {',
    '      let headersString = "";',
    '      this._headers.forEach((value, name) => {',
    '        headersString += `${name}: ${value}\r\n`;',
    '      });',
    '      return headersString;',
    '    }',
    '',
    '    send(body) {',
    '      this._body = body;',
    '      const fetchFn = globalThis._cfNativeFetch || globalThis.fetch;',
    '      fetchFn(this._url, {',
    '        method: this._method,',
    '        headers: this._headers,',
    '        body: this._body,',
    '      })',
    '        .then(async (res) => {',
    '          this.status = res.status;',
    '          this.statusText = res.statusText;',
    '          this.responseURL = res.url;',
    '          const text = await res.text();',
    '          this.responseText = text;',
    '          this.response = text;',
    '          this._headers = new Headers();',
    '          res.headers.forEach((v, k) => { this._headers.set(k, v); });',
    '          if (this.onload) this.onload();',
    '        })',
    '        .catch((err) => {',
    '          if (this.onerror) this.onerror(err);',
    '        });',
    '    }',
    '',
    '    abort() {}',
    '  }',
    '  globalThis.XMLHttpRequest = CFMockXMLHttpRequest;',
    '}',
    ''
  ].join('\n');

  if (indexContent.includes('// CF-PATCHED: native fetch + XMLHttpRequest capture')) {
    console.log('index.js already has Cloudflare runtime patch. Skipping.');
    return;
  }

  const oldCapture = [
    '// CF-PATCHED: native fetch capture',
    'if (typeof globalThis._cfNativeFetch === "undefined") {',
    '  globalThis._cfNativeFetch = globalThis.fetch;',
    '}',
    ''
  ].join('\n');

  if (indexContent.includes(oldCapture)) {
    indexContent = indexContent.replace(oldCapture, capture);
    fs.writeFileSync(indexFile, indexContent, 'utf8');
    console.log('Updated index.js with Cloudflare runtime patch.');
    return;
  }

  indexContent = capture + indexContent;
  fs.writeFileSync(indexFile, indexContent, 'utf8');
  console.log('Successfully prepended Cloudflare runtime patch to index.js!');
}

function patchLegacyChunks() {
  if (!fs.existsSync(chunkDir)) {
    console.log('No webpack chunk directory found; skipping legacy chunk patch.');
    return;
  }

  const chunks = fs.readdirSync(chunkDir).filter((f) => f.endsWith('.js'));
  let patched = false;

  for (const chunk of chunks) {
    const chunkPath = path.join(chunkDir, chunk);
    let chunkContent = fs.readFileSync(chunkPath, 'utf8');

    if (chunkContent.includes('// CF-PATCHED: XHR replaced')) {
      patched = true;
      continue;
    }

    const xhrPattern = /new XMLHttpRequest\(\)[\s\S]+?\.send\(C\._bodyInit===void 0\?null:C\._bodyInit\)\}\)\}/;
    if (!xhrPattern.test(chunkContent)) {
      continue;
    }

    const nativeImpl =
      '// CF-PATCHED: XHR replaced\n' +
      '(globalThis._cfNativeFetch||globalThis.fetch)(C.url,{method:C.method,headers:C.headers.map||{},body:C.method===\"GET\"||C.method===\"HEAD\"?undefined:C._bodyInit}).then(function(r){y(r)},function(e){w(TypeError(\"Network request failed\"))})})}';

    chunkContent = chunkContent.replace(xhrPattern, nativeImpl);
    fs.writeFileSync(chunkPath, chunkContent, 'utf8');
    console.log(`Patched XHR chunk: ${chunk}`);
    patched = true;
  }

  if (!patched) {
    console.log('No legacy XHR chunk found to patch.');
  }
}

patchIndex();
patchLegacyChunks();
