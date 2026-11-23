import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { api } from '../api'
import { toFeedMethod, toMigrationMethod } from '../modules/adapters'
import { getRequestErrorMessage, isBackendUnavailable } from '../modules/apiError'
import { IS_STATIC_MODE } from '../modules/env'
import { IS_TAURI } from '../modules/tauriConfig'
import { getMockFeedMethod, getMockMethods } from '../modules/methodsApi'
import { DEFAULT_MAX_TIME, DEFAULT_MIN_TIME } from '../modules/mock'
import type { FeedMethod, GridResponse, MigrationMethod } from '../modules/types'
import type { RootState } from '../store'

interface MethodsState {
  filters: {
    minTime: number
    maxTime: number
  }
  grid: {
    methods: MigrationMethod[]
    loading: boolean
    loaded: boolean
    query: { minTime: number; maxTime: number; page: number } | null
    page: number
    limit: number
    total: number
    error: string | null
  }
  feed: {
    method: FeedMethod | null
    loading: boolean
    key: string | null
    error: string | null
  }
}

const initialState: MethodsState = {
  filters: {
    minTime: DEFAULT_MIN_TIME,
    maxTime: DEFAULT_MAX_TIME,
  },
  grid: {
    methods: [],
    loading: false,
    loaded: false,
    query: null,
    page: 1,
    limit: 10,
    total: 0,
    error: null,
  },
  feed: {
    method: null,
    loading: false,
    key: null,
    error: null,
  },
}

export const getMethods = createAsyncThunk<
  GridResponse,
  void,
  { state: RootState; rejectValue: string }
>('methods/getMethods', async (_, { getState, rejectWithValue }) => {
  const { methods, user } = getState()
  const { filters, grid } = methods
  const { page, limit } = grid

  // GitHub Pages работает без бэкенда: гость получает только mock-коллекцию.
  if (!IS_TAURI && IS_STATIC_MODE && !user.isAuthenticated) {
    return getMockMethods(filters.minTime, filters.maxTime, page, limit)
  }

  try {
    const response = await api.api.methodsList({
      min_time: filters.minTime,
      max_time: filters.maxTime,
      page,
      limit,
    })
    const data = response.data

    return {
      methods: (data.methods ?? []).map(toMigrationMethod),
      min_time: data.min_time ?? filters.minTime,
      max_time: data.max_time ?? filters.maxTime,
      total: data.total ?? 0,
      page: data.page ?? page,
      limit: data.limit ?? limit,
    }
  } catch (error) {
    // Mock-коллекция доступна только гостю и только при недоступном бэкенде.
    if (!IS_TAURI && !user.isAuthenticated && isBackendUnavailable(error)) {
      return getMockMethods(filters.minTime, filters.maxTime, page, limit)
    }
    return rejectWithValue(getRequestErrorMessage(error, 'Не удалось загрузить услуги'))
  }
})

export const getFeedMethod = createAsyncThunk<
  FeedMethod | null,
  { id: string | null; next: boolean },
  { state: RootState; rejectValue: string }
>('methods/getFeedMethod', async ({ id, next }, { getState, rejectWithValue }) => {
  const { user } = getState()
  const methodId = id === null ? undefined : Number(id)

  if (
    id !== null &&
    (methodId === undefined || !Number.isInteger(methodId) || methodId <= 0)
  ) {
    return rejectWithValue('Некорректный id услуги')
  }

  if (!IS_TAURI && IS_STATIC_MODE && !user.isAuthenticated) {
    return getMockFeedMethod(id, next)?.method ?? null
  }

  try {
    const response = await api.api.methodsFeedList({
      id: methodId,
      next: next ? true : undefined,
    })
    return response.data.method ? toFeedMethod(response.data.method) : null
  } catch (error) {
    if (!IS_TAURI && !user.isAuthenticated && isBackendUnavailable(error)) {
      return getMockFeedMethod(id, next)?.method ?? null
    }
    return rejectWithValue(getRequestErrorMessage(error, 'Не удалось загрузить услугу'))
  }
})

export const setMethodLike = createAsyncThunk<
  { id: number; is_liked: boolean; likes_count: number },
  { id: number; like: 0 | 1 },
  { rejectValue: string }
>('methods/setMethodLike', async ({ id, like }, { rejectWithValue }) => {
  try {
    const response = await api.api.methodsLikeCreate(id, { like })
    const method = response.data.method

    if (!method?.id) {
      throw new Error('Некорректный ответ сервера')
    }

    return {
      id: method.id,
      is_liked: method.is_liked ?? like === 1,
      likes_count: method.likes_count ?? 0,
    }
  } catch (error) {
    return rejectWithValue(getRequestErrorMessage(error, 'Не удалось изменить лайк'))
  }
})

