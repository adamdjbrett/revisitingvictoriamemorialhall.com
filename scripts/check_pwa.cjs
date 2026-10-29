const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');

(async () => {
  const handlers = {};
  const stored = new Map([['/', new Response('offline homepage')]]);
  const deleted = [];
  let installed;
  let failWrites = false;
  const cache = {
    addAll: async assets => { installed = assets; },
    put: async (path, response) => {
      if (failWrites) throw new Error('Storage full');
      stored.set(path, response);
    }
  };
  const context = vm.createContext({
    URL, Response, Set,
    self: {
      location: { origin: 'https://example.com' },
      addEventListener: (name, handler) => { handlers[name] = handler; },
      skipWaiting: async () => {}, clients: { claim: async () => {} }
    },
    caches: {
      open: async () => cache,
      keys: async () => ['vmh-old', 'unrelated-app', vm.runInContext('VERSION', context)],
      delete: async key => { deleted.push(key); },
      match: async path => stored.get(path)
    },
    fetch: async () => new Response('fresh homepage')
  });
  vm.runInContext(readFileSync('_site/sw.js', 'utf8'), context);
  let pending;
  handlers.install({ waitUntil: promise => { pending = promise; } });
  await pending;
  assert(installed.includes('/') && installed.some(path => /\/assets\/[a-f0-9]{12}\/pwa.js$/.test(path)));
  for (const path of installed) readFileSync(`_site${path === '/' ? '/index.html' : path}`);
  handlers.activate({ waitUntil: promise => { pending = promise; } });
  await pending;
  assert.deepEqual(deleted, ['vmh-old']);

  async function request(url, method = 'GET') {
    let result;
    const writes = [];
    handlers.fetch({ request: { url, method }, respondWith: promise => { result = promise; }, waitUntil: promise => writes.push(promise) });
    const response = await result;
    await Promise.all(writes);
    return response;
  }
  assert.equal(await (await request('https://example.com/')).text(), 'fresh homepage');
  failWrites = true;
  assert.equal(await (await request('https://example.com/')).text(), 'fresh homepage');
  context.fetch = async () => { throw new Error('Offline'); };
  assert.equal(await (await request('https://example.com/index.html')).text(), 'fresh homepage');
  assert.equal(await request('https://other.example/'), undefined);
  assert.equal(await request('https://example.com/private'), undefined);
  assert.equal(await request('https://example.com/', 'POST'), undefined);
  context.fetch = async () => new Response('Not found', { status: 404 });
  assert.equal((await request('https://example.com/')).status, 404);
  console.log('PASS: PWA install, cache cleanup, online/offline responses, storage failure, and request boundaries.');
})().catch(error => { console.error(error); process.exitCode = 1; });
