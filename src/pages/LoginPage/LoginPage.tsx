import { useState, type FC, type FormEvent } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { Navigate, useNavigate } from 'react-router-dom'

import { getHttpStatus } from '../../modules/apiError'
import { loginRequest, registerRequest } from '../../modules/authApi'
import { saveSession } from '../../modules/authStorage'
import { useAppDispatch, useAppSelector } from '../../modules/hooks'
import { ROUTES } from '../../Routes'
import { clearDraft } from '../../slices/draftSlice'
import { setAuthError, setAuthLoading, setUser } from '../../slices/userSlice'
import './LoginPage.css'

type Mode = 'login' | 'register'

const getAuthErrorMessage = (error: unknown, mode: Mode): string => {
  const status = getHttpStatus(error)

  if (status === 401) return 'Неверный email или пароль'
  if (status === 409) return 'Пользователь с таким email уже зарегистрирован'
  if (status === 400) {
    return mode === 'register'
      ? 'Проверьте email, пароль должен содержать от 8 до 72 символов'
      : 'Проверьте email и пароль'
  }
  return 'Сервис авторизации недоступен, попробуйте позже'
}

export const LoginPage: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.user)

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (isAuthenticated) {
    return <Navigate to={ROUTES.GRID} replace />
  }

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode)
    dispatch(setAuthError(null))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim() || !password) {
      dispatch(setAuthError('Заполните email и пароль'))
      return
    }
    if (mode === 'register' && password.length < 8) {
      dispatch(setAuthError('Пароль должен содержать не менее 8 символов'))
      return
    }

    dispatch(setAuthLoading(true))

    try {
      const credentials = { email: email.trim(), password }

      if (mode === 'register') {
        await registerRequest(credentials)
      }

      const tokens = await loginRequest(credentials)
      if (!tokens.access_token) {
        throw new Error('Сервер не вернул access-токен')
      }

      saveSession(tokens.access_token, credentials.email, tokens.expires_in)
      dispatch(setUser({ email: credentials.email }))
      dispatch(clearDraft())
      navigate(ROUTES.GRID)
    } catch (requestError) {
      dispatch(setAuthError(getAuthErrorMessage(requestError, mode)))
    } finally {
      dispatch(setAuthLoading(false))
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-tabs" role="tablist" aria-label="Авторизация">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Вход
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => switchMode('register')}
          >
            Регистрация
          </button>
        </div>

        <h2 className="auth-title">
          {mode === 'login' ? 'Рады снова Вас видеть!' : 'Создание аккаунта'}
        </h2>
        <p className="auth-subtitle">
          {mode === 'login'
            ? 'Войдите, чтобы добавлять услуги, ставить лайки и удалять свои карточки.'
            : 'Зарегистрируйтесь, чтобы публиковать собственные методы миграции данных.'}
        </p>

        {error ? <Alert variant="danger">{error}</Alert> : null}

        <Form onSubmit={handleSubmit} className="auth-form">
          <Form.Group controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="user@example.com"
              autoComplete="email"
              disabled={loading}
              required
            />
          </Form.Group>

          <Form.Group controlId="password">
            <Form.Label>Пароль</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Введите пароль"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={mode === 'register' ? 8 : undefined}
              disabled={loading}
              required
            />
          </Form.Group>

          <Button className="auth-submit" type="submit" disabled={loading}>
            {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </Button>
        </Form>
      </div>
    </section>
  )
}
