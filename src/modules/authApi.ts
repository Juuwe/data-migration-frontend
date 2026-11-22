import axios from 'axios'

import type { HandlerCredentials, SerializerTokenResponse, SerializerUser } from '../api/Api'

// Авторизация и деавторизация идут напрямую через axios, без кодогенерации и thunk.
const authClient = axios.create({ baseURL: '/', timeout: 6000 })

export const loginRequest = async (credentials: HandlerCredentials) => {
  const response = await authClient.post<SerializerTokenResponse>('/api/users/login', credentials)
  return response.data
}

export const registerRequest = async (credentials: HandlerCredentials) => {
  const response = await authClient.post<SerializerUser>('/api/users', credentials)
  return response.data
}

export const logoutRequest = async (token: string) => {
  await authClient.post('/api/users/logout', undefined, {
    headers: { Authorization: `Bearer ${token}` },
  })
}
