import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UserState {
  email: string
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  email: '',
  isAuthenticated: false,
  loading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ email: string }>) {
      state.email = action.payload.email
      state.isAuthenticated = true
      state.loading = false
      state.error = null
    },
    clearUser(state) {
      state.email = ''
      state.isAuthenticated = false
      state.loading = false
      state.error = null
    },
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
      if (action.payload) state.error = null
    },
    setAuthError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
      state.loading = false
    },
  },
})

export const { setUser, clearUser, setAuthLoading, setAuthError } = userSlice.actions
export default userSlice.reducer
