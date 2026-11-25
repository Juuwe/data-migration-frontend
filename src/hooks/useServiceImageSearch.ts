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

export const SIMILARITY_THRESHOLD = 0.55

export const MAX_RESULTS = 5

export const useServiceImageSearch = (methods: MigrationMethod[]) => {
  const dispatch = useAppDispatch()
  const textEmbeddings = useAppSelector((state) => state.search.textEmbeddings)
  const loading = useAppSelector((state) => state.search.loading)
  const progress = useAppSelector((state) => state.search.progress)
  const searchError = useAppSelector((state) => state.search.error)

  const [imageEmbedding, setImageEmbedding] = useState<number[] | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)

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

    const scored = methods.map((method) => {
      const cached = textEmbeddings[method.id]
      const cosine = cached ? cosineSimilarity(imageEmbedding, cached.embedding) : 0
      return { method, cosine: Math.max(0, cosine) }
    })

    const best = Math.max(...scored.map((item) => item.cosine), 0)
    if (best <= 0) return []

    return scored
      .map(({ method, cosine }) => {
        const score = cosine / best
        return { ...method, score, isVisible: score >= SIMILARITY_THRESHOLD }
      })
      .filter((method) => method.isVisible)
      .sort((left, right) => right.score - left.score)
      .slice(0, MAX_RESULTS)
  }, [imageEmbedding, methods, textEmbeddings])

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

  return {
    results,
    ready,
    progress,
    error: searchError ?? imageError,
    imageUrl,
    imageEmbedding,
    threshold: SIMILARITY_THRESHOLD,
    topK: MAX_RESULTS,
    searchByImage,
    resetSearch,
  }
}
