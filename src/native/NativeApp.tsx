import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { NativeDetailPage } from './NativeDetailPage'
import { NativeListPage } from './NativeListPage'
import './native.css'

export const NativeApp = () => (
  <BrowserRouter>
    <main className="native">
      <Routes>
        <Route path="/" element={<NativeListPage />} />
        <Route path="/methods/:id" element={<NativeDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  </BrowserRouter>
)
