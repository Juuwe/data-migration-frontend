const FALLBACK = 'Data migration method for enterprise information systems.'

export const getEnglishDescription = (descriptionEn?: string | null): string => {
  const value = descriptionEn?.trim()
  return value ? value : FALLBACK
}
