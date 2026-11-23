import { GENRES, HOLIDAYS, KINDS, type Genre, type Holiday, type Kind, type RegionData, type Title } from './types'

export const SORTS = ['relevance', 'newest', 'oldest', 'rating', 'title'] as const
export type Sort = (typeof SORTS)[number]

export interface Filters {
  q: string
  kinds: Kind[]
  genres: Genre[]
  holiday?: Holiday
  country?: string
  language?: string
  decade?: number
  provider?: number
  audio?: string
  subtitle?: string
  streamable: boolean
  sort: Sort
}

export const EMPTY_FILTERS: Filters = { q: '', kinds: [], genres: [], streamable: false, sort: 'relevance' }

const STREAMABLE_TYPES = new Set(['flatrate', 'free', 'ads'])

export const normalize = (text: string) =>
  text.toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()

const listOf = <T extends string>(value: string | null, allowed: readonly T[]) =>
  (value?.split(',') ?? []).filter((v): v is T => allowed.includes(v as T))

const oneOf = <T extends string>(value: string | null, allowed: readonly T[]) =>
  allowed.includes(value as T) ? (value as T) : undefined

const numberOf = (value: string | null) => (value && Number.isFinite(Number(value)) ? Number(value) : undefined)

export function parseFilters(params: URLSearchParams): Filters {
  return {
    q: params.get('q') ?? '',
    kinds: listOf(params.get('kind'), KINDS),
    genres: listOf(params.get('genre'), GENRES),
    holiday: oneOf(params.get('occasion'), HOLIDAYS),
    country: params.get('country') ?? undefined,
    language: params.get('lang') ?? undefined,
    decade: numberOf(params.get('decade')),
    provider: numberOf(params.get('provider')),
    audio: params.get('audio') ?? undefined,
    subtitle: params.get('subs') ?? undefined,
    streamable: params.get('streamable') === '1',
    sort: oneOf(params.get('sort'), SORTS) ?? 'relevance',
  }
}

export function serializeFilters(filters: Filters): URLSearchParams {
  const entries: [string, string | number | undefined][] = [
    ['q', filters.q.trim() || undefined],
    ['kind', filters.kinds.join(',') || undefined],
    ['genre', filters.genres.join(',') || undefined],
    ['occasion', filters.holiday],
    ['country', filters.country],
    ['lang', filters.language],
    ['decade', filters.decade],
    ['provider', filters.provider],
    ['audio', filters.audio],
    ['subs', filters.subtitle],
    ['streamable', filters.streamable ? '1' : undefined],
    ['sort', filters.sort === 'relevance' ? undefined : filters.sort],
  ]
  return new URLSearchParams(entries.filter((e): e is [string, string] => e[1] !== undefined).map(([k, v]) => [k, String(v)]))
}

export const isFiltering = (filters: Filters) => serializeFilters(filters).toString() !== ''

export const decadeOf = (year: number) => Math.floor(year / 10) * 10

export const isStreamable = (id: string, availability: RegionData) =>
  availability[id]?.offers.some((o) => STREAMABLE_TYPES.has(o.type)) ?? false

export const searchText = (title: Title) =>
  normalize([title.title, title.originalTitle, title.series?.title, ...Object.values(title.titles ?? {})].filter(Boolean).join(' '))

function relevance(title: Title, query: string) {
  if (!query) return 0
  const primary = normalize(title.title)
  if (primary === query) return 3
  if (primary.startsWith(query)) return 2
  return 1
}

export function audioLanguages(title: Title, availability: RegionData) {
  return new Set([...title.languages, ...(availability[title.id]?.audio ?? [])])
}

export function applyFilters(titles: Title[], filters: Filters, availability: RegionData): Title[] {
  const query = normalize(filters.q)
  const terms = query.split(' ').filter(Boolean)

  const matches = (title: Title) => {
    const region = availability[title.id]
    const text = terms.length ? searchText(title) : ''
    return (
      terms.every((term) => text.includes(term)) &&
      (!filters.kinds.length || filters.kinds.includes(title.kind)) &&
      filters.genres.every((g) => title.genres.includes(g)) &&
      (!filters.holiday || (title.holiday ?? 'christmas') === filters.holiday) &&
      (!filters.country || title.countries.includes(filters.country)) &&
      (!filters.language || title.languages.includes(filters.language)) &&
      (filters.decade === undefined || decadeOf(title.year) === filters.decade) &&
      (filters.provider === undefined || (region?.offers.some((o) => o.provider === filters.provider) ?? false)) &&
      (!filters.audio || audioLanguages(title, availability).has(filters.audio)) &&
      (!filters.subtitle || (region?.subtitles?.includes(filters.subtitle) ?? false)) &&
      (!filters.streamable || isStreamable(title.id, availability))
    )
  }

  const compare: Record<Sort, (a: Title, b: Title) => number> = {
    relevance: (a, b) => relevance(b, query) - relevance(a, query) || (b.rating ?? 0) - (a.rating ?? 0),
    newest: (a, b) => b.year - a.year,
    oldest: (a, b) => a.year - b.year,
    rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
    title: (a, b) => a.title.localeCompare(b.title),
  }

  return titles.filter(matches).sort(compare[filters.sort])
}
