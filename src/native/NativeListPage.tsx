import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Alert, Button, ProgressBar } from 'react-bootstrap'

import { Pagination } from '../components/Pagination/Pagination'
import { GridSkeleton } from '../components/Skeletons/Skeletons'
import { TimeRangeFilter } from '../components/TimeRangeFilter/TimeRangeFilter'
import { useServiceImageSearch } from '../hooks/useServiceImageSearch'
import { useAppDispatch, useAppSelector } from '../modules/hooks'
import { getMethods, setCurrentPage, setFilters } from '../slices/methodsSlice'
import { NativeMethodCard } from './NativeMethodCard'

// Страница «Список услуг»: фильтр и пагинация выполняются на бэкенде,
// поиск по изображению — среди карточек текущей страницы
export const NativeListPage = () => {
  const dispatch = useAppDispatch()
  const filters = useAppSelector((state) => state.methods.filters)
  const { methods, loading, loaded, page, total, totalPages, error } = useAppSelector(
    (state) => state.methods.grid,
  )
  // Выбранные, но ещё не применённые границы; в Redux попадают по кнопке «Найти»
  const [draft, setDraft] = useState(filters)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const imageSearch = useServiceImageSearch(methods)
  const isSearching = imageSearch.imageEmbedding !== null
  const items = isSearching ? imageSearch.results : methods
  const busy = loading || searching

  // При возврате со страницы «Подробнее» список берётся из Redux
  useEffect(() => {
    if (!loaded) dispatch(getMethods())
  }, [dispatch, loaded])

  // В WebView2 первый сетевой запрос после старта иногда не проходит:
  // повторяем загрузку списка, пока она не удастся (не больше трёх раз).
  const retriesRef = useRef(0)
  useEffect(() => {
    if (!error || retriesRef.current >= 3) return
    retriesRef.current += 1
    const timer = window.setTimeout(() => dispatch(getMethods()), 700 * retriesRef.current)
    return () => window.clearTimeout(timer)
  }, [dispatch, error])

  // Освобождаем ссылку на превью при замене файла и уходе со страницы
  useEffect(() => {
    if (!preview) return
    return () => URL.revokeObjectURL(preview)
  }, [preview])

  // Результат поиска относится к одной странице, поэтому при её смене сбрасывается вместе с файлом
  const clearFile = () => {
    setFile(null)
    setPreview(null)
    imageSearch.resetSearch()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFilter = () => {
    clearFile()
    dispatch(setFilters(draft))
    dispatch(setCurrentPage(1))
    dispatch(getMethods())
  }

  const handlePageChange = (nextPage: number) => {
    clearFile()
    dispatch(setCurrentPage(nextPage))
    dispatch(getMethods())
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const chosen = event.target.files?.[0]
    if (!chosen) return
    imageSearch.resetSearch()
    setFile(chosen)
    setPreview(URL.createObjectURL(chosen))
  }

  const handleImageSearch = async () => {
    if (!file) return
    setSearching(true)
    await imageSearch.searchByImage(file)
    setSearching(false)
  }

  return (
    <section className="native-content">
      <header className="native-header">
        <h1>Список услуг</h1>
        <Button
          variant="outline-primary"
          size="sm"
          disabled={busy}
          onClick={() => {
            clearFile()
            dispatch(getMethods())
          }}
        >
          Обновить
        </Button>
      </header>

      <div className="native-panels">
        <section className="native-panel native-filter" aria-label="Фильтрация">
          <TimeRangeFilter
            minTime={draft.minTime}
            maxTime={draft.maxTime}
            setMinTime={(minTime) => setDraft((previous) => ({ ...previous, minTime }))}
            setMaxTime={(maxTime) => setDraft((previous) => ({ ...previous, maxTime }))}
            onSubmit={handleFilter}
            loading={busy}
          />
        </section>

        <section className="native-panel" aria-label="Поиск по изображению">
          <h2 className="native-panel-title">Поиск по изображению</h2>
          <p className="native-hint">
            Порог сходства 0.55 · TopK 5 · только карточки этой страницы
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="visually-hidden"
            onChange={handleFileChange}
          />
          <div className="native-panel-buttons">
            <Button
              variant="outline-primary"
              disabled={searching}
              onClick={() => fileInputRef.current?.click()}
            >
              Выбрать файл
            </Button>
            <Button disabled={!imageSearch.ready || !file || busy} onClick={handleImageSearch}>
              {searching ? 'Поиск…' : imageSearch.ready ? 'Найти похожие' : 'Загрузка нейросети…'}
            </Button>
          </div>
          {!imageSearch.ready && !imageSearch.error ? (
            <ProgressBar now={imageSearch.progress} label={`${imageSearch.progress}%`} animated />
          ) : null}
          <div className="native-file">
            {preview ? <img src={preview} alt="Изображение для поиска" /> : null}
            <span>{file ? file.name : 'Файл не выбран'}</span>
            {file ? (
              <button type="button" className="native-link" disabled={searching} onClick={clearFile}>
                Сбросить
              </button>
            ) : null}
          </div>
        </section>
      </div>

      {imageSearch.error ? <Alert variant="danger">{imageSearch.error}</Alert> : null}
      {error ? <Alert variant="danger">{error}</Alert> : null}

      <div className="native-results">
        <h2 className="native-panel-title">{isSearching ? 'Результаты поиска' : 'Каталог услуг'}</h2>
        {isSearching ? (
          <button type="button" className="native-link" onClick={clearFile}>
            Весь каталог
          </button>
        ) : !loading && !error && total > 0 ? (
          <span>
            Найдено: {total} · страница {page} из {totalPages}
          </span>
        ) : null}
      </div>

      <div className="native-grid" aria-busy={loading}>
        {loading || !loaded ? (
          <GridSkeleton />
        ) : items.length ? (
          items.map((method) => (
            <NativeMethodCard
              key={method.id}
              method={method}
              score={
                'score' in method && typeof method.score === 'number' ? method.score : undefined
              }
            />
          ))
        ) : !error ? (
          <p className="native-empty">
            {isSearching
              ? 'Похожих услуг на этой странице не найдено.'
              : 'Услуги миграции не найдены'}
          </p>
        ) : null}
      </div>

      {!isSearching ? (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          disabled={busy}
        />
      ) : null}
    </section>
  )
}
