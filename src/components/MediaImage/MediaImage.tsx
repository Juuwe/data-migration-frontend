import { useState, type FC } from 'react'
import { DEFAULT_IMAGE } from '../../modules/media'

interface Props {
  src: string
  alt: string
  className?: string
}

// Если url пустой или файл недоступен (например, MinIO не запущен), показываем изображение по умолчанию
export const MediaImage: FC<Props> = ({ src, alt, className }) => {
  const [failedSrc, setFailedSrc] = useState('')
  const imageSrc = src && src !== failedSrc ? src : DEFAULT_IMAGE

  return <img src={imageSrc} alt={alt} className={className} onError={() => setFailedSrc(src)} />
}
