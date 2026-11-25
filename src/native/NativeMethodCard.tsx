import type { FC } from 'react'
import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import { DEFAULT_IMAGE, resolveImageUrl } from '../modules/media'
import type { MigrationMethod } from '../modules/types'
import '../components/MethodCard/MethodCard.css'

// Карточка услуги: изображение, название, время, лайки, процент сходства и ссылка «Подробнее»
export const NativeMethodCard: FC<{ method: MigrationMethod; score?: number }> = ({
  method,
  score,
}) => {
  const detailPath = `/methods/${method.id}`

  return (
    <Card as="article" className="service-card">
      <Link to={detailPath} className="card-media">
        <img
          src={resolveImageUrl(method.image_url)}
          alt={method.title}
          className="card-img"
          onError={(event) => {
            event.currentTarget.onerror = null
            event.currentTarget.src = DEFAULT_IMAGE
          }}
        />
      </Link>
      <h3 className="card-title">{method.title}</h3>
      <div className="native-card-meta">
        <span className="card-time">
          <i className="bi bi-clock card-clock-icon" aria-hidden="true"></i>
          {method.time_in_gb !== null ? `${method.time_in_gb} сек/Гб` : '—'}
        </span>
        <span className="native-likes" aria-label={`Количество лайков: ${method.likes_count}`}>
          <i className="bi bi-heart-fill card-like-icon" aria-hidden="true"></i>
          {method.likes_count}
        </span>
        {score !== undefined ? (
          <span className="native-score" aria-label={`Сходство с изображением: ${Math.round(score * 100)}%`}>
            {Math.round(score * 100)}%
          </span>
        ) : null}
      </div>
      <Link to={detailPath} className="native-card-more">
        Подробнее →
      </Link>
    </Card>
  )
}
