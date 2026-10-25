import type { FC } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './components/BottomNav/BottomNav'
import { ROUTES } from './Routes'
import './AppLayout.css'

export const AppLayout: FC = () => {
  const location = useLocation()
  const isLightTheme = !location.pathname.startsWith(ROUTES.FEED)

  return (
    <main className={`app-viewport ${isLightTheme ? 'theme-light' : ''}`}>
      <Outlet />
      <BottomNav />
    </main>
  )
}
