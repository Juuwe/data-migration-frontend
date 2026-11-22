import { Api } from './Api'
import { getAccessToken } from '../modules/authStorage'

export const api = new Api({
  baseURL: '/',
  timeout: 6000,
  // JWT читается из localStorage/cookie и передаётся в каждом запросе к домену услуг.
  securityWorker: () => {
    const token = getAccessToken()
    return token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
  },
})
