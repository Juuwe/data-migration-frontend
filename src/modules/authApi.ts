import axios from 'axios'

import type { HandlerCredentials, SerializerTokenResponse } from '../api/Api'
import { API_BASE } from './tauriConfig'

// Авторизация и деавторизация идут напрямую через axios, без кодогенерации и thunk.
const authClient = axios.create({ baseURL: API_BASE || '/', timeout: 6000 })

export const loginRequest = async (credentials: HandlerCredentials) => {
  const response = await authClient.post<SerializerTokenResponse>('/api/users/login', credentials)
  return response.data
}

export const logoutRequest = async (token: string) => {
  await authClient.post('/api/users/logout', undefined, {
    headers: { Authorization: `Bearer ${token}` },
  })
}
