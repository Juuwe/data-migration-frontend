import { Api } from './Api'
import { getAccessToken } from '../modules/authStorage'
import { API_BASE } from '../modules/tauriConfig'

export const api = new Api({
  baseURL: API_BASE || '/',
  timeout: 6000,
  // JWT читается из localStorage/cookie и передаётся в каждом запросе к домену услуг.
  securityWorker: () => {
    const token = getAccessToken()
    return token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
  },
})
