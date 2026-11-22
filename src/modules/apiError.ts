import axios from 'axios'

export const getHttpStatus = (error: unknown): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined

// Прокси Vite возвращает 5xx, если бэкенд не запущен.
export const isBackendUnavailable = (error: unknown): boolean => {
  const status = getHttpStatus(error)
  return status === undefined || status >= 500
}

export const getRequestErrorMessage = (error: unknown, fallback: string): string => {
  const status = getHttpStatus(error)

  switch (status) {
    case 400:
      return 'Некорректные данные запроса'
    case 401:
      return 'Требуется авторизация'
    case 403:
      return 'Недостаточно прав'
    case 404:
      return 'Услуга не найдена'
    case 409:
      return 'Такая запись уже существует'
    case 413:
      return 'Файл слишком большой'
    default:
      return status && status < 500 ? fallback : 'Сервис недоступен, попробуйте позже'
  }
}
