import { useEffect, useMemo, useState } from 'react'

import { cosineSimilarity } from '../modules/math'
import { getEnglishDescription } from '../modules/searchDescriptions'
import { requestImageEmbedding } from '../modules/searchWorker'
import { useAppDispatch, useAppSelector } from '../modules/hooks'
import { loadTextEmbeddings } from '../slices/searchSlice'
import type { MigrationMethod } from '../modules/types'

export interface SearchableMethod extends MigrationMethod {
  score: number
  isVisible: boolean
}

const DEFAULT_THRESHOLD = 0.4
const DEFAULT_TOP_K = 5
const MIN_THRESHOLD = 0.4
const MAX_THRESHOLD = 0.9
const MAX_TOP_K = 20

export const useServiceImageSearch = (methods: MigrationMethod[]) => {
  const dispatch = useAppDispatch()
  // Текстовые эмбеддинги живут в Redux и не пересчитываются повторно.
  const textEmbeddings = useAppSelector((state) => state.search.textEmbeddings)
  const loading = useAppSelector((state) => state.search.loading)
  const progress = useAppSelector((state) => state.search.progress)
  const searchError = useAppSelector((state) => state.search.error)

  const [imageEmbedding, setImageEmbedding] = useState<number[] | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD)
  const [topK, setTopK] = useState(DEFAULT_TOP_K)

  // Описания берутся из БД (поле description_en), а не из словаря на фронте.
  const searchItems = useMemo(
    () =>
      methods.map((method) => ({
        id: method.id,
        description: getEnglishDescription(method.description_en),
      })),
    [methods],
  )

  const itemsKey = useMemo(
    () => searchItems.map((item) => `${item.id}:${item.description}`).join('|'),
    [searchItems],
  )

  useEffect(() => {
    if (!itemsKey) return
    dispatch(loadTextEmbeddings(searchItems))
  }, [dispatch, itemsKey, searchItems])

  const ready =
    !loading && !searchError && searchItems.every(
      (item) => textEmbeddings[item.id]?.description === item.description,
    )

  const results = useMemo(() => {
    if (!imageEmbedding) {
      return methods.map((method) => ({ ...method, score: 0, isVisible: true }))
    }

    return methods
      .map((method) => {
        const cached = textEmbeddings[method.id]
        // CLIP возвращает косинусную близость; приводим её к шкале 0..1,
        // чтобы рабочий диапазон порога 0.4–0.9 был осмысленным.
        const rawScore = cached ? cosineSimilarity(imageEmbedding, cached.embedding) : -1
        const score = (rawScore + 1) / 2
        return { ...method, score, isVisible: score >= threshold }
      })
      .filter((method) => method.isVisible)
      .sort((left, right) => right.score - left.score)
      .slice(0, topK)
  }, [imageEmbedding, methods, textEmbeddings, threshold, topK])

  const searchByImage = async (file: File) => {
    setImageError(null)
    setImageEmbedding(null)
    setImageUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return URL.createObjectURL(file)
    })

    try {
      setImageEmbedding(await requestImageEmbedding(file))
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Не удалось обработать изображение')
    }
  }

  const resetSearch = () => {
    setImageEmbedding(null)
    setImageError(null)
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
    error: searchError ?? imageError,
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
