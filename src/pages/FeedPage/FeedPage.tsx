import { useEffect, useState, type FC } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { FeedSkeleton } from '../../components/Skeletons/Skeletons'
import { DEFAULT_VIDEO, resolveVideoUrl } from '../../modules/media'
import { useAppDispatch, useAppSelector } from '../../modules/hooks'
import { ROUTES } from '../../Routes'
import { getFeedMethod, setMethodLike } from '../../slices/methodsSlice'
import { IS_TAURI } from '../../modules/tauriConfig'
import './FeedPage.css'

export const FeedPage: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const next = searchParams.get('next') === 'true'

  const method = useAppSelector((state) => state.methods.feed.method)
  const feedKey = useAppSelector((state) => state.methods.feed.key)
  const error = useAppSelector((state) => state.methods.feed.error)
  const loading = useAppSelector((state) => state.methods.feed.loading)
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated)
  const requestKey = `${id ?? ''}:${next ? 'next' : 'current'}`

  // Храним id раскрытой услуги, чтобы при переходе к следующей описание снова было свернуто
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    if (feedKey !== requestKey) {
      dispatch(getFeedMethod({ id, next }))
    }
  }, [dispatch, feedKey, id, next, requestKey])

  if (!method) {
    return error && !loading ? <p className="feed-error feed-error-page">{error}</p> : <FeedSkeleton />
  }

  const expanded = expandedId === method.id

  const handleLike = () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN)
      return
    }

    dispatch(setMethodLike({ id: method.id, like: method.is_liked ? 0 : 1 }))
  }

  return (
    <>
      <div className="media-container">
        <video
          className="feed-video"
          src={resolveVideoUrl(method.video_url)}
          autoPlay
          loop
          muted
          playsInline
          onError={(event) => {
            event.currentTarget.onerror = null
            event.currentTarget.src = DEFAULT_VIDEO
          }}
        />
      </div>

      {error ? <p className="feed-error">{error}</p> : null}

      {method.feed_size ? (
        <div className="feed-position">
          {method.feed_position} / {method.feed_size}
        </div>
      ) : null}

      <div className="content-bottom-group">
        <section className="info-block">
          <h2 className="info-title">{method.title}</h2>
          <div className="expandable-text">
            <p className={expanded ? 'full-text' : 'text-preview'}>{method.description ?? ''}</p>
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
        {!IS_TAURI ? (
          <div className="action-item">
            <button
              type="button"
              className={`circle-btn like-btn ${method.is_liked ? 'is-liked' : ''}`}
              aria-label={method.is_liked ? 'Снять лайк' : 'Нравится'}
              aria-pressed={method.is_liked}
              disabled={loading}
              onClick={handleLike}
            >
              <i className={`bi ${method.is_liked ? 'bi-heart-fill' : 'bi-heart'} action-icon`}></i>
            </button>
            <span className="action-label">{method.likes_count}</span>
          </div>
        ) : null}

        <div className="action-item">
          {loading ? (
            <span className="circle-btn disabled" aria-label="Дальше" aria-disabled="true">
              <i className="bi bi-arrow-down action-icon"></i>
            </span>
          ) : (
            <Link
              to={`${ROUTES.FEED}?id=${method.id}&next=true`}
              className="circle-btn"
              aria-label="Дальше"
            >
              <i className="bi bi-arrow-down action-icon"></i>
            </Link>
          )}
          <span className="action-label">Дальше</span>
        </div>

        <div className="tags-group">
          <div className="tag-badge">
            <i className="bi bi-clock tag-icon" aria-hidden="true"></i>
            <span className="visually-hidden">Время на гигабайт: </span>
            <span className="tag-text">
              {method.time_in_gb !== null ? `${method.time_in_gb.toFixed(2)} сек/Гб` : '—'}
            </span>
          </div>
          <div className="tag-badge" title="Коэффициент надёжности">
            <i className="bi bi-shield-check tag-icon" aria-hidden="true"></i>
            <span className="visually-hidden">Коэффициент надёжности: </span>
            <span className="tag-text">
              {method.reliability !== null ? method.reliability.toFixed(3) : '—'}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
