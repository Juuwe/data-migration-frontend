import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { networkInterfaces } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const CERT_DIR = join(ROOT, 'server', 'certs')
const keyPath = join(CERT_DIR, 'localhost-key.pem')
const certPath = join(CERT_DIR, 'localhost-cert.pem')

mkdirSync(CERT_DIR, { recursive: true })

if (existsSync(keyPath) && existsSync(certPath) && !process.argv.includes('--force')) {
  console.log('Сертификаты уже существуют:')
  console.log(`  ${keyPath}`)
  console.log(`  ${certPath}`)
  console.log('Для перевыпуска выполните: npm run cert -- --force')
  process.exit(0)
}

const addresses = Object.values(networkInterfaces())
  .flatMap((items) => items ?? [])
  .filter((item) => item.family === 'IPv4' && !item.internal)
  .map((item) => item.address)

const subjectAltName = ['DNS:localhost', 'IP:127.0.0.1', ...addresses.map((ip) => `IP:${ip}`)].join(',')

execFileSync(
  'openssl',
  [
    'req',
    '-x509',
    '-newkey',
    'rsa:2048',
    '-nodes',
    '-keyout',
    keyPath,
    '-out',
    certPath,
    '-days',
    '365',
    '-subj',
    '/CN=localhost',
    '-addext',
    `subjectAltName=${subjectAltName}`,
  ],
  { stdio: 'inherit' },
)

console.log('\nСертификат создан:')
console.log(`  ${keyPath}`)
console.log(`  ${certPath}`)
console.log(`SAN: ${subjectAltName}`)
