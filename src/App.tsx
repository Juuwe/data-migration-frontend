import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { AppLayout } from './AppLayout'
import { AddPage } from './pages/AddPage/AddPage'
import { FeedPage } from './pages/FeedPage/FeedPage'
import { GridPage } from './pages/GridPage/GridPage'
import { LoginPage } from './pages/LoginPage/LoginPage'
import { ROUTES } from './Routes'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.FEED} element={<FeedPage />} />
          <Route path={ROUTES.ADD} element={<AddPage />} />
          <Route path={ROUTES.GRID} element={<GridPage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
