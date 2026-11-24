import { useEffect, useRef, useState, type ChangeEvent, type FC } from 'react'

import './ImageSearch.css'

const TRACK_OFFSET = 19
const MIN_THRESHOLD = 0.4
const MAX_THRESHOLD = 0.9

const thresholdWidth = (value: number) =>
  `calc((100% - ${TRACK_OFFSET * 2}px) * ${
    (value - MIN_THRESHOLD) / (MAX_THRESHOLD - MIN_THRESHOLD)
  })`

interface Props {
  ready: boolean
  progress: number
  imageUrl: string | null
  threshold: number
  topK: number
  error: string | null
  onFile: (file: File | null) => void
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
  error,
  onFile,
  onReset,
  onThreshold,
  onTopK,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const previewUrlRef = useRef<string | null>(null)
  const [localUrl, setLocalUrl] = useState<string | null>(null)

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    },
    [],
  )

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0]
    if (!next) return

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    const url = URL.createObjectURL(next)
    previewUrlRef.current = url
    setLocalUrl(url)
    onFile(next)
  }

  const pickFile = () => inputRef.current?.click()

  const handleReset = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    setLocalUrl(null)
    onFile(null)
    if (inputRef.current) inputRef.current.value = ''
    onReset()
  }

  const preview = localUrl ?? imageUrl

  return (
    <section className="search-section image-search" aria-label="Поиск услуг по изображению">
      <div className="search-section-head">
        <span className="search-section-title">
          <i className="bi bi-camera" aria-hidden="true"></i>
          Поиск по фото
        </span>
        {preview ? (
          <button type="button" className="image-search-reset" onClick={handleReset}>
            Сбросить
          </button>
        ) : null}
      </div>

      <button
        type="button"
        className="image-search-dropzone"
        onClick={pickFile}
        disabled={!ready}
        aria-label="Загрузить изображение для поиска"
      >
        {preview ? (
          <img src={preview} alt="" />
        ) : (
          <>
            <i className="bi bi-image" aria-hidden="true"></i>
            {ready ? 'Загрузить фото' : `Загрузка модели ${progress}%`}
          </>
        )}
      </button>

      <div className="image-search-params">
        <label className="image-search-param">
          <span className="image-search-param-label">
            <span>Порог сходства</span>
            <strong>{threshold.toFixed(2)}</strong>
          </span>
          <div className="range-slider-container image-search-range">
            <div className="range-track-bg"></div>
            <div
              className="range-track-active"
              style={{ left: TRACK_OFFSET, width: thresholdWidth(threshold) }}
              aria-hidden="true"
            ></div>
            <input
              type="range"
              min={MIN_THRESHOLD}
              max={MAX_THRESHOLD}
              step="0.01"
              value={threshold}
              className="range-input"
              onChange={(event) => onThreshold(Number(event.target.value))}
            />
          </div>
        </label>

        <label className="image-search-param image-search-topk">
          <span className="image-search-param-label">TopK</span>
          <input
            type="number"
            min="1"
            max="20"
            value={topK}
            onChange={(event) => onTopK(Number(event.target.value))}
          />
        </label>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="image-search-input"
        onChange={handleFile}
      />

      {error ? <p className="image-search-error">{error}</p> : null}
    </section>
  )
}
