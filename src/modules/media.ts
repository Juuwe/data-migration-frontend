import { IS_STATIC_MODE } from './env'

const BASE_URL = import.meta.env.BASE_URL

export const DEFAULT_IMAGE = `${BASE_URL}images/default.svg`
export const DEFAULT_VIDEO = `${BASE_URL}videos/default.mp4`

const MINIO_URL = import.meta.env.VITE_MINIO_URL ?? 'http://localhost:9010'

// S3-объекты получаем через прокси Vite, чтобы не зависеть от CORS MinIO.
const resolveMediaProxyUrl = (url: string | null | undefined, fallback: string): string => {
  if (!url || url.startsWith('/static/')) {
    return fallback
  }

  if (url.startsWith(MINIO_URL)) {
    // На GitHub Pages бэкенд и MinIO недоступны, поэтому показываем локальное медиа.
    return IS_STATIC_MODE ? fallback : `/s3${url.slice(MINIO_URL.length)}`
  }

  return url
}

export const resolveImageUrl = (url: string | null | undefined): string =>
  resolveMediaProxyUrl(url, DEFAULT_IMAGE)

export const resolveVideoUrl = (url: string | null | undefined): string =>
  resolveMediaProxyUrl(url, DEFAULT_VIDEO)
