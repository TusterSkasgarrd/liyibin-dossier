/**
 * 工程档案 · 后端服务（零依赖，只用 Node 内置 http/fs/path）
 *
 * 提供：
 *   GET    /api/:key         读集合（profile | skills | projects | notes | timeline | stats）
 *   PUT    /api/:key         整块替换集合
 *   POST   /api/:key         追加一条（仅数组）
 *   DELETE /api/:key/:index  删除数组第 index 项
 *   GET    /*                静态文件（dist/），SPA 回退到 index.html
 *
 * 数据层：server/db.json（原子写）。换 SQLite/Postgres 时只需替换 readDb/writeDb。
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3001;
const ROOT = __dirname;
const DIST = path.join(ROOT, '..', 'www'); // 平台会排除 dist/，故构建输出到 www/
const DB = path.join(ROOT, 'db.json');

const KEYS = new Set(['profile', 'skills', 'projects', 'notes', 'timeline', 'stats', 'skillGroupLabel']);
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8',
};

/* ---------------- 数据层（换成数据库时只动这里） ---------------- */
function readDb() {
  try {
    return JSON.parse(fs.readFileSync(DB, 'utf8'));
  } catch {
    return {};
  }
}

function writeDb(data) {
  const tmp = DB + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, DB); // 原子替换，避免写一半
}

/* ---------------- 工具 ---------------- */
function send(res, status, body, type = 'application/json; charset=utf-8') {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 5 * 1024 * 1024) req.destroy(); // 5MB 上限
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || 'null'));
      } catch {
        resolve(null);
      }
    });
  });
}

function serveStatic(res, urlPath) {
  const safe = path.normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  let file = path.join(DIST, safe === '/' ? 'index.html' : safe);

  // 目录 → index.html；SPA 未知路由 → index.html
  if (!file.startsWith(DIST)) {
    return send(res, 403, { error: 'forbidden' });
  }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    file = path.join(DIST, 'index.html');
  }
  if (!fs.existsSync(file)) {
    return send(res, 404, 'dist/index.html 不存在，请先 npm run build', 'text/plain; charset=utf-8');
  }

  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
  });
  fs.createReadStream(file).pipe(res);
}

/* ---------------- 路由 ---------------- */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const p = url.pathname;

  // 健康检查（给部署平台探活用）
  if (p === '/healthz') return send(res, 200, { ok: true, uptime: process.uptime() });

  if (!p.startsWith('/api/')) return serveStatic(res, p);

  const parts = p.split('/').filter(Boolean); // ['api', key, index?]
  const key = parts[1];
  const idx = parts[2];

  if (!KEYS.has(key)) return send(res, 404, { error: `unknown collection: ${key}` });

  const db = readDb();

  if (req.method === 'GET') {
    return send(res, 200, db[key] ?? (Array.isArray(db[key]) ? [] : null));
  }

  if (req.method === 'PUT') {
    const body = await readBody(req);
    if (body === null) return send(res, 400, { error: 'invalid json' });
    db[key] = body;
    writeDb(db);
    return send(res, 200, { ok: true, key, count: Array.isArray(body) ? body.length : 1 });
  }

  if (req.method === 'POST') {
    const body = await readBody(req);
    if (!Array.isArray(db[key])) return send(res, 400, { error: `${key} 不是数组` });
    db[key].push(body);
    writeDb(db);
    return send(res, 201, { ok: true, key, count: db[key].length });
  }

  if (req.method === 'DELETE' && idx !== undefined) {
    const i = Number(idx);
    if (!Array.isArray(db[key])) return send(res, 400, { error: `${key} 不是数组` });
    if (Number.isNaN(i) || i < 0 || i >= db[key].length) return send(res, 404, { error: 'index out of range' });
    db[key].splice(i, 1);
    writeDb(db);
    return send(res, 200, { ok: true, key, count: db[key].length });
  }

  return send(res, 405, { error: 'method not allowed' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] listening on http://0.0.0.0:${PORT}`);
  console.log(`[server] static: ${DIST}`);
  console.log(`[server] db:     ${DB}`);
});
