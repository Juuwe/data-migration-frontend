import { useEffect, useState, type FC } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getFeedMethod } from '../../modules/methodsApi'
import { DEFAULT_VIDEO } from '../../modules/media'
import type { FeedMethod } from '../../modules/types'
import { ROUTES } from '../../Routes'
import './FeedPage.css'

export const FeedPage: FC = () => {
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const next = searchParams.get('next') === 'true'
  const [method, setMethod] = useState<FeedMethod | null>(null)
  // Храним id раскрытой услуги, чтобы при переходе к следующей описание снова было свернуто
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    getFeedMethod(id, next).then((response) => setMethod(response?.method ?? null))
  }, [id, next])

  if (!method) return null

  const expanded = expandedId === method.id

  return (
    <>
      <div className="media-container">
        <video
          className="feed-video"
          src={method.video_url || DEFAULT_VIDEO}
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      <div className="content-bottom-group">
        <section className="info-block">
          <h2 className="info-title">{method.title}</h2>
          <div className="expandable-text">
            <p className={expanded ? 'full-text' : 'text-preview'}>{method.description}</p>
            <button
              type="button"
              className="more-btn"
              onClick={() => setExpandedId(expanded ? null : method.id)}
            >
              {expanded ? 'меньше' : 'больше'}
            </button>
          </div>
        </section>
      </div>

      <div className="action-buttons-group">
        <div className="action-item">
          <div className="circle-btn" aria-label="Нравится">
            <i className="bi bi-heart-fill action-icon"></i>
          </div>
          <span className="action-label">{method.likes_count}</span>
        </div>

        <div className="action-item">
          <Link to={`${ROUTES.FEED}?id=${method.id}&next=true`} className="circle-btn" aria-label="Дальше">
            <i className="bi bi-arrow-down action-icon"></i>
          </Link>
          <span className="action-label">Дальше</span>
        </div>

        <div className="tags-group">
          <div className="tag-badge">
            <i className="bi bi-clock tag-icon" aria-hidden="true"></i>
            <span className="visually-hidden">Время на гигабайт: </span>
            <span className="tag-text">{method.time_in_gb?.toFixed(2)} сек/Гб</span>
          </div>
          <div className="tag-badge" title="Коэффициент надёжности">
            <i className="bi bi-shield-check tag-icon" aria-hidden="true"></i>
            <span className="visually-hidden">Коэффициент надёжности: </span>
            <span className="tag-text">{method.reliability?.toFixed(3)}</span>
          </div>
        </div>
      </div>
    </>
  )
}
