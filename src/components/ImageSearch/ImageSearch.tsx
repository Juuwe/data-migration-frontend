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

  return (
    <section className="image-search" aria-label="Поиск услуг по изображению">
      <div className="image-search-head">
        <div>
          <h2 className="image-search-title">Поиск по изображению</h2>
          <p className="image-search-subtitle">
            CLIP-модель сравнит картинку с английскими описаниями услуг
          </p>
        </div>

        <div className="image-search-actions">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="image-search-input"
            onChange={handleFile}
          />
          <button
            type="button"
            className="image-search-button"
            disabled={!ready}
            onClick={() => inputRef.current?.click()}
          >
            {ready ? 'Загрузить фото' : `Загрузка модели ${progress}%`}
          </button>
          {imageUrl ? (
            <button type="button" className="image-search-reset" onClick={onReset}>
              Сбросить
            </button>
          ) : null}
        </div>
      </div>

      {!ready ? (
        <div className="image-search-progress" aria-label="Загрузка модели">
          <span style={{ width: `${progress}%` }} />
        </div>
      ) : null}

      {error ? <p className="image-search-error">{error}</p> : null}

      <div className="image-search-body">
        <div className="image-search-preview">
          {imageUrl ? (
            <img src={imageUrl} alt="Изображение для поиска" />
          ) : (
            <span>Нет фото</span>
          )}
        </div>

        <div className="image-search-controls">
          <label>
            Порог сходства: <strong>{threshold.toFixed(2)}</strong>
            <input
              type="range"
              min="0.4"
              max="0.9"
              step="0.01"
              value={threshold}
              onChange={(event) => onThreshold(Number(event.target.value))}
            />
          </label>

          <label>
            TopK: <strong>{topK}</strong>
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
      </div>
    </section>
  )
}
