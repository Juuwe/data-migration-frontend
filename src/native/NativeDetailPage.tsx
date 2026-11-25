import { useEffect, useState } from 'react'
import { Alert, Spinner } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'

import { api } from '../api'
import { toFeedMethod } from '../modules/adapters'
import { getRequestErrorMessage } from '../modules/apiError'
import { DEFAULT_IMAGE, DEFAULT_VIDEO, resolveImageUrl, resolveVideoUrl } from '../modules/media'
import type { FeedMethod } from '../modules/types'

// Страница «Подробнее»: изображение, описание и параметры одной услуги
export const NativeDetailPage = () => {
  const { id } = useParams()
  const [method, setMethod] = useState<FeedMethod | null>(null)
  const [requestError, setRequestError] = useState('')
  const methodId = Number(id)
  const isValidId = Number.isInteger(methodId) && methodId > 0
  const error = isValidId ? requestError : 'Некорректный id услуги'

  useEffect(() => {
    if (!isValidId) return
    let actual = true

    // Отдельного метода «услуга по id» в API нет: лента с параметром id возвращает именно её
    api.api
      .methodsFeedList({ id: methodId })
      .then((response) => {
        if (!actual) return
        if (response.data.method) setMethod(toFeedMethod(response.data.method))
        else setRequestError('Услуга не найдена')
      })
      .catch((e) => {
        if (actual) setRequestError(getRequestErrorMessage(e, 'Не удалось загрузить услугу'))
      })

    return () => {
      actual = false
    }
  }, [isValidId, methodId])

  return (
    <section className="native-content">
      <nav className="native-toolbar" aria-label="Навигация">
        <Link to="/" className="btn btn-outline-primary btn-sm">
          ← К списку
        </Link>
        <span>Подробнее</span>
      </nav>

      {error ? <Alert variant="danger">{error}</Alert> : null}
      {!method && !error ? (
        <div className="native-spinner">
          <Spinner animation="border" variant="primary" role="status" />
        </div>
      ) : null}

      {method ? (
        <article className="native-detail">
          <video
            className="native-detail-media"
            src={resolveVideoUrl(method.video_url)}
            poster={resolveImageUrl(method.image_url)}
            controls
            autoPlay
            muted
            loop
            playsInline
            onError={(event) => {
              event.currentTarget.onerror = null
              event.currentTarget.src = DEFAULT_VIDEO
            }}
          />
          <img
            className="native-detail-poster"
            src={resolveImageUrl(method.image_url)}
            alt={method.title}
            onError={(event) => {
              event.currentTarget.onerror = null
              event.currentTarget.src = DEFAULT_IMAGE
            }}
          />
          <div>
            <div className="native-detail-head">
              <h1>{method.title}</h1>
              <span className="native-likes" aria-label={`Количество лайков: ${method.likes_count}`}>
                <i className="bi bi-heart-fill card-like-icon" aria-hidden="true"></i>
                {method.likes_count}
              </span>
            </div>
            <dl className="native-properties">
              <div>
                <dt>Время на 1 Гб</dt>
                <dd>{method.time_in_gb !== null ? `${method.time_in_gb} сек` : '—'}</dd>
              </div>
              <div>
                <dt>Надёжность</dt>
                <dd>{method.reliability !== null ? method.reliability.toFixed(3) : '—'}</dd>
              </div>
            </dl>
            <p>{method.description}</p>
            {method.description_en ? (
              <p className="native-description-en">{method.description_en}</p>
            ) : null}
          </div>
        </article>
      ) : null}
    </section>
  )
}
