import { copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// GitHub Pages отдаёт 404.html для клиентских маршрутов SPA.
await copyFile(resolve('dist/index.html'), resolve('dist/404.html'))
