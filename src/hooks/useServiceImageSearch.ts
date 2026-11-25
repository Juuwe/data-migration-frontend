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

// Порог подобран для SigLIP на наших данных: после нормализации (cos + 1) / 2
// значению 0.55 соответствует косинус 0.10. Пары «картинка — описание» с
// косинусом ниже 0.10 дают случайные совпадения, выше — уверенное сходство.
// Поэтому 0.55 отсекает шум, но не отрезает визуально близкие карточки.
export const SIMILARITY_THRESHOLD = 0.55

// На странице каталога 10 карточек, TopK = 5 даёт компактную выдачу
// (половину страницы) и не прячет релевантные результаты.
export const MAX_RESULTS = 5

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
        // чтобы фиксированный порог 0.55 был осмысленным.
        const rawScore = cached ? cosineSimilarity(imageEmbedding, cached.embedding) : -1
        const score = (rawScore + 1) / 2
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
