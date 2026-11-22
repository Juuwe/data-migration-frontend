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

export const getMockMethods = (minTime: number, maxTime: number): GridResponse => {
  if (Number.isNaN(minTime) || Number.isNaN(maxTime) || minTime < 0 || maxTime < minTime) {
    return {
      methods: METHODS_MOCK.map(withLocalMedia),
      min_time: DEFAULT_MIN_TIME,
      max_time: DEFAULT_MAX_TIME,
    }
  }

  const methods = METHODS_MOCK.filter(
    (method) =>
      method.time_in_gb !== null && method.time_in_gb >= minTime && method.time_in_gb <= maxTime,
  ).map(withLocalMedia)
  return { methods, min_time: minTime, max_time: maxTime }
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
