import type { FC } from 'react'

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

const formatNumber = (value: number) => value.toFixed(2)

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
  <form
    id="filter-form"
    className="search-section"
    onSubmit={(event) => {
      event.preventDefault()
      if (!loading) onSubmit()
    }}
  >
    <div className="search-section-head">
      <span className="search-section-title">Время за ГБ</span>
      <span className="search-section-value">
        {formatNumber(minTime)} — {formatNumber(maxTime)} сек/ГБ
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
)
