import { useRef, type ChangeEvent, type FC } from 'react'

import './ImageSearch.css'

interface Props {
  ready: boolean
  progress: number
  imageUrl: string | null
  threshold: number
  topK: number
  resultCount: number | null
  error: string | null
  onImage: (file: File) => void
  onReset: () => void
  onThreshold: (value: number) => void
  onTopK: (value: number) => void
}

export const ImageSearch: FC<Props> = ({
  ready,
  progress,
  imageUrl,
  threshold,
  topK,
  resultCount,
  error,
  onImage,
  onReset,
  onThreshold,
  onTopK,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) onImage(file)
  }

  const pickFile = () => inputRef.current?.click()

  return (
    <section className="control-card image-search" aria-label="Поиск услуг по изображению">
      <div className="control-card-head">
        <span className="control-card-title">
          <i className="bi bi-camera" aria-hidden="true"></i>
          Поиск по фото
        </span>
        {imageUrl ? (
          <button type="button" className="image-search-reset" onClick={onReset}>
            Сбросить
          </button>
        ) : null}
      </div>

      <div className="image-search-body">
        <button
          type="button"
          className="image-search-preview"
          onClick={pickFile}
          disabled={!ready}
          aria-label="Загрузить изображение для поиска"
        >
          {imageUrl ? (
            <img src={imageUrl} alt="Изображение для поиска" />
          ) : (
            <span className="image-search-preview-empty">
              <i className="bi bi-image" aria-hidden="true"></i>
              Фото
            </span>
          )}
        </button>

        <div className="image-search-controls">
          <button
            type="button"
            className="image-search-upload"
            disabled={!ready}
            onClick={pickFile}
          >
            {ready ? 'Загрузить фото' : `Модель ${progress}%`}
          </button>

          <label>
            <span>Порог</span>
            <input
              type="range"
              min="0.4"
              max="0.9"
              step="0.01"
              value={threshold}
              onChange={(event) => onThreshold(Number(event.target.value))}
            />
            <strong>{threshold.toFixed(2)}</strong>
          </label>

          <label>
            <span>TopK</span>
            <input
              type="number"
              min="1"
              max="20"
              value={topK}
              onChange={(event) => onTopK(Number(event.target.value))}
            />
          </label>

          {resultCount !== null ? (
            <p className="image-search-count">Найдено: {resultCount}</p>
          ) : null}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="image-search-input"
          onChange={handleFile}
        />
      </div>

      {!ready ? (
        <div className="image-search-progress" aria-label="Загрузка модели">
          <span style={{ width: `${progress}%` }} />
        </div>
      ) : null}

      {error ? <p className="image-search-error">{error}</p> : null}
    </section>
  )
}
