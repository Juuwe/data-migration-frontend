import process from 'node:process'

const API_BASE = process.env.API_BASE ?? 'http://192.168.1.96:18081'
const THRESHOLD = Number(process.env.THRESHOLD ?? 0.08)
const TOP_K = Number(process.env.TOP_K ?? 3)

const images = ['Offline migration', 'Replication', 'Online migration']

const tokenize = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => token.slice(0, 6))

const vectorize = (tokens) => {
  const map = new Map()
  for (const token of tokens) map.set(token, (map.get(token) ?? 0) + 1)
  return map
}

const cosine = (a, b) => {
  let dot = 0
  let na = 0
  let nb = 0
  for (const [token, count] of a) {
    na += count * count
    const other = b.get(token)
    if (other) dot += count * other
  }
  for (const count of b.values()) nb += count * count
  if (!na || !nb) return 0
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

const short = (text) => text.split(' ').slice(0, 4).join(' ')

const response = await fetch(`${API_BASE}/api/methods?page=1&limit=10`)
if (!response.ok) {
  console.error(`API ${API_BASE} вернул ${response.status}`)
  process.exit(1)
}
const data = await response.json()
const methods = data.methods ?? []
console.log(`Сходство по ${methods.length} описаниям первой страницы`)
console.log(`порог ${THRESHOLD.toFixed(2)}, TopK ${TOP_K}\n`)

for (const image of images) {
  const imageVector = vectorize(tokenize(image))
  const scored = methods
    .map((method) => ({
      label: short(method.description_en ?? method.title),
      score: cosine(imageVector, vectorize(tokenize(method.description_en ?? ''))),
    }))
    .sort((left, right) => right.score - left.score)

  console.log(
    `${image.padEnd(18)} -> ` +
      scored.map((item) => `${item.label} ${item.score.toFixed(3)}`).join(' | '),
  )
  const passed = scored.filter((item) => item.score >= THRESHOLD).slice(0, TOP_K)
  console.log(
    `${' '.repeat(22)}выдача (порог ${THRESHOLD.toFixed(2)}, TopK ${TOP_K}): ` +
      passed.map((item) => `${item.label} ${item.score.toFixed(3)}`).join(', '),
  )
  console.log()
}
