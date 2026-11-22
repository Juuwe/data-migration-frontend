import type { FC } from 'react'
import { Spinner } from 'react-bootstrap'

import './LoadingOverlay.css'

interface Props {
  visible: boolean
}

// Блокирует кнопки и поля интерфейса, пока выполняется AJAX-запрос.
export const LoadingOverlay: FC<Props> = ({ visible }) => {
  if (!visible) return null

  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-box">
        <Spinner animation="border" size="sm" />
        <span>Загрузка...</span>
      </div>
    </div>
  )
}
