import { useEffect, useRef, useState, type ChangeEvent, type FC } from 'react'

import './ImageSearch.css'

interface Props {
  ready: boolean
  progress: number
  imageUrl: string | null
  threshold: number
  topK: number
  error: string | null
  onFile: (file: File | null) => void
  onReset: () => void
}

// Порог и TopK зафиксированы в коде (см. useServiceImageSearch),
// поэтому в интерфейсе они только отображаются.
export const ImageSearch: FC<Props> = ({
  ready,
  progress,
  imageUrl,
  threshold,
  topK,
  error,
  onFile,
  onReset,
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
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    previewUrlRef.current = null
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
        <div className="image-search-param">
          <span className="image-search-param-label">
            <span>Порог сходства</span>
            <strong>{threshold.toFixed(2)}</strong>
          </span>
        </div>

        <div className="image-search-param image-search-topk">
          <span className="image-search-param-label">
            <span>TopK</span>
            <strong>{topK}</strong>
          </span>
        </div>
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