export const deleteMethod = createAsyncThunk<number, number, { rejectValue: string }>(
  'methods/deleteMethod',
  async (id, { rejectWithValue }) => {
    try {
      await api.api.methodsDelete(id)
      return id
    } catch (error) {
      return rejectWithValue(getRequestErrorMessage(error, 'Не удалось удалить услугу'))
    }
  },
)

const methodsSlice = createSlice({
  name: 'methods',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<{ minTime: number; maxTime: number }>) {
      state.filters = action.payload
    },
    setMinTime(state, action: PayloadAction<number>) {
      state.filters.minTime = action.payload
    },
    setMaxTime(state, action: PayloadAction<number>) {
      state.filters.maxTime = action.payload
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.grid.page = Math.max(1, action.payload)
    },
    // Сбрасываем фильтр пользователя при выходе из аккаунта.
    resetFilters(state) {
      state.filters = {
        minTime: DEFAULT_MIN_TIME,
        maxTime: DEFAULT_MAX_TIME,
      }
      state.grid.methods = []
      state.grid.loaded = false
      state.grid.query = null
      state.grid.page = 1
      state.grid.total = 0
      state.grid.error = null
    },
    invalidateGrid(state) {
      state.grid.loaded = false
      state.grid.query = null
    },
    resetFeed(state) {
      state.feed = {
        method: null,
        loading: false,
        key: null,
        error: null,
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMethods.pending, (state) => {
        state.grid.loading = true
        state.grid.error = null
      })
      .addCase(getMethods.fulfilled, (state, action) => {
        state.grid.loading = false
        state.grid.loaded = true
        state.grid.methods = action.payload.methods
        state.grid.page = action.payload.page
        state.grid.limit = action.payload.limit
        state.grid.total = action.payload.total
        state.filters = {
          minTime: action.payload.min_time,
          maxTime: action.payload.max_time,
        }
        state.grid.query = {
          minTime: action.payload.min_time,
          maxTime: action.payload.max_time,
          page: action.payload.page,
        }
      })
      .addCase(getMethods.rejected, (state, action) => {
        state.grid.loading = false
        state.grid.loaded = true
        state.grid.error = action.payload ?? 'Не удалось загрузить услуги'
      })

      .addCase(getFeedMethod.pending, (state) => {
        state.feed.loading = true
        state.feed.error = null
      })
      .addCase(getFeedMethod.fulfilled, (state, action) => {
        state.feed.loading = false
        state.feed.method = action.payload
        if (action.payload) {
          state.feed.key = `${action.meta.arg.id ?? ''}:${action.meta.arg.next ? 'next' : 'current'}`
        } else {
          state.feed.error = 'Услуга не найдена'
        }
      })
      .addCase(getFeedMethod.rejected, (state, action) => {
        state.feed.loading = false
        state.feed.error = action.payload ?? 'Не удалось загрузить услугу'
      })

      .addCase(setMethodLike.pending, (state) => {
        state.feed.loading = true
        state.feed.error = null
      })
      .addCase(setMethodLike.fulfilled, (state, action) => {
        state.feed.loading = false
        const updated = action.payload

        if (state.feed.method?.id === updated.id) {
          state.feed.method.is_liked = updated.is_liked
          state.feed.method.likes_count = updated.likes_count
        }

        const gridMethod = state.grid.methods.find((method) => method.id === updated.id)
        if (gridMethod) {
          gridMethod.likes_count = updated.likes_count
        }
      })
      .addCase(setMethodLike.rejected, (state, action) => {
        state.feed.loading = false
        state.feed.error = action.payload ?? 'Не удалось изменить лайк'
      })

      .addCase(deleteMethod.pending, (state) => {
        state.grid.loading = true
        state.grid.error = null
      })
      .addCase(deleteMethod.fulfilled, (state, action) => {
        state.grid.loading = false
        state.grid.methods = state.grid.methods.filter((method) => method.id !== action.payload)
      })
      .addCase(deleteMethod.rejected, (state, action) => {
        state.grid.loading = false
        state.grid.error = action.payload ?? 'Не удалось удалить услугу'
      })
  },
})

export const {
  setFilters,
  setMinTime,
  setMaxTime,
  setCurrentPage,
  resetFilters,
  invalidateGrid,
  resetFeed,
} = methodsSlice.actions
export default methodsSlice.reducer
