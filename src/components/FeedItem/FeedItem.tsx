import { useState, type FC } from 'react'
import { DEFAULT_VIDEO } from '../../modules/media'
import type { FeedMethod } from '../../modules/types'
import './FeedItem.css'

interface Props {
  method: FeedMethod
  onNext: () => void
}

export const FeedItem: FC<Props> = ({ method, onNext }) => {
  const [expanded, setExpanded] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)

  // Если url пустой или видео недоступно, показываем видео по умолчанию
  const videoSrc = method.video_url && !videoFailed ? method.video_url : DEFAULT_VIDEO

  return (
    <>
      <div className="media-container">
        <video
          key={videoSrc}
          className="feed-video"
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          onError={() => setVideoFailed(true)}
        />
      </div>

      <div className="content-bottom-group">
        <section className="info-block">
          <h2 className="info-title">{method.title}</h2>
          {method.description && (
            <>
              <p className={`info-text ${expanded ? '' : 'collapsed'}`}>{method.description}</p>
              <button type="button" className="more-btn" onClick={() => setExpanded((state) => !state)}>
                {expanded ? 'меньше' : 'больше'}
              </button>
            </>
          )}
        </section>
      </div>

      <div className="action-buttons-group">
        <div className="action-item">
          <div className="circle-btn" aria-label="Нравится">
            <i className={`bi ${method.is_liked ? 'bi-heart-fill' : 'bi-heart'} action-icon`}></i>
          </div>
          <span className="action-label">{method.likes_count}</span>
        </div>

        <div className="action-item">
          <button type="button" className="circle-btn" aria-label="Дальше" onClick={onNext}>
            <i className="bi bi-arrow-down action-icon"></i>
          </button>
          <span className="action-label">Дальше</span>
        </div>

        <div className="tags-group">
          <div className="tag-badge">
            <i className="bi bi-clock tag-icon" aria-hidden="true"></i>
            <span className="visually-hidden">Время на гигабайт: </span>
            <span className="tag-text">{method.time_in_gb?.toFixed(2) ?? '—'} сек/Гб</span>
          </div>
          <div className="tag-badge" title="Коэффициент надёжности">
            <i className="bi bi-shield-check tag-icon" aria-hidden="true"></i>
            <span className="visually-hidden">Коэффициент надёжности: </span>
            <span className="tag-text">{method.reliability?.toFixed(4) ?? '—'}</span>
          </div>
        </div>
      </div>
    </>
  )
}
