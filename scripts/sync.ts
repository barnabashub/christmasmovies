import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { LOCALES } from '../src/config.ts'
import {
  MONETIZATIONS,
  type CatalogEntry,
  type DataMeta,
  type Enrichment,
  type Offer,
  type Provider,
  type RegionData,
} from '../src/types.ts'

interface SearchResult {
  id: number
  release_date?: string
  first_air_date?: string
}

interface Translation {
  iso_639_1: string
  iso_3166_1: string
  data: { title?: string; name?: string; overview?: string }
}

interface ProviderEntry {
  provider_id: number
  provider_name: string
  logo_path?: string
  display_priority: number
}

type RegionProviders = { link?: string } & Partial<Record<(typeof MONETIZATIONS)[number], ProviderEntry[]>>

interface Details {
  id: number
  name?: string
  poster_path?: string
  backdrop_path?: string
  vote_average?: number
  runtime?: number
  episode_run_time?: number[]
  imdb_id?: string
  external_ids?: { imdb_id?: string }
  translations?: { translations: Translation[] }
  'watch/providers'?: { results: Record<string, RegionProviders> }
}

interface SeasonEpisode {
  episode_number: number
  name: string
}

interface StreamingOption {
  audios?: { language: string }[]
  subtitles?: { locale: { language: string } }[]
}

const TMDB = 'https://api.themoviedb.org/3'
const STREAMING_AVAILABILITY = 'https://streaming-availability.p.rapidapi.com'
const OUT = new URL('../public/data/', import.meta.url)
const PREFERRED_COUNTRY: Record<string, string> = { en: 'US', hu: 'HU', de: 'DE' }
const STREAMABLE = new Set(['flatrate', 'free', 'ads'])
const BIBLIOGRAPHIC_CODES: Record<string, string> = {
  alb: 'sq', arm: 'hy', baq: 'eu', bur: 'my', chi: 'zh', cze: 'cs', dut: 'nl', fre: 'fr', geo: 'ka',
  ger: 'de', gre: 'el', ice: 'is', mac: 'mk', may: 'ms', per: 'fa', rum: 'ro', slo: 'sk', wel: 'cy',
}

const tmdbToken = process.env.TMDB_TOKEN
const rapidApiKey = process.env.RAPIDAPI_KEY

if (!tmdbToken) {
  console.error('TMDB_TOKEN (a TMDB API read access token) is required.')
  process.exit(1)
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function request<T>(url: URL, headers: Record<string, string>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, { headers: { accept: 'application/json', ...headers } })
    if (response.ok) return (await response.json()) as T
    if ((response.status === 429 || response.status >= 500) && attempt < 5) {
      await sleep(attempt * 1500)
      continue
    }
    throw new Error(`${response.status} ${url.pathname}`)
  }
}

function tmdb<T>(path: string, params: Record<string, string | number> = {}) {
  const url = new URL(TMDB + path)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value))
  return request<T>(url, { Authorization: `Bearer ${tmdbToken}` })
}

const memo = new Map<string, Promise<unknown>>()
function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  if (!memo.has(key)) memo.set(key, load())
  return memo.get(key) as Promise<T>
}

const GENERIC_EPISODE_NAME = /^(\p{L}+\.?\s*)?\d+\.?(\s*\p{L}+\.?)?$/u
const normalize = (text: string) => text.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]/gu, '')
const yearOf = (date?: string) => (date ? Number(date.slice(0, 4)) : NaN)

async function search(type: 'movie' | 'tv', titles: (string | undefined)[], year: number) {
  for (const query of new Set(titles.filter(Boolean) as string[])) {
    const { results } = await tmdb<{ results: SearchResult[] }>(`/search/${type}`, { query })
    const match = results.find((r) => Math.abs(yearOf(r.release_date ?? r.first_air_date) - year) <= 1)
    if (match) return match.id
  }
  return undefined
}

const detailsParams = { append_to_response: 'watch/providers,external_ids,translations' }

function loadShow(type: 'movie' | 'tv', id: number) {
  return cached(`${type}/${id}`, () => tmdb<Details>(`/${type}/${id}`, detailsParams))
}

function pickTranslations(translations: Translation[] = [], field: 'title' | 'name' | 'overview') {
  const picked: Record<string, string> = {}
  for (const locale of LOCALES) {
    const candidates = translations.filter((t) => {
      const value = t.data[field]?.trim()
      return t.iso_639_1 === locale && value && !(field === 'name' && GENERIC_EPISODE_NAME.test(value))
    })
    const best = candidates.find((t) => t.iso_3166_1 === PREFERRED_COUNTRY[locale]) ?? candidates[0]
    if (best) picked[locale] = best.data[field]!.trim()
  }
  return picked
}

async function resolveEpisode(entry: CatalogEntry, showId: number) {
  const { season, episode, title } = entry.series!
  const { episodes } = await cached(`season/${showId}/${season}`, () =>
    tmdb<{ episodes: SeasonEpisode[] }>(`/tv/${showId}/season/${season}`),
  )
  const byName = episodes.find((e) => normalize(e.name) === normalize(entry.title))
  if (!byName) console.warn(`⚠ ${entry.id}: "${entry.title}" not found in ${title} S${season}, using E${episode}`)
  const number = byName?.episode_number ?? episode
  return tmdb<Details & { still_path?: string }>(
    `/tv/${showId}/season/${season}/episode/${number}`,
    { append_to_response: 'translations' },
  )
}

interface Synced {
  enrichment: Enrichment
  providers: Record<string, RegionProviders>
}

