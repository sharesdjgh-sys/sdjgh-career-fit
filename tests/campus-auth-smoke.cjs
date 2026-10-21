const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { spawn } = require('node:child_process');

test('direct pages load a client gate and career API accepts only platform-approved tokens', async () => {
  const approved = 'approved-token-123456789012345';
  const platform = http.createServer((request, response) => {
    let raw = '';
    request.on('data', chunk => { raw += chunk; });
    request.on('end', () => {
      const body = JSON.parse(raw);
      response.setHeader('Content-Type', 'application/json');
      response.statusCode = body.appId === 'career' && body.token === approved ? 200 : 403;
      response.end(response.statusCode === 200 ? JSON.stringify({ valid: true, user: { userId: 'test-student', role: '학생' } }) : '{}');
    });
  });
  await new Promise(resolve => platform.listen(0, '127.0.0.1', resolve));
  const platformPort = platform.address().port;
  const appPort = 31097;
  const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'start', '-p', String(appPort)], {
    cwd: process.cwd(),
    env: { ...process.env, PLATFORM_VERIFY_URL: `http://127.0.0.1:${platformPort}/verify` },
    stdio: 'ignore',
  });
  const base = `http://127.0.0.1:${appPort}`;
  try {
    let ready = false;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      try { await fetch(base + '/api/auth/session'); ready = true; break; }
      catch { await new Promise(resolve => setTimeout(resolve, 250)); }
    }
    assert.equal(ready, true, 'Next server started');
    const direct = await fetch(base + '/', { headers: { Accept: 'text/html' }, redirect: 'manual' });
    assert.equal(direct.status, 200);
    const frame = await fetch(base + '/', { headers: { Accept: 'text/html', 'Sec-Fetch-Dest': 'iframe' }, redirect: 'manual' });
    assert.equal(frame.status, 200);
    const session = token => fetch(base + '/api/auth/session', { headers: { Authorization: `Bearer ${token}` } });
    assert.equal((await session('denied-token-123456789012345')).status, 401);
    assert.equal((await session(approved)).status, 200);
    assert.equal((await fetch(base + '/api/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 401);
    assert.equal((await fetch(base + '/api/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${approved}` }, body: '{}' })).status, 400);
  } finally {
    child.kill();
    await new Promise(resolve => platform.close(resolve));
  }
});
