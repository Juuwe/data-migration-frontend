import { useEffect, useState, type ChangeEvent, type FC, type FormEvent } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { Navigate, useNavigate } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../modules/hooks'
import { resolveImageUrl, resolveVideoUrl } from '../../modules/media'
import type { MigrationMethod } from '../../modules/types'
import { ROUTES } from '../../Routes'
import { createDraft, getDraft, publishDraft, setDraftError } from '../../slices/draftSlice'
import './AddPage.css'

interface PublishFormProps {
  draft: MigrationMethod
  loading: boolean
}

const PublishForm: FC<PublishFormProps> = ({ draft, loading }) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [description, setDescription] = useState(draft.description ?? '')
  const [timeInGb, setTimeInGb] = useState(draft.time_in_gb?.toString() ?? '0.1')
  const [reliability, setReliability] = useState(draft.reliability?.toString() ?? '0.99')

  const handlePublish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const parsedTime = Number.parseFloat(timeInGb)
    const parsedReliability = Number.parseFloat(reliability)

    if (!description.trim()) {
      dispatch(setDraftError('Введите краткое описание услуги'))
      return
    }
    if (!Number.isFinite(parsedTime) || parsedTime <= 0) {
      dispatch(setDraftError('Время на 1 Гб должно быть больше нуля'))
      return
    }
    if (!Number.isFinite(parsedReliability) || parsedReliability < 0 || parsedReliability > 1) {
      dispatch(setDraftError('Коэффициент надёжности должен быть от 0 до 1'))
      return
    }

    dispatch(setDraftError(null))
    try {
      const method = await dispatch(
        publishDraft({
          description: description.trim(),
          time_in_gb: parsedTime,
          reliability: parsedReliability,
        }),
      ).unwrap()
      navigate(`${ROUTES.FEED}?id=${method.id}`)
    } catch {
      // Текст ошибки уже записан в Redux.
    }
  }

  return (
    <Form className="add-form" onSubmit={handlePublish}>
      <div className="add-section">
        <h3 className="add-section-title">{draft.title}</h3>

        <div className="draft-media">
          <img src={resolveImageUrl(draft.image_url)} alt={draft.title} />
          <video src={resolveVideoUrl(draft.video_url)} muted loop autoPlay playsInline />
        </div>
      </div>

      <div className="add-section">
        <h3 className="add-section-title">Описание</h3>

        <Form.Group controlId="draft-description">
          <Form.Label>Краткое описание</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Опишите метод миграции"
            disabled={loading}
            required
          />
        </Form.Group>
      </div>

      <div className="add-section">
        <h3 className="add-section-title">Параметры миграции</h3>

        <Form.Group controlId="draft-time">
          <Form.Label>Время на 1 Гб, сек</Form.Label>
          <Form.Control
            type="number"
            min="0.01"
            step="0.01"
            value={timeInGb}
            onChange={(event) => setTimeInGb(event.target.value)}
            disabled={loading}
            required
          />
        </Form.Group>

        <Form.Group controlId="draft-reliability">
          <Form.Label>Коэффициент надёжности</Form.Label>
          <Form.Control
            type="number"
            min="0"
            max="1"
            step="0.0001"
            value={reliability}
            onChange={(event) => setReliability(event.target.value)}
            disabled={loading}
            required
          />
        </Form.Group>
      </div>

      <Button className="add-submit" type="submit" disabled={loading}>
        Опубликовать
      </Button>
    </Form>
  )
}

export const AddPage: FC = () => {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated)
  const email = useAppSelector((state) => state.user.email)
  const { draft, loading, error } = useAppSelector((state) => state.draft)

  const [title, setTitle] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [video, setVideo] = useState<File | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getDraft())
    }
  }, [dispatch, isAuthenticated])

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title.trim()) {
      dispatch(setDraftError('Введите название услуги'))
      return
    }
    if (!image || !video) {
      dispatch(setDraftError('Выберите изображение и видео'))
      return
    }

    dispatch(setDraftError(null))
    try {
      await dispatch(createDraft({ title: title.trim(), image, video })).unwrap()
    } catch {
      // Текст ошибки уже записан в Redux.
    }
  }

  return (
    <section className="add-page">
      <h2 className="add-title">Добавление услуги</h2>
      <p className="add-subtitle">Вы вошли как {email}</p>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      {draft === null ? (
        <Form className="add-form" onSubmit={handleCreate}>
          <div className="add-section">
            <h3 className="add-section-title">Карточка услуги</h3>

            <Form.Group controlId="draft-title">
              <Form.Label>Название</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Например, потоковая миграция"
                maxLength={255}
                disabled={loading}
                required
              />
            </Form.Group>
          </div>

          <div className="add-section">
            <h3 className="add-section-title">Медиафайлы</h3>

            <Form.Group controlId="draft-image">
              <Form.Label>Изображение</Form.Label>
              <Form.Control
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setImage(event.target.files?.[0] ?? null)
                }
                disabled={loading}
                required
              />
            </Form.Group>

            <Form.Group controlId="draft-video">
              <Form.Label>Видео</Form.Label>
              <Form.Control
                type="file"
                accept="video/mp4,video/webm"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setVideo(event.target.files?.[0] ?? null)
                }
                disabled={loading}
                required
              />
            </Form.Group>
          </div>

          <Button className="add-submit" type="submit" disabled={loading}>
            Далее
          </Button>
        </Form>
      ) : (
        <PublishForm key={draft.id} draft={draft} loading={loading} />
      )}
    </section>
  )
}