async function syncEntry(entry: CatalogEntry): Promise<Synced | undefined> {
  const type = entry.kind === 'movie' ? 'movie' : 'tv'
  const showYear = entry.series?.firstAired ?? entry.year
  const showTitles = entry.series ? [entry.series.title] : [entry.originalTitle, entry.title]
  const id = entry.tmdbId ?? (await search(type, showTitles, showYear))
  if (!id) {
    console.warn(`⚠ ${entry.id}: no TMDB match`)
    return undefined
  }

  const show = await loadShow(type, id)
  const translations = show.translations?.translations
  const providers = show['watch/providers']?.results ?? {}
  const base = {
    tmdbId: show.id,
    imdbId: show.imdb_id ?? show.external_ids?.imdb_id,
    poster: show.poster_path,
    streamingRegions: Object.keys(providers)
      .filter((region) => MONETIZATIONS.some((m) => STREAMABLE.has(m) && providers[region][m]?.length))
      .sort(),
  }

  if (entry.kind === 'episode') {
    const episode = await resolveEpisode(entry, id)
    const episodeTranslations = episode.translations?.translations
    return {
      providers,
      enrichment: {
        ...base,
        backdrop: episode.still_path ?? show.backdrop_path,
        rating: episode.vote_average || undefined,
        runtime: episode.runtime ?? show.episode_run_time?.[0],
        titles: pickTranslations(episodeTranslations, 'name'),
        overviews: pickTranslations(episodeTranslations, 'overview'),
      },
    }
  }

  return {
    providers,
    enrichment: {
      ...base,
      backdrop: show.backdrop_path,
      rating: show.vote_average || undefined,
      runtime: show.runtime ?? show.episode_run_time?.[0],
      titles: pickTranslations(translations, type === 'movie' ? 'title' : 'name'),
      overviews: pickTranslations(translations, 'overview'),
    },
  }
}

function toLanguage(code: string) {
  const lower = code.toLowerCase()
  const mapped = BIBLIOGRAPHIC_CODES[lower] ?? lower
  try {
    return Intl.getCanonicalLocales(mapped)[0]
  } catch {
    return mapped
  }
}

async function loadLanguages(imdbId: string) {
  const url = new URL(`${STREAMING_AVAILABILITY}/shows/${imdbId}`)
  url.searchParams.set('series_granularity', 'show')
  const show = await request<{ streamingOptions?: Record<string, StreamingOption[]> }>(url, {
    'x-rapidapi-key': rapidApiKey!,
    'x-rapidapi-host': new URL(STREAMING_AVAILABILITY).host,
  })
  return Object.entries(show.streamingOptions ?? {}).map(([country, options]) => ({
    region: country.toUpperCase(),
    audio: [...new Set(options.flatMap((o) => o.audios ?? []).map((a) => toLanguage(a.language)))].sort(),
    subtitles: [...new Set(options.flatMap((o) => o.subtitles ?? []).map((s) => toLanguage(s.locale.language)))].sort(),
  }))
}

async function mapLimit<T, R>(items: T[], limit: number, task: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const index = next++
      results[index] = await task(items[index])
    }
  }
  await Promise.all(Array.from({ length: limit }, worker))
  return results
}

const entries: CatalogEntry[] = JSON.parse(await readFile(new URL('../catalog/titles.json', import.meta.url), 'utf8'))
const synced = await mapLimit(entries, 6, async (entry) => {
  try {
    return await syncEntry(entry)
  } catch (error) {
    console.warn(`⚠ ${entry.id}: ${(error as Error).message}`)
    return undefined
  }
})

const enrichment: Record<string, Enrichment> = {}
const providers: Record<string, Provider> = {}
const regions: Record<string, RegionData> = {}

entries.forEach((entry, index) => {
  const result = synced[index]
  if (!result) return
  enrichment[entry.id] = result.enrichment
  for (const [region, available] of Object.entries(result.providers)) {
    const offers: Offer[] = MONETIZATIONS.flatMap((type) =>
      (available[type] ?? []).map((p) => {
        const known = providers[p.provider_id]
        providers[p.provider_id] = {
          name: p.provider_name,
          logo: p.logo_path,
          priority: Math.min(known?.priority ?? Infinity, p.display_priority),
        }
        return { provider: p.provider_id, type }
      }),
    )
    regions[region] ??= {}
    regions[region][entry.id] = { link: available.link, offers }
  }
})

if (!Object.keys(enrichment).length) {
  console.error('✖ No title could be synced — check TMDB_TOKEN.')
  process.exit(1)
}

if (rapidApiKey) {
  await mapLimit(entries, 2, async (entry) => {
    const imdbId = enrichment[entry.id]?.imdbId
    if (!imdbId) return
    try {
      for (const { region, audio, subtitles } of await loadLanguages(imdbId)) {
        regions[region] ??= {}
        regions[region][entry.id] = { ...(regions[region][entry.id] ?? { offers: [] }), audio, subtitles }
      }
    } catch (error) {
      console.warn(`⚠ ${entry.id}: language data unavailable (${(error as Error).message})`)
    }
  })
}

const meta: DataMeta = {
  syncedAt: new Date().toISOString(),
  regions: Object.keys(regions).sort(),
  hasLanguageData: Boolean(rapidApiKey),
}

const availabilityDir = new URL('availability/', OUT)
await rm(availabilityDir, { recursive: true, force: true })
await mkdir(availabilityDir, { recursive: true })
const write = (url: URL, data: unknown) => writeFile(url, JSON.stringify(data))
await Promise.all([
  write(new URL('meta.json', OUT), meta),
  write(new URL('enrichment.json', OUT), enrichment),
  write(new URL('providers.json', OUT), providers),
  ...Object.entries(regions).map(([region, data]) => write(new URL(`${region}.json`, availabilityDir), data)),
])

console.log(`✔ ${Object.keys(enrichment).length}/${entries.length} titles enriched, ${meta.regions.length} regions`)
