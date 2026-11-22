import { createReadStream, existsSync, statSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { request as httpRequest } from 'node:http'
import { createServer } from 'node:https'
import { networkInterfaces } from 'node:os'
import { extname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const DIST = join(ROOT, 'dist')
const CERT_DIR = join(ROOT, 'server', 'certs')
const PORT = Number(process.env.HTTPS_PORT ?? 3443)
const HOST = process.env.HTTPS_HOST ?? '0.0.0.0'
const API_TARGET = new URL(process.env.API_TARGET ?? 'http://127.0.0.1:8081')
const S3_TARGET = new URL(process.env.S3_TARGET ?? 'http://127.0.0.1:9010')
const KEY_PATH = process.env.TLS_KEY ?? join(CERT_DIR, 'localhost-key.pem')
const CERT_PATH = process.env.TLS_CERT ?? join(CERT_DIR, 'localhost-cert.pem')

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

if (!existsSync(DIST)) {
  console.error('Папка dist не найдена. Сначала выполните: npm run build')
  process.exit(1)
}
if (!existsSync(KEY_PATH) || !existsSync(CERT_PATH)) {
  console.error('TLS-сертификаты не найдены. Выполните: npm run cert')
  console.error(`Ожидались файлы:\n  ${KEY_PATH}\n  ${CERT_PATH}`)
  process.exit(1)
}

const contentType = (filePath) => MIME_TYPES[extname(filePath)] ?? 'application/octet-stream'

const serveStatic = (req, res, url) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405).end()
    return
  }

  let pathname
  try {
    pathname = decodeURIComponent(url.pathname)
  } catch {
    res.writeHead(400).end()
    return
  }

  let filePath = resolve(DIST, `.${pathname}`)
  if (filePath !== DIST && !filePath.startsWith(`${DIST}${sep}`)) {
    res.writeHead(403).end()
    return
  }

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'index.html')
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    const acceptsHtml = (req.headers.accept ?? '').includes('text/html')
    // Для клиентских маршрутов /feed, /grid, /add и /login отдаём SPA.
    if (req.method === 'GET' && acceptsHtml && !extname(pathname)) {
      filePath = join(DIST, 'index.html')
    } else {
      res.writeHead(404).end('Not found')
      return
    }
  }

  const stats = statSync(filePath)
  const isAsset = pathname.startsWith('/assets/')
  res.writeHead(200, {
    'Content-Type': contentType(filePath),
    'Content-Length': stats.size,
    'Cache-Control': isAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
  })

  if (req.method === 'HEAD') {
    res.end()
    return
  }

  createReadStream(filePath)
    .on('error', () => res.destroy())
    .pipe(res)
}

const proxy = (req, res, target, rewritePath = (path) => path) => {
  const proxyReq = httpRequest(
    {
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port,
      method: req.method,
      path: rewritePath(req.url ?? '/'),
      headers: {
        ...req.headers,
        host: target.host,
        'x-forwarded-proto': 'https',
      },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers)
      proxyRes.pipe(res)
    },
  )

  proxyReq.setTimeout(15000, () => proxyReq.destroy(new Error('proxy timeout')))
  proxyReq.on('error', () => {
    if (!res.headersSent) res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Сервис недоступен')
  })
  req.pipe(proxyReq)
}

const server = createServer(
  {
    key: await readFile(KEY_PATH),
    cert: await readFile(CERT_PATH),
  },
  (req, res) => {
    const url = new URL(req.url ?? '/', `https://${req.headers.host ?? 'localhost'}`)

    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      proxy(req, res, API_TARGET)
      return
    }

    if (url.pathname === '/s3' || url.pathname.startsWith('/s3/')) {
      proxy(req, res, S3_TARGET, (path) => path.replace(/^\/s3/, '') || '/')
      return
    }

    serveStatic(req, res, url)
  },
)

server.listen(PORT, HOST, () => {
  console.log(`HTTPS-сервер: https://localhost:${PORT}`)
  for (const addresses of Object.values(networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family === 'IPv4' && !address.internal) {
        console.log(`Для телефона: https://${address.address}:${PORT}`)
      }
    }
  }
})
