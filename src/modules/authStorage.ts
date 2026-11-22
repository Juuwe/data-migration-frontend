const TOKEN_KEY = 'data_migration_access_token'
const EMAIL_KEY = 'data_migration_email'
const COOKIE_NAME = 'data_migration_token'

const readCookie = (name: string): string | null => {
  const prefix = `${name}=`
  const cookie = document.cookie.split('; ').find((item) => item.startsWith(prefix))
  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null
}

const writeCookie = (name: string, value: string, maxAge: number) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

const removeCookie = (name: string) => {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
}

export const saveSession = (accessToken: string, email: string, expiresIn?: number) => {
  const maxAge = expiresIn ?? 60 * 60
  localStorage.setItem(TOKEN_KEY, accessToken)
  localStorage.setItem(EMAIL_KEY, email)
  writeCookie(COOKIE_NAME, accessToken, maxAge)
}

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EMAIL_KEY)
  removeCookie(COOKIE_NAME)
}

export const getAccessToken = (): string | null =>
  localStorage.getItem(TOKEN_KEY) ?? readCookie(COOKIE_NAME)
