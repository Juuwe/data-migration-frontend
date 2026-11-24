import type { SerializerFeedMethod, SerializerMigrationMethod } from '../api/Api'
import type { FeedMethod, MigrationMethod } from './types'

// Приводим необязательные поля ответа Swagger к обязательной модели интерфейса.
export const toMigrationMethod = (method: SerializerMigrationMethod): MigrationMethod => ({
  id: method.id ?? 0,
  title: method.title ?? '',
  description: method.description ?? null,
  description_en: method.description_en ?? null,
  image_url: method.image_url ?? '',
  video_url: method.video_url ?? '',
  created_by_current_user: method.created_by_current_user ?? false,
  likes_count: method.likes_count ?? 0,
  time_in_gb: method.time_in_gb ?? null,
  reliability: method.reliability ?? null,
})

export const toFeedMethod = (method: SerializerFeedMethod): FeedMethod => ({
  ...toMigrationMethod(method),
  is_liked: method.is_liked ?? false,
  feed_position: method.feed_position,
  feed_size: method.feed_size,
})
