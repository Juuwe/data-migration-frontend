// CLIP обучен на английских описаниях, поэтому текстовый эмбеддинг считается
// по короткому (50–100 символов) английскому описанию из БД — поле description_en.
const FALLBACK = 'Data migration method for enterprise information systems.'

export const getEnglishDescription = (descriptionEn?: string | null): string => {
  const value = descriptionEn?.trim()
  return value ? value : FALLBACK
}
