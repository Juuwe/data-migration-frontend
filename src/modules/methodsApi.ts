import { DEFAULT_MAX_TIME, DEFAULT_MIN_TIME, METHODS_MOCK } from './mock'
import type { FeedResponse, GridResponse } from './types'

// Пока функции работают только с mock-коллекцией, но повторяют поведение
// GET /api/methods и GET /api/methods/feed, чтобы потом заменить их на запросы

export const getMethods = async (minTime?: number, maxTime?: number): Promise<GridResponse> => {
  const isValid =
    minTime !== undefined && maxTime !== undefined && minTime >= 0 && maxTime >= minTime

  if (!isValid) {
    return { methods: METHODS_MOCK, min_time: DEFAULT_MIN_TIME, max_time: DEFAULT_MAX_TIME }
  }

  const methods = METHODS_MOCK.filter(
    (method) =>
      method.time_in_gb !== null && method.time_in_gb >= minTime && method.time_in_gb <= maxTime,
  )
  return { methods, min_time: minTime, max_time: maxTime }
}

// Без id — первый метод, с id — метод по id, с next — следующий после него (после последнего — первый)
export const getFeedMethod = async (id?: number, next = false): Promise<FeedResponse | null> => {
  if (!METHODS_MOCK.length) return null

  let method = METHODS_MOCK[0]
  if (id !== undefined) {
    if (next) {
      method = METHODS_MOCK.find((item) => item.id > id) ?? METHODS_MOCK[0]
    } else {
      const found = METHODS_MOCK.find((item) => item.id === id)
      if (!found) return null
      method = found
    }
  }

  return { method: { ...method, is_liked: false } }
}
