import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { api } from '../api'
import { toMigrationMethod } from '../modules/adapters'
import { getHttpStatus, getRequestErrorMessage } from '../modules/apiError'
import type { MigrationMethod } from '../modules/types'

interface DraftState {
  draft: MigrationMethod | null
  loading: boolean
  loaded: boolean
  error: string | null
}

const initialState: DraftState = {
  draft: null,
  loading: false,
  loaded: false,
  error: null,
}

export const getDraft = createAsyncThunk<
  MigrationMethod | null,
  void,
  { rejectValue: string }
>('draft/getDraft', async (_, { rejectWithValue }) => {
  try {
    const response = await api.api.methodsDraftList()
    return response.data.draft ? toMigrationMethod(response.data.draft) : null
  } catch (error) {
    // 404 означает, что черновика ещё нет.
    if (getHttpStatus(error) === 404) {
      return null
    }
    return rejectWithValue(getRequestErrorMessage(error, 'Не удалось загрузить черновик'))
  }
})

export const createDraft = createAsyncThunk<
  MigrationMethod,
  { title: string; image: File; video: File },
  { rejectValue: string }
>('draft/createDraft', async ({ title, image, video }, { rejectWithValue }) => {
  try {
    const response = await api.api.methodsCreate({ title, image, video })
    if (!response.data.draft) {
      throw new Error('Сервер не вернул черновик')
    }
    return toMigrationMethod(response.data.draft)
  } catch (error) {
    return rejectWithValue(getRequestErrorMessage(error, 'Не удалось создать черновик'))
  }
})

export const publishDraft = createAsyncThunk<
  MigrationMethod,
  { description: string; time_in_gb: number; reliability: number },
  { rejectValue: string }
>('draft/publishDraft', async (request, { rejectWithValue }) => {
  try {
    const response = await api.api.methodsPublishUpdate(request)
    if (!response.data.method) {
      throw new Error('Сервер не вернул услугу')
    }
    return toMigrationMethod(response.data.method)
  } catch (error) {
    return rejectWithValue(getRequestErrorMessage(error, 'Не удалось опубликовать услугу'))
  }
})

const draftSlice = createSlice({
  name: 'draft',
  initialState,
  reducers: {
    setDraftError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },
    clearDraft(state) {
      state.draft = null
      state.loaded = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDraft.pending, (state) => {
        state.loading = true
        state.error = null
        state.draft = null
      })
      .addCase(getDraft.fulfilled, (state, action) => {
        state.loading = false
        state.loaded = true
        state.draft = action.payload
      })
      .addCase(getDraft.rejected, (state, action) => {
        state.loading = false
        state.loaded = true
        state.error = action.payload ?? 'Не удалось загрузить черновик'
      })

      .addCase(createDraft.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createDraft.fulfilled, (state, action) => {
        state.loading = false
        state.draft = action.payload
      })
      .addCase(createDraft.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Не удалось создать черновик'
      })

      .addCase(publishDraft.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(publishDraft.fulfilled, (state) => {
        state.loading = false
        state.draft = null
      })
      .addCase(publishDraft.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Не удалось опубликовать услугу'
      })
  },
})

export const { setDraftError, clearDraft } = draftSlice.actions
export default draftSlice.reducer
