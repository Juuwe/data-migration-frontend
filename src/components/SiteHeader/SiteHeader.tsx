import type { FC } from 'react'
import { Link } from 'react-router-dom'

import { ROUTES } from '../../Routes'
import './SiteHeader.css'

// Верхняя навигация классического сайта — показывается только в нативном клиенте.
export const SiteHeader: FC = () => (
  <header className="site-header">
    <div className="site-header-inner">
      <Link to={ROUTES.GRID} className="site-brand">
        <i className="bi bi-database-fill-gear site-brand-icon" aria-hidden="true"></i>
        <span className="site-brand-text">
          <strong>Миграция данных</strong>
          <span>каталог методов переноса</span>
        </span>
      </Link>

      <nav className="site-nav" aria-label="Основная навигация">
        <Link to={ROUTES.GRID} className="site-nav-link">
          Список услуг
        </Link>
      </nav>

      <span className="site-mode-badge">Гостевой режим</span>
    </div>
  </header>
)
