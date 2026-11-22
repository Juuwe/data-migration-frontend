import { useState, type FC, type FormEvent } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { Navigate, useNavigate } from 'react-router-dom'

import { getHttpStatus } from '../../modules/apiError'
import { loginRequest } from '../../modules/authApi'
import { saveSession } from '../../modules/authStorage'
import { useAppDispatch, useAppSelector } from '../../modules/hooks'
import { ROUTES } from '../../Routes'
import { clearDraft } from '../../slices/draftSlice'
import { setAuthError, setAuthLoading, setUser } from '../../slices/userSlice'
import './LoginPage.css'

const getLoginErrorMessage = (error: unknown): string => {
  const status = getHttpStatus(error)

  if (status === 401) return 'Неверный email или пароль'
  if (status === 400) return 'Проверьте email и пароль'
  return 'Сервис авторизации недоступен, попробуйте позже'
}

export const LoginPage: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.user)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (isAuthenticated) {
    return <Navigate to={ROUTES.GRID} replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim() || !password) {
      dispatch(setAuthError('Заполните email и пароль'))
      return
    }

    dispatch(setAuthLoading(true))

    try {
      const credentials = { email: email.trim(), password }
      const tokens = await loginRequest(credentials)
      if (!tokens.access_token) {
        throw new Error('Сервер не вернул access-токен')
      }

      saveSession(tokens.access_token, credentials.email, tokens.expires_in)
      dispatch(setUser({ email: credentials.email }))
      dispatch(clearDraft())
      navigate(ROUTES.GRID)
    } catch (requestError) {
      dispatch(setAuthError(getLoginErrorMessage(requestError)))
    } finally {
      dispatch(setAuthLoading(false))
    }
  }

  return (
    <section className="login-page">
      <Form className="login-card" onSubmit={handleSubmit}>
        <h2 className="login-title">Вход</h2>

        {error ? <Alert variant="danger">{error}</Alert> : null}

        <Form.Group controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
            autoComplete="current-password"
            disabled={loading}
            required
          />
        </Form.Group>

        <Button className="login-submit" type="submit" disabled={loading}>
          Войти
        </Button>
      </Form>
    </section>
  )
}
