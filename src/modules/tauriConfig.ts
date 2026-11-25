// Настройки для собранного Tauri-приложения.
// В Tauri нельзя использовать localhost: он указывает на само устройство,
// поэтому бэкенд и MinIO должны быть доступны по IP компьютера в локальной сети.
// Замените адрес на IP из вывода `ipconfig` / `hostname -I` перед сборкой.
const TAURI_API_FALLBACK = 'http://172.16.238.23:8081'
const TAURI_S3_FALLBACK = 'http://172.16.238.23:9010'

const windowWithTauri = window as typeof window & {
  __TAURI_INTERNALS__?: unknown
  __TAURI__?: unknown
}

export const IS_TAURI =
  typeof window !== 'undefined' &&
  Boolean(windowWithTauri.__TAURI_INTERNALS__ || windowWithTauri.__TAURI__)

export const TAURI_API_BASE =
  import.meta.env.VITE_TAURI_API_BASE || TAURI_API_FALLBACK

export const TAURI_S3_BASE =
  import.meta.env.VITE_TAURI_S3_BASE || TAURI_S3_FALLBACK

export const API_BASE = IS_TAURI ? TAURI_API_BASE : ''
export const S3_BASE = IS_TAURI ? TAURI_S3_BASE : ''
