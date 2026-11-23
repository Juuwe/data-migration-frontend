import { useEffect, useMemo, useRef, useState } from 'react'

import { cosineSimilarity } from '../modules/math'
import { getEnglishDescription } from '../modules/searchDescriptions'
import type { MigrationMethod } from '../modules/types'

export interface SearchableMethod extends MigrationMethod {
  score: number
  isVisible: boolean
}

type TextEmbeddings = Record<number, number[]>

interface WorkerMessage {
  type: 'progress' | 'text_embeddings_ready' | 'image_embedding_ready' | 'error'
  data: any
}

const DEFAULT_THRESHOLD = 0.4
const DEFAULT_TOP_K = 5
const MIN_THRESHOLD = 0.4
const MAX_THRESHOLD = 0.9
const MAX_TOP_K = 20

export const useServiceImageSearch = (methods: MigrationMethod[]) => {
  const [textEmbeddings, setTextEmbeddings] = useState<TextEmbeddings>({})
  const [imageEmbedding, setImageEmbedding] = useState<number[] | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD)
  const [topK, setTopK] = useState(DEFAULT_TOP_K)
  const workerRef = useRef<Worker | null>(null)

  const searchItems = useMemo(
    () =>
      methods.map((method) => ({
        id: method.id,
        description: getEnglishDescription(method.title, method.description),
      })),
    [methods],
  )

  useEffect(() => {
    const worker = new Worker(new URL('../workers/search.worker.ts', import.meta.url), {
      type: 'module',
    })
    workerRef.current = worker

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const { type, data } = event.data

      if (type === 'progress') {
        if (data?.status === 'ready') {
          setProgress(100)
        } else if (typeof data?.progress === 'number') {
          setProgress(Math.round(data.progress))
        }
      }

      if (type === 'text_embeddings_ready') {
        setTextEmbeddings(data as TextEmbeddings)
        setReady(true)
        setProgress(100)
      }

      if (type === 'image_embedding_ready') {
        setImageEmbedding(data as number[])
      }

      if (type === 'error') {
        setError(String(data ?? 'Не удалось загрузить модель поиска'))
      }
    }

    worker.onerror = (event) => {
      setError(event.message || 'Ошибка worker-потока поиска')
    }

    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!workerRef.current) return

    setReady(false)
    setProgress(0)
    setError(null)
    workerRef.current.postMessage({ type: 'init', data: searchItems })
  }, [searchItems])

  const results = useMemo(() => {
    if (!imageEmbedding) {
      return methods.map((method) => ({ ...method, score: 0, isVisible: true }))
    }

    return methods
      .map((method) => {
        const embedding = textEmbeddings[method.id]
        // CLIP возвращает косинусную близость; приводим её к шкале 0..1,
        // чтобы рабочий диапазон порога 0.4–0.9 был осмысленным.
        const rawScore = embedding ? cosineSimilarity(imageEmbedding, embedding) : -1
        const score = (rawScore + 1) / 2
        return { ...method, score, isVisible: score >= threshold }
      })
      .filter((method) => method.isVisible)
      .sort((left, right) => right.score - left.score)
      .slice(0, topK)
  }, [imageEmbedding, methods, textEmbeddings, threshold, topK])

  const searchByImage = (file: File) => {
    setError(null)
    setImageEmbedding(null)
    setImageUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return URL.createObjectURL(file)
    })
    workerRef.current?.postMessage({ type: 'image', data: file })
  }

  const resetSearch = () => {
    setImageEmbedding(null)
    setError(null)
    setImageUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return null
    })
  }

  const updateThreshold = (value: number) => {
    setThreshold(Math.min(MAX_THRESHOLD, Math.max(MIN_THRESHOLD, value)))
  }

  const updateTopK = (value: number) => {
    setTopK(Math.min(MAX_TOP_K, Math.max(1, Math.round(value))))
  }

  return {
    results,
    ready,
    progress,
    error,
    imageUrl,
    imageEmbedding,
    threshold,
    topK,
    setThreshold: updateThreshold,
    setTopK: updateTopK,
    searchByImage,
    resetSearch,
  }
}
