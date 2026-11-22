import { resolve } from 'node:path'

import { generateApi } from 'swagger-typescript-api'

const swaggerUrl = process.env.API_SWAGGER_URL ?? 'http://localhost:8081/docs/swagger.yaml'

generateApi({
  name: 'Api.ts',
  output: resolve(process.cwd(), './src/api'),
  url: swaggerUrl,
  httpClientType: 'axios',
  generateClient: true,
  generateRouteTypes: false,
  modular: false,
})
