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
  <form
    id="filter-form"
    className="search-section filter-section-card"
    onSubmit={(event) => {
      event.preventDefault()
      if (!loading) onSubmit()
    }}
  >
    <div className="control-card-head">
      <span className="control-card-title">Время за ГБ</span>
      <span className="filter-value">
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

    <div className="range-scale" aria-hidden="true">
      <span>{formatNumber(SLIDER_MIN)}</span>
      <span>{formatNumber(SLIDER_MAX)}</span>
    </div>
  </form>
)
