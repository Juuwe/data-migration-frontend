// CLIP обучен на английских описаниях, поэтому для поиска
// используются короткие английские описания (50–100 символов).
export const SERVICE_DESCRIPTIONS_EN: Record<string, string> = {
  'Онлайн-миграция': 'Online data migration with minimal service downtime.',
  'Репликация данных': 'Continuous synchronization between source and target systems.',
  'Аудит и валидация': 'Validation of migration strategy and transferred data quality.',
  'Потоковая миграция': 'Gradual transfer of new records without stopping the source.',
  'Миграция без простоя': 'Switch to the target system after synchronizing changes.',
  'Синхронизация архивов': 'Archive transfer with integrity checks for every data package.',
  'Проверка совместимости': 'Assessment of schemas and formats before data migration.',
  'Архивная миграция': 'Legacy data transfer from an archived information system.',
  'Офлайн-миграция': 'Batch transfer of large data volumes during a downtime window.',
  'Гибридная миграция': 'Phased migration with offline loading of the base dataset.',
  'Физическая миграция': 'Transfer of large datasets on secure physical storage devices.',
  'ETL-миграция': 'Data transfer with format and schema transformation.',
  'Преобразование схемы': 'Mapping and transformation of source database fields.',
  'Очистка данных': 'Duplicate removal and normalization before data transfer.',
  'Миграция ЦОД': 'Data transfer between data centers and cloud regions.',
  'Планирование перехода': 'Planning migration stages and control checkpoints.',
  'Резервная площадка': 'Data synchronization with a disaster recovery site.',
  'Тестовый перенос': 'Trial data transfer before the main migration run.',
  'Контроль качества': 'Comparison of migrated data with the original source.',
  'Проверка отката': 'Rollback verification after a failed migration attempt.',
}

const FALLBACK = 'Data migration method for enterprise information systems.'

export const getEnglishDescription = (
  title: string,
  description?: string | null,
): string => {
  const mapped = SERVICE_DESCRIPTIONS_EN[title]
  if (mapped) return mapped

  // Если в БД уже лежит английское описание, используем его.
  if (description && /^[\x20-\x7E]+$/.test(description)) {
    return description
  }

  return FALLBACK
}
