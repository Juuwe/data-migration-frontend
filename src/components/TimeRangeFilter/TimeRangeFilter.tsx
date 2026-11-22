import type { FC } from 'react'
import { Button } from 'react-bootstrap'

import { MIN_GAP, SLIDER_MAX, SLIDER_MIN } from '../../modules/filters'
import './TimeRangeFilter.css'

const TRACK_OFFSET = 19

interface Props {
  minTime: number
  maxTime: number
  setMinTime: (value: number) => void
  setMaxTime: (value: number) => void
  onSubmit: () => void
  loading?: boolean
}

const formatNumber = (value: number) => Number.parseFloat(value.toFixed(2)).toString()

const trackPosition = (value: number) =>
  `calc(${TRACK_OFFSET}px + (100% - ${TRACK_OFFSET * 2}px) * ${(value - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)})`

export const TimeRangeFilter: FC<Props> = ({
  minTime,
  maxTime,
  setMinTime,
  setMaxTime,
  onSubmit,
  loading = false,
}) => (
  <>
    <form
      id="filter-form"
      className="filter-section"
      onSubmit={(event) => {
        event.preventDefault()
        if (!loading) onSubmit()
      }}
    >
      <div className="filter-header">
        <span className="filter-label">Время за Гб (сек)</span>
        <span className="filter-value">
          {formatNumber(minTime)} — {formatNumber(maxTime)} cек/Гб
        </span>
      </div>

      <div className="range-slider-container">
        <div className="range-track-bg"></div>
        <div
          className="range-track-active"
          style={{
            left: trackPosition(minTime),
            width: `calc(${trackPosition(maxTime)} - ${trackPosition(minTime)})`,
          }}
          aria-hidden="true"
        ></div>
        <input
          type="range"
          name="min_time"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step="0.01"
          value={minTime}
          className="range-input"
          disabled={loading}
          onChange={(event) => setMinTime(Math.min(Number(event.target.value), maxTime - MIN_GAP))}
        />
        <input
          type="range"
          name="max_time"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step="0.01"
          value={maxTime}
          className="range-input"
          disabled={loading}
          onChange={(event) => setMaxTime(Math.max(Number(event.target.value), minTime + MIN_GAP))}
        />
      </div>
    </form>

    <Button className="search-btn" type="submit" form="filter-form" disabled={loading}>
      Найти
    </Button>
  </>
)
