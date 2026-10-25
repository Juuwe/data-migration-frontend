import type { FC } from 'react'
import { NavLink } from 'react-router-dom'
import { ROUTES, ROUTE_LABELS, type RouteKeyType } from '../../Routes'
import './BottomNav.css'

interface NavItem {
  key: RouteKeyType
  icon: string
  disabled?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { key: 'FEED', icon: 'bi-play-btn' },
  { key: 'ADD', icon: 'bi-plus-square', disabled: true },
  { key: 'GRID', icon: 'bi-grid' },
  { key: 'LOGIN', icon: 'bi-box-arrow-in-right', disabled: true },
]

export const BottomNav: FC = () => (
  <nav className="bottom-nav">
    {NAV_ITEMS.map(({ key, icon, disabled }) =>
      disabled ? (
        <span key={key} className="nav-item disabled" aria-disabled="true">
          <i className={`bi ${icon} nav-icon`}></i>
          <span className="nav-label">{ROUTE_LABELS[key]}</span>
        </span>
      ) : (
        <NavLink key={key} to={ROUTES[key]} className="nav-item">
          <i className={`bi ${icon} nav-icon`}></i>
          <span className="nav-label">{ROUTE_LABELS[key]}</span>
        </NavLink>
      ),
    )}
  </nav>
)
