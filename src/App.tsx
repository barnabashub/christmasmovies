import { useCallback, useMemo } from 'react'
import { DEFAULT_REGION, LOCALES, type Locale } from './config'
import { AppProvider } from './context'
import { buildRows, FALLBACK_REGIONS, filterOptions, pickFeatured, siblingEpisodes } from './browse'
import { DetailModal } from './components/DetailModal'
import { FilterBar } from './components/FilterBar'
import { Footer } from './components/Footer'
import { Grid } from './components/Grid'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Row } from './components/Row'
import { useCatalog } from './data'
import { applyFilters, EMPTY_FILTERS, isFiltering, parseFilters, serializeFilters, type Filters } from './filters'
import { usePersistentState, useHashParams } from './hooks'
import { detectLocale, detectRegion, dictionaries, displayNames } from './i18n'

export function App() {
  const [locale, setLocale] = usePersistentState<Locale>('christmas-movies.locale', detectLocale)
  const [region, setRegion] = usePersistentState('christmas-movies.region', () => detectRegion(DEFAULT_REGION))
  const [params, setParams] = useHashParams()
  const { titles, availability, providers, meta } = useCatalog(region)

  const safeLocale = LOCALES.includes(locale) ? locale : 'en'
  const filters = useMemo(() => parseFilters(params), [params])
  const openId = params.get('title')
  const openTitle = titles.find((t) => t.id === openId)

  const setFilters = useCallback(
    (next: Filters) => {
      const serialized = serializeFilters(next)
      if (openId) serialized.set('title', openId)
      setParams(serialized)
    },
    [openId, setParams],
  )

  const openDetails = useCallback(
    (id: string) => {
      const next = serializeFilters(filters)
      next.set('title', id)
      setParams(next, { push: true })
    },
    [filters, setParams],
  )

  const closeDetails = useCallback(() => setParams(serializeFilters(filters)), [filters, setParams])

  const regionName = displayNames(safeLocale).region(region)
  const results = useMemo(() => applyFilters(titles, filters, availability), [titles, filters, availability])
  const rows = useMemo(
    () => buildRows(titles, availability, dictionaries[safeLocale].rows, regionName),
    [titles, availability, safeLocale, regionName],
  )
  const options = useMemo(() => filterOptions(titles, availability, providers), [titles, availability, providers])
  const featured = useMemo(() => pickFeatured(titles, availability), [titles, availability])
  const browsing = !isFiltering(filters)

  return (
    <AppProvider locale={safeLocale} region={region}>
      <Header
        query={filters.q}
        regions={meta?.regions ?? FALLBACK_REGIONS}
        onQuery={(q) => setFilters({ ...filters, q })}
        onRegion={setRegion}
        onLocale={setLocale}
        onHome={() => setFilters(EMPTY_FILTERS)}
      />
      <main>
        {browsing && <Hero title={featured} onOpen={openDetails} />}
        <FilterBar filters={filters} options={options} onChange={setFilters} />
        {browsing ? (
          rows.map((row) => <Row key={row.key} heading={row.heading} titles={row.titles} availability={availability} onOpen={openDetails} />)
        ) : (
          <Grid titles={results} availability={availability} onOpen={openDetails} />
        )}
      </main>
      <Footer syncedAt={meta?.syncedAt} />
      {openTitle && (
        <DetailModal
          key={openTitle.id}
          title={openTitle}
          availability={availability[openTitle.id]}
          providers={providers}
          synced={Boolean(meta?.regions.includes(region))}
          hasLanguageData={Boolean(meta?.hasLanguageData)}
          siblings={siblingEpisodes(titles, openTitle)}
          onOpen={openDetails}
          onClose={closeDetails}
        />
      )}
    </AppProvider>
  )
}
