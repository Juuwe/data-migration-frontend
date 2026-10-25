import type { FC } from 'react'
import { Button } from 'react-bootstrap'
import './TimeRangeFilter.css'

const MIN_GAP = 0.05
const SLIDER_MIN = 0.01
const SLIDER_MAX = 1.0
const TRACK_OFFSET = 19

interface Props {
  minTime: number
  maxTime: number
  setMinTime: (value: number) => void
  setMaxTime: (value: number) => void
  onSubmit: () => void
}

const formatNumber = (value: number) => Number.parseFloat(value.toFixed(2)).toString()

const trackPosition = (value: number) =>
  `calc(${TRACK_OFFSET}px + (100% - ${TRACK_OFFSET * 2}px) * ${(value - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)})`

export const TimeRangeFilter: FC<Props> = ({ minTime, maxTime, setMinTime, setMaxTime, onSubmit }) => (
  <>
    <form
      id="filter-form"
      className="filter-section"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
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
          onChange={(event) => setMaxTime(Math.max(Number(event.target.value), minTime + MIN_GAP))}
        />
      </div>
    </form>

    <Button className="search-btn" type="submit" form="filter-form">
      Найти
    </Button>
  </>
)
