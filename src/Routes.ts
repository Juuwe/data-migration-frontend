export const ROUTES = {
  FEED: '/feed',
  ADD: '/add',
  GRID: '/methods',
  LOGIN: '/login',
}
export type RouteKeyType = keyof typeof ROUTES
export const ROUTE_LABELS: { [key in RouteKeyType]: string } = {
  FEED: 'Лента',
  ADD: 'Добавить',
  GRID: 'Плитка',
  LOGIN: 'Вход',
}
