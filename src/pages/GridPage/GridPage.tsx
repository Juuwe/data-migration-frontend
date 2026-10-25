import { useEffect, useState, type FC } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MethodCard } from '../../components/MethodCard/MethodCard'
import { TimeRangeFilter } from '../../components/TimeRangeFilter/TimeRangeFilter'
import { getMethods } from '../../modules/methodsApi'
import { DEFAULT_MAX_TIME, DEFAULT_MIN_TIME } from '../../modules/mock'
import type { MigrationMethod } from '../../modules/types'
import './GridPage.css'

export const GridPage: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [minTime, setMinTime] = useState(DEFAULT_MIN_TIME)
  const [maxTime, setMaxTime] = useState(DEFAULT_MAX_TIME)
  const [methods, setMethods] = useState<MigrationMethod[]>([])

  useEffect(() => {
    getMethods(
      Number.parseFloat(searchParams.get('min_time') ?? ''),
      Number.parseFloat(searchParams.get('max_time') ?? ''),
    ).then((response) => {
      setMethods(response.methods)
      setMinTime(response.min_time)
      setMaxTime(response.max_time)
    })
  }, [searchParams])

  const handleSearch = () => {
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
        {methods.length ? (
          methods.map((method) => <MethodCard key={method.id} {...method} />)
        ) : (
          <p className="no-data">Услуги миграции не найдены</p>
        )}
      </section>
    </>
  )
}
