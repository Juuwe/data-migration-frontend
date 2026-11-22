export const DEFAULT_IMAGE = '/images/default.svg'
export const DEFAULT_VIDEO = '/videos/default.mp4'

const MINIO_URL = import.meta.env.VITE_MINIO_URL ?? 'http://localhost:9010'

// S3-объекты получаем через прокси Vite, чтобы не зависеть от CORS MinIO.
const resolveMediaProxyUrl = (url: string | null | undefined, fallback: string): string => {
  if (!url || url.startsWith('/static/')) {
    return fallback
  }

  if (url.startsWith(MINIO_URL)) {
    return `/s3${url.slice(MINIO_URL.length)}`
  }

  return url
}

export const resolveImageUrl = (url: string | null | undefined): string =>
  resolveMediaProxyUrl(url, DEFAULT_IMAGE)

export const resolveVideoUrl = (url: string | null | undefined): string =>
  resolveMediaProxyUrl(url, DEFAULT_VIDEO)
