import type { FC } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { logoutRequest } from '../../modules/authApi'
import { clearSession, getAccessToken } from '../../modules/authStorage'
import { formatTimeParam } from '../../modules/filters'
import { useAppDispatch, useAppSelector } from '../../modules/hooks'
import { ROUTES, ROUTE_LABELS } from '../../Routes'
import { clearDraft } from '../../slices/draftSlice'
import { resetFeed, resetFilters } from '../../slices/methodsSlice'
import { clearUser, setAuthLoading } from '../../slices/userSlice'
import './BottomNav.css'

interface NavItem {
  key: 'FEED' | 'ADD' | 'GRID' | 'LOGIN'
  icon: string
  to: string
  active: boolean
}

export const BottomNav: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated)
  const authLoading = useAppSelector((state) => state.user.loading)
  const filters = useAppSelector((state) => state.methods.filters)
  const gridPage = useAppSelector((state) => state.methods.grid.page)
  const gridTo = `${ROUTES.GRID}?min_time=${formatTimeParam(filters.minTime)}&max_time=${formatTimeParam(filters.maxTime)}&page=${gridPage}`

  const items: NavItem[] = [
    {
      key: 'FEED',
      icon: 'bi-play-btn',
      to: ROUTES.FEED,
      active: location.pathname === ROUTES.FEED,
    },
    {
      key: 'ADD',
      icon: 'bi-plus-square',
      to: isAuthenticated ? ROUTES.ADD : ROUTES.LOGIN,
      active: location.pathname === ROUTES.ADD,
    },
    {
      key: 'GRID',
      icon: 'bi-grid',
      to: gridTo,
      active: location.pathname === ROUTES.GRID,
    },
  ]

  if (!isAuthenticated) {
    items.push({
      key: 'LOGIN',
      icon: 'bi-box-arrow-in-right',
      to: ROUTES.LOGIN,
      active: location.pathname === ROUTES.LOGIN,
    })
  }

  const handleLogout = async () => {
    dispatch(setAuthLoading(true))
    try {
      const token = getAccessToken()
      if (token) {
        await logoutRequest(token)
      }
    } catch {
      // Даже если сервер недоступен, локальное состояние нужно очистить.
    } finally {
      clearSession()
      dispatch(clearUser())
      dispatch(clearDraft())
      dispatch(resetFilters())
      dispatch(resetFeed())
      dispatch(setAuthLoading(false))
      navigate(ROUTES.GRID)
    }
  }

  return (
    <nav className="bottom-nav">
      {items.map(({ key, icon, to, active }) => (
        <Link
          key={key}
          to={to}
          className={`nav-item ${active ? 'active' : ''}`}
          aria-current={active ? 'page' : undefined}
        >
          <i className={`bi ${icon} nav-icon`} aria-hidden="true"></i>
          <span className="nav-label">{ROUTE_LABELS[key]}</span>
        </Link>
      ))}

      {isAuthenticated ? (
        <button
          type="button"
          className="nav-item nav-item-button"
          onClick={handleLogout}
          disabled={authLoading}
        >
          <i className="bi bi-box-arrow-right nav-icon" aria-hidden="true"></i>
          <span className="nav-label">Выход</span>
        </button>
      ) : null}
    </nav>
  )
}
