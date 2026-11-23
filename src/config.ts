export const LOCALES = ['en', 'hu', 'de'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_REGION = 'US'

export const TMDB_IMAGE = 'https://image.tmdb.org/t/p'
