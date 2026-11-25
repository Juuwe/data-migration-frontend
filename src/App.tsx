import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AppLayout } from './AppLayout'
import { AddPage } from './pages/AddPage/AddPage'
import { FeedPage } from './pages/FeedPage/FeedPage'
import { GridPage } from './pages/GridPage/GridPage'
import { LoginPage } from './pages/LoginPage/LoginPage'
import { ROUTES } from './Routes'
import { IS_TAURI } from './modules/tauriConfig'
import { NativeApp } from './native/NativeApp'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

function App() {
  // В окне Tauri — отдельная раскладка гостя, веб-версия и PWA не меняются
  if (IS_TAURI) return <NativeApp />

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to={ROUTES.FEED} replace />} />
          <Route path={ROUTES.FEED} element={<FeedPage />} />
          <Route path={ROUTES.ADD} element={<AddPage />} />
          <Route path={ROUTES.GRID} element={<GridPage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path="*" element={<Navigate to={ROUTES.GRID} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
