import type { FC } from 'react'
import { Card } from 'react-bootstrap'
import { MediaImage } from '../MediaImage/MediaImage'
import './MethodCard.css'

interface Props {
  title: string
  image_url: string
  likes_count: number
  time_in_gb: number | null
  onClick: () => void
}

export const MethodCard: FC<Props> = ({ title, image_url, likes_count, time_in_gb, onClick }) => (
  <Card as="article" className="method-card" onClick={onClick}>
    <div className="card-media">
      <MediaImage src={image_url} alt={title} className="card-img" />
      <div className="card-like-badge" aria-label={`Количество лайков: ${likes_count}`}>
        <i className="bi bi-heart-fill card-like-icon"></i>
        <span>{likes_count}</span>
      </div>
    </div>
    <Card.Title as="h3" className="card-title">
      {title}
    </Card.Title>
    <div className="card-time" aria-label="Время обработки одного гигабайта">
      <i className="bi bi-clock card-clock-icon"></i>
      <span>{time_in_gb ?? '—'} сек/Гб</span>
    </div>
  </Card>
)
