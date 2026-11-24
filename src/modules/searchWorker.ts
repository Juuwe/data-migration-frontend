// Единственный worker на всё приложение: текстовая CLIP-модель и её эмбеддинги
// должны загружаться один раз, а не при каждом запросе картинки.
type TextRequest = {
  resolve: (embeddings: Record<number, number[]>) => void
  reject: (error: Error) => void
  onProgress: (progress: number) => void
}

type ImageRequest = {
  resolve: (embedding: number[]) => void
  reject: (error: Error) => void
}

interface SearchItem {
  id: number
  description: string
}

let worker: Worker | null = null
let textRequest: TextRequest | null = null
let imageRequest: ImageRequest | null = null

const rejectAll = (error: Error) => {
  textRequest?.reject(error)
  imageRequest?.reject(error)
  textRequest = null
  imageRequest = null
}

const getWorker = (): Worker => {
  if (worker) return worker

  worker = new Worker(new URL('../workers/search.worker.ts', import.meta.url), { type: 'module' })

  worker.onmessage = (event: MessageEvent<{ type: string; data: any }>) => {
    const { type, data } = event.data

    if (type === 'progress') {
      if (textRequest && typeof data?.progress === 'number') {
        textRequest.onProgress(Math.round(data.progress))
      }
      return
    }

    if (type === 'text_embeddings_ready') {
      textRequest?.resolve(data)
      textRequest = null
      return
    }

    if (type === 'image_embedding_ready') {
      imageRequest?.resolve(data)
      imageRequest = null
      return
    }

    if (type === 'error') {
      rejectAll(new Error(String(data ?? 'Не удалось загрузить модель поиска')))
    }
  }

  worker.onerror = (event) => {
    rejectAll(new Error(event.message || 'Ошибка worker-потока поиска'))
    worker?.terminate()
    worker = null
  }

  return worker
}

// Текстовые эмбеддинги считаются только для тех описаний, которых ещё нет в Redux.
export const requestTextEmbeddings = (
  items: SearchItem[],
  onProgress: (progress: number) => void,
): Promise<Record<number, number[]>> =>
  new Promise((resolve, reject) => {
    textRequest = { resolve, reject, onProgress }
    getWorker().postMessage({ type: 'init', data: items })
  })

// Эмбеддинг картинки считается заново на каждый запрос.
export const requestImageEmbedding = (file: File): Promise<number[]> =>
  new Promise((resolve, reject) => {
    imageRequest = { resolve, reject }
    getWorker().postMessage({ type: 'image', data: file })
  })
