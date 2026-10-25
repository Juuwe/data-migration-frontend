import type { FC } from 'react'
import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { DEFAULT_IMAGE } from '../../modules/media'
import { ROUTES } from '../../Routes'
import './MethodCard.css'

interface Props {
  id: number
  title: string
  image_url: string
  likes_count: number
  time_in_gb: number | null
}

export const MethodCard: FC<Props> = ({ id, title, image_url, likes_count, time_in_gb }) => (
  <Card as="article" className="service-card">
    <Link to={`${ROUTES.FEED}?id=${id}`} className="service-card-link">
      <div className="card-media">
        <img src={image_url || DEFAULT_IMAGE} alt={title} className="card-img" />
        <div className="card-like-badge" aria-label={`Количество лайков: ${likes_count}`}>
          <i className="bi bi-heart-fill card-like-icon"></i>
          <span>{likes_count}</span>
        </div>
      </div>
      <h3 className="card-title">{title}</h3>
    </Link>

    <div className="card-actions-row">
      <div className="card-time" aria-label="Время обработки одного гигабайта">
        <i className="bi bi-clock card-clock-icon"></i>
        <span>{time_in_gb} сек/Гб</span>
      </div>
    </div>
  </Card>
)
