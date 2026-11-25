import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { requestTextEmbeddings } from '../modules/searchWorker'
import type { RootState } from '../store'

export interface TextEmbedding {
  description: string
  embedding: number[]
}

interface SearchState {
  textEmbeddings: Record<number, TextEmbedding>
  loading: boolean
  progress: number
  error: string | null
}

const initialState: SearchState = {
  textEmbeddings: {},
  loading: false,
  progress: 0,
  error: null,
}

export const loadTextEmbeddings = createAsyncThunk<
  { items: Array<{ id: number; description: string }>; embeddings: Record<number, number[]> },
  Array<{ id: number; description: string }>,
  { state: RootState; rejectValue: string }
>(
  'search/loadTextEmbeddings',
  async (items, { dispatch, rejectWithValue }) => {
    try {
      const embeddings = await requestTextEmbeddings(items, (progress) => {
        dispatch(setSearchProgress(progress))
      })
      return { items, embeddings }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Не удалось загрузить модель поиска',
      )
    }
  },
  {
    condition: (items, { getState }) => {
      const cached = getState().search.textEmbeddings
      return items.some((item) => cached[item.id]?.description !== item.description)
    },
  },
)

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchProgress(state, action: PayloadAction<number>) {
      state.progress = Math.max(0, Math.min(100, action.payload))
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTextEmbeddings.pending, (state) => {
        state.loading = true
        state.progress = 0
        state.error = null
      })
      .addCase(loadTextEmbeddings.fulfilled, (state, action) => {
        state.loading = false
        state.progress = 100

        action.payload.items.forEach((item) => {
          const embedding = action.payload.embeddings[item.id]
          if (!embedding) return
          state.textEmbeddings[item.id] = {
            description: item.description,
            embedding,
          }
        })
      })
      .addCase(loadTextEmbeddings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Не удалось загрузить модель поиска'
      })
  },
})

export const { setSearchProgress } = searchSlice.actions
export default searchSlice.reducer
