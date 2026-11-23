import type { FC } from 'react'
import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import { DEFAULT_IMAGE, resolveImageUrl } from '../../modules/media'
import { ROUTES } from '../../Routes'
import './MethodCard.css'

interface Props {
  id: number
  title: string
  image_url: string
  likes_count: number
  time_in_gb: number | null
  score?: number
  onDelete?: () => void
}

export const MethodCard: FC<Props> = ({
  id,
  title,
  image_url,
  likes_count,
  time_in_gb,
  score,
  onDelete,
}) => (
  <Card as="article" className="service-card">
    <Link to={`${ROUTES.FEED}?id=${id}`} className="service-card-link">
      <div className="card-media">
        <img
          src={resolveImageUrl(image_url)}
          alt={title}
          className="card-img"
          onError={(event) => {
            event.currentTarget.onerror = null
            event.currentTarget.src = DEFAULT_IMAGE
          }}
        />
        <div className="card-like-badge" aria-label={`Количество лайков: ${likes_count}`}>
          <i className="bi bi-heart-fill card-like-icon"></i>
          <span>{likes_count}</span>
        </div>
        {score !== undefined ? (
          <div className="card-score-badge">{(score * 100).toFixed(0)}%</div>
        ) : null}
      </div>
      <h3 className="card-title">{title}</h3>
    </Link>

    <div className="card-actions-row">
      <div className="card-time" aria-label="Время обработки одного гигабайта">
        <i className="bi bi-clock card-clock-icon"></i>
        <span>{time_in_gb !== null ? `${time_in_gb} сек/Гб` : '—'}</span>
      </div>

      {onDelete ? (
        <button
          type="button"
          className="card-delete-btn"
          onClick={onDelete}
          aria-label={`Удалить услугу ${title}`}
          title="Удалить услугу"
        >
          <i className="bi bi-trash" aria-hidden="true"></i>
        </button>
      ) : null}
    </div>
  </Card>
)
