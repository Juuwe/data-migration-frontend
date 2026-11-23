import { useEffect, useState, type FC } from 'react'
import { Alert, Modal } from 'react-bootstrap'
import { useSearchParams } from 'react-router-dom'

import { MethodCard } from '../../components/MethodCard/MethodCard'
import { Pagination } from '../../components/Pagination/Pagination'
import { GridSkeleton } from '../../components/Skeletons/Skeletons'
import { ImageSearch } from '../../components/ImageSearch/ImageSearch'
import { TimeRangeFilter } from '../../components/TimeRangeFilter/TimeRangeFilter'
import { formatTimeParam, MIN_GAP, SLIDER_MAX, SLIDER_MIN } from '../../modules/filters'
import { useServiceImageSearch } from '../../hooks/useServiceImageSearch'
import { useAppDispatch, useAppSelector } from '../../modules/hooks'
import { DEFAULT_MAX_TIME, DEFAULT_MIN_TIME } from '../../modules/mock'
import {
  deleteMethod,
  getMethods,
  setCurrentPage,
  setFilters,
  setMaxTime,
  setMinTime,
} from '../../slices/methodsSlice'
import './GridPage.css'

const parseRange = (searchParams: URLSearchParams) => {
  if (!searchParams.has('min_time') && !searchParams.has('max_time')) {
    return { minTime: DEFAULT_MIN_TIME, maxTime: DEFAULT_MAX_TIME }
  }

  const minTime = Number.parseFloat(searchParams.get('min_time') ?? '')
  const maxTime = Number.parseFloat(searchParams.get('max_time') ?? '')

  const isValid =
    Number.isFinite(minTime) &&
    Number.isFinite(maxTime) &&
    minTime >= SLIDER_MIN &&
    maxTime <= SLIDER_MAX &&
    maxTime - minTime >= MIN_GAP - 1e-9

  return isValid
    ? { minTime, maxTime }
    : { minTime: DEFAULT_MIN_TIME, maxTime: DEFAULT_MAX_TIME }
}

const parsePage = (searchParams: URLSearchParams) => {
  const page = Number.parseInt(searchParams.get('page') ?? '1', 10)
  return Number.isInteger(page) && page > 0 ? page : 1
}

export const GridPage: FC = () => {
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useAppSelector((state) => state.methods.filters)
  const { methods, loading, loaded, query, page, limit, total, error } = useAppSelector(
    (state) => state.methods.grid,
  )
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated)
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false)
  const imageSearch = useServiceImageSearch(methods)
  const isImageSearchActive = Boolean(imageSearch.imageEmbedding)
  const visibleMethods = isImageSearchActive ? imageSearch.results : methods

  useEffect(() => {
    const range = parseRange(searchParams)
    const requestedPage = parsePage(searchParams)
    dispatch(setFilters(range))
    dispatch(setCurrentPage(requestedPage))

    // Повторно не загружаем уже полученный список при возврате на вкладку.
    const isCached =
      query?.minTime === range.minTime &&
      query.maxTime === range.maxTime &&
      query.page === requestedPage
    if (!isCached) {
      dispatch(getMethods())
    }
  }, [dispatch, searchParams, query])

  const handleSearch = () => {
    const nextParams = new URLSearchParams({
      min_time: formatTimeParam(filters.minTime),
      max_time: formatTimeParam(filters.maxTime),
      page: '1',
    })

    if (nextParams.toString() === searchParams.toString()) {
      dispatch(getMethods())
    } else {
      setSearchParams(nextParams)
    }
  }

  const handlePageChange = (nextPage: number) => {
    setSearchParams({
      min_time: formatTimeParam(filters.minTime),
      max_time: formatTimeParam(filters.maxTime),
      page: String(nextPage),
    })
  }

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Удалить услугу «${title}»?`)) return

    try {
      await dispatch(deleteMethod(id)).unwrap()
      dispatch(getMethods())
    } catch {
      // Текст ошибки уже записан в Redux.
    }
  }

  return (
    <>
      <TimeRangeFilter
        minTime={filters.minTime}
        maxTime={filters.maxTime}
        setMinTime={(value) => dispatch(setMinTime(value))}
        setMaxTime={(value) => dispatch(setMaxTime(value))}
        onSubmit={handleSearch}
        loading={loading}
        onImageSearch={() => setIsImageSearchOpen(true)}
        imageSearchCount={isImageSearchActive ? imageSearch.results.length : null}
      />

      <Modal
        show={isImageSearchOpen}
        onHide={() => setIsImageSearchOpen(false)}
        centered
        size="lg"
        contentClassName="image-search-modal"
      >
        <Modal.Body>
          <ImageSearch
            ready={imageSearch.ready}
            progress={imageSearch.progress}
            imageUrl={imageSearch.imageUrl}
            threshold={imageSearch.threshold}
            topK={imageSearch.topK}
            resultCount={isImageSearchActive ? imageSearch.results.length : null}
            error={imageSearch.error}
            onImage={imageSearch.searchByImage}
            onReset={imageSearch.resetSearch}
            onThreshold={imageSearch.setThreshold}
            onTopK={imageSearch.setTopK}
          />
        </Modal.Body>
      </Modal>

      <section className="cards-grid" aria-busy={loading}>
        {error && !loading ? <Alert variant="danger" className="grid-alert">{error}</Alert> : null}

        {!loaded ? (
          <GridSkeleton />
        ) : visibleMethods.length ? (
          visibleMethods.map((method) => (
            <MethodCard
              key={method.id}
              {...method}
              score={'score' in method && typeof method.score === 'number' ? method.score : undefined}
              onDelete={
                isAuthenticated && method.created_by_current_user
                  ? () => handleDelete(method.id, method.title)
                  : undefined
              }
            />
          ))
        ) : (
          <p className="no-data">
            {isImageSearchActive
              ? 'По изображению ничего не найдено. Уменьшите порог сходства.'
              : 'Услуги миграции не найдены'}
          </p>
        )}
      </section>

      {!isImageSearchActive ? (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          disabled={loading}
        />
      ) : null}
    </>
  )
}
