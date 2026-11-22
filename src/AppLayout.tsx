import type { FC } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { BottomNav } from './components/BottomNav/BottomNav'
import { LoadingOverlay } from './components/LoadingOverlay/LoadingOverlay'
import { useAppSelector } from './modules/hooks'
import { ROUTES } from './Routes'
import './AppLayout.css'

export const AppLayout: FC = () => {
  const location = useLocation()
  const isLightTheme = !location.pathname.startsWith(ROUTES.FEED)
  const loading = useAppSelector(
    (state) =>
      state.methods.grid.loading ||
      state.methods.feed.loading ||
      state.draft.loading ||
      state.user.loading,
  )

  return (
    <main className={`app-viewport ${isLightTheme ? 'theme-light' : ''}`}>
      <Outlet />
      <LoadingOverlay visible={loading} />
      <BottomNav />
    </main>
  )
}
