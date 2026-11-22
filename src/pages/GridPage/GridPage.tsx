import { useEffect, type FC } from 'react'
import { Alert } from 'react-bootstrap'
import { useSearchParams } from 'react-router-dom'

import { MethodCard } from '../../components/MethodCard/MethodCard'
import { GridSkeleton } from '../../components/Skeletons/Skeletons'
import { TimeRangeFilter } from '../../components/TimeRangeFilter/TimeRangeFilter'
import { MIN_GAP, SLIDER_MAX, SLIDER_MIN } from '../../modules/filters'
import { useAppDispatch, useAppSelector } from '../../modules/hooks'
import { DEFAULT_MAX_TIME, DEFAULT_MIN_TIME } from '../../modules/mock'
import {
  deleteMethod,
  getMethods,
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
    maxTime - minTime >= MIN_GAP

  return isValid
    ? { minTime, maxTime }
    : { minTime: DEFAULT_MIN_TIME, maxTime: DEFAULT_MAX_TIME }
}

export const GridPage: FC = () => {
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useAppSelector((state) => state.methods.filters)
  const { methods, loading, loaded, error } = useAppSelector((state) => state.methods.grid)
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated)

  useEffect(() => {
    dispatch(setFilters(parseRange(searchParams)))
    dispatch(getMethods())
  }, [dispatch, searchParams])

  const handleSearch = () => {
    const nextParams = new URLSearchParams({
      min_time: String(filters.minTime),
      max_time: String(filters.maxTime),
    })

    if (nextParams.toString() === searchParams.toString()) {
      dispatch(getMethods())
    } else {
      setSearchParams(nextParams)
    }
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
      />

      <section className="cards-grid" aria-busy={!loaded || loading}>
        {error && !loading ? <Alert variant="danger" className="grid-alert">{error}</Alert> : null}

        {!loaded || loading ? (
          <GridSkeleton />
        ) : methods.length ? (
          methods.map((method) => (
            <MethodCard
              key={method.id}
              {...method}
              onDelete={
                isAuthenticated && method.created_by_current_user
                  ? () => handleDelete(method.id, method.title)
                  : undefined
              }
            />
          ))
        ) : (
          <p className="no-data">Услуги миграции не найдены</p>
        )}
      </section>
    </>
  )
}
