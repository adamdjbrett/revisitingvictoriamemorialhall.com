const assert = require('node:assert/strict');
const { gunzipSync } = require('node:zlib');
const middleware = require('./http.cjs');
const text = 'A compressible HTML response. '.repeat(100);

function respond({ url = '/', accept = 'gzip', type = 'text/html', status = 200, body = text, method = 'GET' } = {}) {
  const headers = { 'Content-Type': type };
  const response = {
    statusCode: status,
    getHeader: key => headers[key],
    setHeader: (key, value) => { headers[key] = value; },
    end: data => { response.body = data; }
  };
  middleware({ url, method, headers: { 'accept-encoding': accept } }, response, () => response.end(body));
  return { headers, body: response.body };
}

const compressed = respond();
assert.equal(compressed.headers['Content-Encoding'], 'gzip');
assert.equal(gunzipSync(compressed.body).toString(), text);
assert.equal(compressed.headers['Content-Length'], compressed.body.length);
assert.equal(compressed.headers.Vary, 'Accept-Encoding');
assert.equal(compressed.headers['Cache-Control'], 'no-cache');
for (const accept of ['identity', 'gzip;q=0', 'br, gzip;q=0.00', '']) {
  const plain = respond({ accept });
  assert.equal(plain.headers['Content-Encoding'], undefined);
  assert.equal(plain.body, text);
}
assert.equal(respond({ accept: 'br, gzip;q=0.5' }).headers['Content-Encoding'], 'gzip');
assert.equal(respond({ type: 'image/webp' }).headers['Content-Encoding'], undefined);
assert.equal(respond({ status: 404 }).headers['Content-Encoding'], undefined);
assert.equal(respond({ body: '' }).headers['Content-Encoding'], undefined);
assert.equal(respond({ url: '/assets/012345abcdef/css/style.css' }).headers['Cache-Control'], 'public, max-age=31536000, immutable');
assert.equal(respond({ url: '/sw.js' }).headers['Cache-Control'], 'no-cache');
assert.equal(respond({ url: '/assets/012345abcdef/missing.css', status: 404 }).headers['Cache-Control'], 'no-cache');
console.log('PASS: gzip negotiation, lossless compression, Vary, immutable versioned assets, and update-safe HTML/worker headers.');
