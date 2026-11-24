export const KINDS = ['movie', 'episode', 'series'] as const
export type Kind = (typeof KINDS)[number]

export const GENRES = [
  'action',
  'animation',
  'comedy',
  'drama',
  'family',
  'fantasy',
  'horror',
  'musical',
  'romance',
  'thriller',
] as const
export type Genre = (typeof GENRES)[number]

export const HOLIDAYS = ['christmas', 'new-year'] as const
export type Holiday = (typeof HOLIDAYS)[number]

export interface EpisodeRef {
  title: string
  season: number
  episode: number
  firstAired?: number
}

export interface CatalogEntry {
  id: string
  kind: Kind
  title: string
  originalTitle?: string
  year: number
  countries: string[]
  languages: string[]
  genres: Genre[]
  holiday?: Holiday
  classic?: boolean
  series?: EpisodeRef
  tmdbId?: number
}

export interface Enrichment {
  tmdbId: number
  imdbId?: string
  poster?: string
  backdrop?: string
  rating?: number
  runtime?: number
  titles: Record<string, string>
  overviews: Record<string, string>
  streamingRegions: string[]
  episodePosition?: { season: number; episode: number }
}

export const MONETIZATIONS = ['flatrate', 'free', 'ads', 'rent', 'buy'] as const
export type Monetization = (typeof MONETIZATIONS)[number]

export interface Offer {
  provider: number
  type: Monetization
}

export interface RegionAvailability {
  link?: string
  offers: Offer[]
  audio?: string[]
  subtitles?: string[]
  deepLinks?: Record<string, string>
}

export type RegionData = Record<string, RegionAvailability>

export interface Provider {
  name: string
  logo?: string
  priority: number
}

export interface DataMeta {
  syncedAt: string
  regions: string[]
  hasLanguageData: boolean
}

export interface Title extends CatalogEntry, Partial<Omit<Enrichment, 'tmdbId' | 'episodePosition'>> {}
