const { gzipSync } = require('node:zlib');

module.exports = function (req, res, next) {
  res.setHeader('Cache-Control', 'no-cache');
  const acceptsGzip = String(req.headers['accept-encoding'] || '').toLowerCase().split(',').some(value => {
    const [name, ...parameters] = value.trim().split(';');
    return name === 'gzip' && !parameters.some(parameter => /^q=0(?:\.0*)?$/.test(parameter.trim()));
  });
  const end = res.end;
  res.end = function (body, encoding, callback) {
    if (!this.headersSent && this.statusCode === 200 && /^\/assets\/[a-f0-9]{12}\//.test(req.url)) {
      this.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    const type = String(this.getHeader('Content-Type') || '');
    if (!this.headersSent && this.statusCode === 200 && body && !this.getHeader('Content-Encoding') &&
        /^(text\/|application\/(javascript|json|xml|manifest\+json)|image\/svg\+xml)/.test(type)) {
      const bytes = Buffer.isBuffer(body) ? body : Buffer.from(body, typeof encoding === 'string' ? encoding : 'utf8');
      if (bytes.length > 256) {
        this.setHeader('Vary', [this.getHeader('Vary'), 'Accept-Encoding'].filter(Boolean).join(', '));
        if (acceptsGzip) {
          body = gzipSync(bytes);
          this.setHeader('Content-Encoding', 'gzip');
          this.setHeader('Content-Length', body.length);
        }
      }
    }
    return end.call(this, body, encoding, callback);
  };
  next();
};
