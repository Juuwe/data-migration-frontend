import { useEffect, useState, type FC } from 'react'
import { Spinner } from 'react-bootstrap'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MethodCard } from '../../components/MethodCard/MethodCard'
import { TimeRangeFilter } from '../../components/TimeRangeFilter/TimeRangeFilter'
import { getMethods } from '../../modules/methodsApi'
import { DEFAULT_MAX_TIME, DEFAULT_MIN_TIME } from '../../modules/mock'
import type { MigrationMethod } from '../../modules/types'
import { ROUTES } from '../../Routes'
import './GridPage.css'

const parseParam = (value: string | null) => (value === null ? undefined : Number(value))

export const GridPage: FC = () => {
  const navigate = useNavigate()
  // Примененный фильтр хранится в адресной строке, как min_time и max_time в API
  const [searchParams, setSearchParams] = useSearchParams()
  const [minTime, setMinTime] = useState(DEFAULT_MIN_TIME)
  const [maxTime, setMaxTime] = useState(DEFAULT_MAX_TIME)
  const [methods, setMethods] = useState<MigrationMethod[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMethods(parseParam(searchParams.get('min_time')), parseParam(searchParams.get('max_time')))
      .then((response) => {
        setMethods(response.methods)
        setMinTime(response.min_time)
        setMaxTime(response.max_time)
      })
      .finally(() => setLoading(false))
  }, [searchParams])

  const handleSearch = () => {
    setLoading(true)
    setSearchParams({ min_time: String(minTime), max_time: String(maxTime) })
  }

  return (
    <>
      <TimeRangeFilter
        minTime={minTime}
        maxTime={maxTime}
        setMinTime={setMinTime}
        setMaxTime={setMaxTime}
        onSubmit={handleSearch}
      />

      <section className="cards-grid">
        {loading && (
          <div className="grid-loader">
            <Spinner animation="border" />
          </div>
        )}
        {!loading && !methods.length && <p className="no-data">Услуги миграции не найдены</p>}
        {!loading &&
          methods.map((method) => (
            <MethodCard
              key={method.id}
              {...method}
              onClick={() => navigate(`${ROUTES.FEED}/${method.id}`)}
            />
          ))}
      </section>
    </>
  )
}
