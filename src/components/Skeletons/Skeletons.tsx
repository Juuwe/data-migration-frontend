import type { FC } from 'react'

import './Skeletons.css'

export const GridSkeleton: FC = () => (
  <>
    {Array.from({ length: 6 }, (_, index) => (
      <div className="skeleton-card" key={index} aria-hidden="true">
        <div className="skeleton-block skeleton-card-media" />
        <div className="skeleton-block skeleton-line skeleton-line-title" />
        <div className="skeleton-block skeleton-line skeleton-line-time" />
      </div>
    ))}
  </>
)

export const FeedSkeleton: FC = () => (
  <div className="feed-skeleton" aria-label="Загрузка услуги">
    <div className="skeleton-block feed-skeleton-video" />

    <div className="feed-skeleton-bottom" aria-hidden="true">
      <div className="skeleton-block skeleton-line feed-skeleton-title" />
      <div className="skeleton-block skeleton-line feed-skeleton-text" />
      <div className="skeleton-block skeleton-line feed-skeleton-text feed-skeleton-text-short" />
    </div>

    <div className="feed-skeleton-actions" aria-hidden="true">
      <div className="skeleton-block feed-skeleton-circle" />
      <div className="skeleton-block feed-skeleton-circle" />
    </div>
  </div>
)

export const AddSkeleton: FC = () => (
  <div className="add-form" aria-label="Загрузка черновика">
    {Array.from({ length: 3 }, (_, index) => (
      <div className="skeleton-panel" key={index} aria-hidden="true">
        <div className="skeleton-block skeleton-panel-title" />
        <div className="skeleton-block skeleton-input" />
        <div className="skeleton-block skeleton-input" />
      </div>
    ))}
  </div>
)

export const LoginSkeleton: FC = () => (
  <div className="login-card" aria-label="Загрузка входа">
    <div className="skeleton-block skeleton-login-title" />

    <div className="skeleton-block skeleton-label" />
    <div className="skeleton-block skeleton-input" />

    <div className="skeleton-block skeleton-label" />
    <div className="skeleton-block skeleton-input skeleton-input-last" />

    <div className="skeleton-block skeleton-login-button" />
  </div>
)
