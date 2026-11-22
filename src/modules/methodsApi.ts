import { DEFAULT_IMAGE, DEFAULT_VIDEO } from './media'
import { DEFAULT_MAX_TIME, DEFAULT_MIN_TIME, METHODS_MOCK } from './mock'
import type { FeedResponse, GridResponse, MigrationMethod } from './types'

// Mock-коллекция используется только гостем и только при недоступном бэкенде.
// Медиа берём из public, чтобы mock работал без MinIO.

const withLocalMedia = (method: MigrationMethod): MigrationMethod => ({
  ...method,
  image_url: DEFAULT_IMAGE,
  video_url: DEFAULT_VIDEO,
})

export const getMockMethods = (
  minTime: number,
  maxTime: number,
  page: number,
  limit: number,
): GridResponse => {
  const isValid = !Number.isNaN(minTime) && !Number.isNaN(maxTime) && minTime >= 0 && maxTime >= minTime
  const min = isValid ? minTime : DEFAULT_MIN_TIME
  const max = isValid ? maxTime : DEFAULT_MAX_TIME
  const all = METHODS_MOCK.filter(
    (method) => method.time_in_gb !== null && method.time_in_gb >= min && method.time_in_gb <= max,
  )
  const offset = (page - 1) * limit

  return {
    methods: all.slice(offset, offset + limit).map(withLocalMedia),
    min_time: min,
    max_time: max,
    total: all.length,
    page,
    limit,
  }
}

// null вместо ответов 400 и 404
export const getMockFeedMethod = (id: string | null, next: boolean): FeedResponse | null => {
  let method = METHODS_MOCK[0]

  if (id === null) {
    if (next) return null
  } else {
    const methodId = Number(id)
    if (!Number.isInteger(methodId) || methodId <= 0) return null

    if (next) {
      method = METHODS_MOCK.find((item) => item.id > methodId) ?? METHODS_MOCK[0]
    } else {
      const found = METHODS_MOCK.find((item) => item.id === methodId)
      if (!found) return null
      method = found
    }
  }

  if (!method) return null
  return { method: { ...withLocalMedia(method), is_liked: false } }
}
