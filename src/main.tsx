import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.min.css'
import './index.css'
import App from './App.tsx'
import { IS_TAURI } from './modules/tauriConfig'
import { store } from './store'

// В нативном клиенте убираем service worker: иначе после пересборки WebView
// может показывать старую версию интерфейса. Кэш моделей (transformers.js)
// не трогаем — иначе SigLIP скачивается заново при каждом запуске.
if (IS_TAURI && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => registrations.forEach((registration) => registration.unregister()))
    .catch(() => undefined)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
