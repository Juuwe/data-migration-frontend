import { useEffect, useRef, type FC } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { BottomNav } from './components/BottomNav/BottomNav'
import { SiteHeader } from './components/SiteHeader/SiteHeader'
import { useAppDispatch, useAppSelector } from './modules/hooks'
import { IS_TAURI } from './modules/tauriConfig'
import { ROUTES } from './Routes'
import { getFeedMethod } from './slices/methodsSlice'
import './AppLayout.css'

export const AppLayout: FC = () => {
  const location = useLocation()
  const isLightTheme = !location.pathname.startsWith(ROUTES.FEED)
  const dispatch = useAppDispatch()
  const feedKey = useAppSelector((state) => state.methods.feed.key)
  const feedLoading = useAppSelector((state) => state.methods.feed.loading)
  const prefetched = useRef(false)

  // Лента в Redis формируется при загрузке приложения, независимо от стартовой вкладки.
  useEffect(() => {
    if (prefetched.current) return
    prefetched.current = true

    if (!feedKey && !feedLoading) {
      dispatch(getFeedMethod({ id: null, next: false }))
    }
  }, [dispatch, feedKey, feedLoading])

  return (
    <main
      className={`app-viewport ${isLightTheme ? 'theme-light' : ''} ${IS_TAURI ? 'site-mode' : ''}`}
    >
      {IS_TAURI ? <SiteHeader /> : null}
      {IS_TAURI ? (
        <div className="site-content">
          <Outlet />
        </div>
      ) : (
        <Outlet />
      )}
      {IS_TAURI ? null : <BottomNav />}
    </main>
  )
}
