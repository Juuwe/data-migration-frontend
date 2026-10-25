import type { FC } from 'react'
import { Button } from 'react-bootstrap'
import { DEFAULT_MAX_TIME, DEFAULT_MIN_TIME } from '../../modules/mock'
import './TimeRangeFilter.css'

const MIN_GAP = 0.05
const STEP = 0.01

interface Props {
  minTime: number
  maxTime: number
  setMinTime: (value: number) => void
  setMaxTime: (value: number) => void
  onSubmit: () => void
}

const format = (value: number) => Number.parseFloat(value.toFixed(2)).toString()

const toPercent = (value: number) =>
  ((value - DEFAULT_MIN_TIME) / (DEFAULT_MAX_TIME - DEFAULT_MIN_TIME)) * 100

export const TimeRangeFilter: FC<Props> = ({ minTime, maxTime, setMinTime, setMaxTime, onSubmit }) => {
  const handleMinChange = (value: number) => setMinTime(Math.min(value, maxTime - MIN_GAP))
  const handleMaxChange = (value: number) => setMaxTime(Math.max(value, minTime + MIN_GAP))

  const left = toPercent(minTime)
  const right = toPercent(maxTime)

  return (
    <form
      className="filter-section"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <div className="filter-header">
        <span className="filter-label">Время за Гб (сек)</span>
        <span className="filter-value">
          {format(minTime)} — {format(maxTime)} сек/Гб
        </span>
      </div>

      <div className="range-slider-container">
        <div className="range-track-bg"></div>
        <div
          className="range-track-active"
          style={{
            left: `calc(19px + (100% - 38px) * ${left / 100})`,
            width: `calc((100% - 38px) * ${(right - left) / 100})`,
          }}
          aria-hidden="true"
        ></div>
        <input
          type="range"
          className="range-input"
          aria-label="Минимальное время за Гб"
          min={DEFAULT_MIN_TIME}
          max={DEFAULT_MAX_TIME}
          step={STEP}
          value={minTime}
          onChange={(event) => handleMinChange(Number(event.target.value))}
        />
        <input
          type="range"
          className="range-input"
          aria-label="Максимальное время за Гб"
          min={DEFAULT_MIN_TIME}
          max={DEFAULT_MAX_TIME}
          step={STEP}
          value={maxTime}
          onChange={(event) => handleMaxChange(Number(event.target.value))}
        />
      </div>

      <Button type="submit" className="search-btn">
        Найти
      </Button>
    </form>
  )
}
