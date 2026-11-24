import { format, type Dictionary } from './i18n'
import { audioLanguages, decadeOf, isStreamable } from './filters'
import type { FilterOptions } from './components/FilterBar'
import type { Provider, RegionData, Title } from './types'

export const FALLBACK_REGIONS = [
  'AR', 'AT', 'AU', 'BE', 'BR', 'CA', 'CH', 'CZ', 'DE', 'DK', 'ES', 'FI', 'FR', 'GB', 'HR', 'HU', 'IE', 'IN', 'IT',
  'JP', 'KR', 'MX', 'NL', 'NO', 'NZ', 'PH', 'PL', 'PT', 'RO', 'RS', 'SE', 'SI', 'SK', 'TR', 'UA', 'US', 'ZA',
]

const HOME_MARKETS = new Set(['US', 'GB'])
const byRating = (a: Title, b: Title) => (b.rating ?? 0) - (a.rating ?? 0) || a.year - b.year
const daysSinceEpoch = () => Math.floor(Date.now() / 86_400_000)

export interface BrowseRow {
  key: string
  heading: string
  titles: Title[]
}

export function buildRows(titles: Title[], availability: RegionData, rows: Dictionary['rows'], regionName: string): BrowseRow[] {
  const pick = (predicate: (title: Title) => boolean, sort = byRating) => titles.filter(predicate).sort(sort)

  return [
    { key: 'streaming', heading: format(rows.streaming, { region: regionName }), titles: pick((t) => isStreamable(t.id, availability)) },
    { key: 'classics', heading: rows.classics, titles: pick((t) => Boolean(t.classic) && t.kind !== 'episode') },
    { key: 'episodes', heading: rows.episodes, titles: pick((t) => t.kind === 'episode') },
    { key: 'world', heading: rows.world, titles: pick((t) => !t.countries.some((c) => HOME_MARKETS.has(c))) },
    { key: 'animated', heading: rows.animated, titles: pick((t) => t.genres.includes('animation')) },
    { key: 'romance', heading: rows.romance, titles: pick((t) => t.genres.includes('romance')) },
    { key: 'mayhem', heading: rows.mayhem, titles: pick((t) => t.genres.some((g) => g === 'action' || g === 'horror' || g === 'thriller')) },
    { key: 'series', heading: rows.series, titles: pick((t) => t.kind === 'series') },
    { key: 'beyond', heading: rows.beyond, titles: pick((t) => Boolean(t.holiday) && t.holiday !== 'christmas') },
    { key: 'recent', heading: rows.recent, titles: pick((t) => t.year >= 2017, (a, b) => b.year - a.year) },
  ]
}

export function pickFeatured(titles: Title[], availability: RegionData) {
  const withArt = titles.filter((t) => t.backdrop && t.kind === 'movie')
  const streamable = withArt.filter((t) => isStreamable(t.id, availability))
  const pool = streamable.length ? streamable : withArt.length ? withArt : titles.filter((t) => t.classic)
  return pool[daysSinceEpoch() % pool.length]
}

export function filterOptions(titles: Title[], availability: RegionData, providers: Record<string, Provider>): FilterOptions {
  const unique = <T,>(values: T[]) => [...new Set(values)]
  const regional = Object.values(availability)
  const titleCounts = new Map<number, number>()
  for (const { offers } of regional) {
    for (const id of new Set(offers.map((o) => o.provider))) titleCounts.set(id, (titleCounts.get(id) ?? 0) + 1)
  }

  return {
    countries: unique(titles.flatMap((t) => t.countries)),
    languages: unique(titles.flatMap((t) => t.languages)),
    decades: unique(titles.map((t) => decadeOf(t.year))).sort((a, b) => a - b),
    providers: [...titleCounts]
      .filter(([id]) => providers[id])
      .sort(([a, x], [b, y]) => y - x || providers[a].name.localeCompare(providers[b].name))
      .map(([id, count]) => ({ id, name: providers[id].name, logo: providers[id].logo, count })),
    audio: regional.some((r) => r.audio) ? unique(titles.flatMap((t) => [...audioLanguages(t, availability)])) : [],
    subtitles: unique(regional.flatMap((r) => r.subtitles ?? [])),
  }
}

export function siblingEpisodes(titles: Title[], episode: Title) {
  if (!episode.series) return []
  const series = episode.series.title
  return titles
    .filter((t) => t.id !== episode.id && t.series?.title === series)
    .sort((a, b) => a.series!.season - b.series!.season || a.series!.episode - b.series!.episode)
}
