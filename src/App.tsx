import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { FeedPage } from './pages/FeedPage/FeedPage'
import { GridPage } from './pages/GridPage/GridPage'
import { ROUTES } from './Routes'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.FEED} element={<FeedPage />} />
          <Route path={`${ROUTES.FEED}/:id`} element={<FeedPage />} />
          <Route path={ROUTES.GRID} element={<GridPage />} />
          <Route path="*" element={<Navigate to={ROUTES.FEED} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
