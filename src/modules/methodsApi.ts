import { DEFAULT_MAX_TIME, DEFAULT_MIN_TIME, METHODS_MOCK } from './mock'
import type { FeedResponse, GridResponse } from './types'

// Пока функции работают с mock-коллекцией и повторяют поведение
// GET /api/methods и GET /api/methods/feed

export const getMethods = async (minTime: number, maxTime: number): Promise<GridResponse> => {
  if (Number.isNaN(minTime) || Number.isNaN(maxTime) || minTime < 0 || maxTime < minTime) {
    return { methods: METHODS_MOCK, min_time: DEFAULT_MIN_TIME, max_time: DEFAULT_MAX_TIME }
  }

  const methods = METHODS_MOCK.filter(
    (method) =>
      method.time_in_gb !== null && method.time_in_gb >= minTime && method.time_in_gb <= maxTime,
  )
  return { methods, min_time: minTime, max_time: maxTime }
}

// null вместо ответов 400 и 404
export const getFeedMethod = async (id: string | null, next: boolean): Promise<FeedResponse | null> => {
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
  return { method: { ...method, is_liked: false } }
}
