/**
 * 工程档案 · 后端服务（零依赖，只用 Node 内置 http/fs/path/crypto）
 *
 * 提供：
 *   GET    /api/:key         读集合（profile | skills | projects | notes | timeline | stats | skillGroupLabel）
 *   PUT    /api/:key         整块替换集合          [需管理口令]
 *   POST   /api/:key         追加一条（仅数组）    [需管理口令]
 *   DELETE /api/:key/:index  删除数组第 index 项   [需管理口令]
 *   GET    /*                静态文件（../www/），SPA 回退到 index.html
 *
 * 数据层：server/db.json（原子写）。换 SQLite/Postgres 时只需替换 readDb/writeDb。
 *
 * 管理口令：写接口需带请求头 x-admin-token，与环境变量 ADMIN_TOKEN 比对；
 *           未设置 ADMIN_TOKEN 时默认 'admin123'（仅限本地开发，生产必须改）。
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT) || 3001;
const ROOT = __dirname;
const DIST = path.resolve(ROOT, '..', 'www'); // 平台会排除 dist/，故构建输出到 www/
const DB = path.join(ROOT, 'db.json');
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin123';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

if (!process.env.ADMIN_TOKEN) {
  console.warn('[server] ADMIN_TOKEN 未设置，使用默认口令（请勿用于公开部署）');
}

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
  '.zip': 'application/zip',
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
    'Referrer-Policy': 'no-referrer',
    'Access-Control-Allow-Origin': CORS_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-token',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    let done = false;
    const finish = (v) => {
      if (!done) {
        done = true;
        resolve(v);
      }
    };
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 5 * 1024 * 1024) {
        req.destroy(); // 5MB 上限
        finish(null);
      }
    });
    req.on('end', () => {
      try {
        finish(JSON.parse(raw || 'null'));
      } catch {
        finish(null);
      }
    });
    req.on('error', () => finish(null));
  });
}

/** 恒定时间比较口令，防时序侧信道 */
function safeEqual(a, b) {
  const ab = Buffer.from(String(a), 'utf8');
  const bb = Buffer.from(String(b), 'utf8');
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function isAdminReq(req) {
  return safeEqual(req.headers['x-admin-token'] ?? '', ADMIN_TOKEN);
}

function serveStatic(res, urlPath) {
  // 路径穿越防护：解码 → 归一 → 剥前导 ../ → resolve 后必须仍在 DIST 之内
  let safe;
  try {
    safe = decodeURIComponent(urlPath.split('?')[0]);
  } catch {
    return send(res, 400, { error: 'bad request' });
  }
  safe = path.normalize(safe).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/, '');
  const file0 = path.resolve(DIST, safe || 'index.html');
  if (file0 !== DIST && !file0.startsWith(DIST + path.sep)) {
    return send(res, 403, { error: 'forbidden' });
  }

  let file = file0;
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    // 目录访问：无尾斜杠先 301（保证相对路径解析正确），再给目录自己的 index.html
    if (!urlPath.split('?')[0].endsWith('/')) {
      res.writeHead(301, { Location: '/' + safe.replace(/\/+$/, '') + '/' });
      return res.end();
    }
    const dirIndex = path.join(file, 'index.html');
    file = fs.existsSync(dirIndex) ? dirIndex : path.join(DIST, 'index.html');
  } else if (!fs.existsSync(file)) {
    // SPA 未知路由 → index.html
    file = path.join(DIST, 'index.html');
  }
  if (!fs.existsSync(file)) {
    return send(res, 404, 'www/index.html 不存在，请先 npm run build', 'text/plain; charset=utf-8');
  }

  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  });
  fs.createReadStream(file).pipe(res);
}

/* ---------------- 路由 ---------------- */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const p = url.pathname;

  // 预检（跨域部署时浏览器先问一次）
  if (req.method === 'OPTIONS') {
    return send(res, 204, '');
  }

  // 健康检查（给部署平台探活用）
  if (p === '/healthz') return send(res, 200, { ok: true, uptime: process.uptime() });

  if (!p.startsWith('/api/')) return serveStatic(res, p);

  const parts = p.split('/').filter(Boolean); // ['api', key, index?]
  const key = parts[1];
  const idx = parts[2];

  if (!KEYS.has(key)) return send(res, 404, { error: `unknown collection: ${key}` });

  const db = readDb();

  if (req.method === 'GET') {
    // 缺失键必须 404：返回 null(200) 会被前端当成"库里就是 null"覆盖兜底数据
    if (!(key in db)) return send(res, 404, { error: 'not found' });
    return send(res, 200, db[key]);
  }

  // 写接口统一鉴权
  if (!isAdminReq(req)) {
    console.warn(`[server] 401 ${req.method} ${p} ip=${req.socket.remoteAddress}`);
    return send(res, 401, { error: 'unauthorized: 缺少或错误的 x-admin-token' });
  }

  if (req.method === 'PUT') {
    const body = await readBody(req);
    if (body === null) return send(res, 400, { error: 'invalid json' });
    db[key] = body;
    writeDb(db);
    console.log(`[server] PUT ${p} ip=${req.socket.remoteAddress} count=${Array.isArray(body) ? body.length : 1}`);
    return send(res, 200, { ok: true, key, count: Array.isArray(body) ? body.length : 1 });
  }

  if (req.method === 'POST') {
    const body = await readBody(req);
    if (body === null) return send(res, 400, { error: 'invalid json' });
    if (!Array.isArray(db[key])) return send(res, 400, { error: `${key} 不是数组` });
    db[key].push(body);
    writeDb(db);
    console.log(`[server] POST ${p} ip=${req.socket.remoteAddress} count=${db[key].length}`);
    return send(res, 201, { ok: true, key, count: db[key].length });
  }

  if (req.method === 'DELETE' && idx !== undefined) {
    const i = Number(idx);
    if (!Array.isArray(db[key])) return send(res, 400, { error: `${key} 不是数组` });
    if (Number.isNaN(i) || i < 0 || i >= db[key].length) return send(res, 404, { error: 'index out of range' });
    db[key].splice(i, 1);
    writeDb(db);
    console.log(`[server] DELETE ${p} ip=${req.socket.remoteAddress} count=${db[key].length}`);
    return send(res, 200, { ok: true, key, count: db[key].length });
  }

  return send(res, 405, { error: 'method not allowed' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] listening on http://0.0.0.0:${PORT}`);
  console.log(`[server] static: ${DIST}`);
  console.log(`[server] db:     ${DB}`);
});
