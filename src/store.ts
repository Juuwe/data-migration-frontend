import { configureStore } from '@reduxjs/toolkit'

import draftReducer from './slices/draftSlice'
import methodsReducer from './slices/methodsSlice'
import userReducer from './slices/userSlice'

export const store = configureStore({
  reducer: {
    methods: methodsReducer,
    draft: draftReducer,
    user: userReducer,
  },
  // Redux DevTools подключается автоматически в development-сборке.
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
