import type { FC } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES, ROUTE_LABELS, type RouteKeyType } from '../../Routes'
import './BottomNav.css'

interface NavItem {
  key: RouteKeyType
  icon: string
  disabled?: boolean
}

// Добавление и вход станут доступны после авторизации
const NAV_ITEMS: NavItem[] = [
  { key: 'FEED', icon: 'bi-play-btn' },
  { key: 'ADD', icon: 'bi-plus-square', disabled: true },
  { key: 'GRID', icon: 'bi-grid' },
  { key: 'LOGIN', icon: 'bi-box-arrow-in-right', disabled: true },
]

export const BottomNav: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ key, icon, disabled }) => {
        const isActive = location.pathname.startsWith(ROUTES[key])
        return (
          <button
            key={key}
            type="button"
            className={`nav-item ${isActive ? 'active' : ''}`}
            disabled={disabled}
            onClick={() => navigate(ROUTES[key])}
          >
            <i className={`bi ${icon} nav-icon`}></i>
            <span className="nav-label">{ROUTE_LABELS[key]}</span>
          </button>
        )
      })}
    </nav>
  )
}
