// Типы повторяют JSON-ответы бэкенда (internal/app/serializer)

export interface MigrationMethod {
  id: number
  title: string
  description: string | null
  image_url: string
  video_url: string
  created_by_current_user: boolean
  likes_count: number
  time_in_gb: number | null
  reliability: number | null
}

export interface FeedMethod extends MigrationMethod {
  is_liked: boolean
}

export interface GridResponse {
  methods: MigrationMethod[]
  min_time: number
  max_time: number
}

export interface FeedResponse {
  method: FeedMethod
}
