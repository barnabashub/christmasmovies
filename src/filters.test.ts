import { describe, expect, it } from 'vitest'
import { applyFilters, EMPTY_FILTERS, isFiltering, normalize, parseFilters, serializeFilters, type Filters } from './filters'
import type { RegionData, Title } from './types'

const title = (overrides: Partial<Title> & Pick<Title, 'id' | 'title'>): Title => ({
  kind: 'movie',
  year: 2000,
  countries: ['US'],
  languages: ['en'],
  genres: ['comedy'],
  ...overrides,
})

const titles: Title[] = [
  title({ id: 'elf', title: 'Elf', year: 2003, genres: ['comedy', 'family'], rating: 7 }),
  title({ id: 'pelisky', title: 'Cosy Dens', originalTitle: 'Pelíšky', year: 1999, countries: ['CZ'], languages: ['cs'], rating: 8 }),
  title({
    id: 'friends',
    title: 'The One with the Holiday Armadillo',
    kind: 'episode',
    series: { title: 'Friends', season: 7, episode: 10 },
  }),
  title({ id: 'buek', title: 'BÚÉK', year: 2018, countries: ['HU'], languages: ['hu'], holiday: 'new-year', genres: ['drama'] }),
]

const availability: RegionData = {
  elf: { offers: [{ provider: 8, type: 'flatrate' }], audio: ['en', 'hu'], subtitles: ['hu', 'de'] },
  pelisky: { offers: [{ provider: 2, type: 'rent' }] },
}

const run = (filters: Partial<Filters>) => applyFilters(titles, { ...EMPTY_FILTERS, ...filters }, availability).map((t) => t.id)

describe('applyFilters', () => {
  it('matches accent-insensitively against original and series titles', () => {
    expect(run({ q: 'pelisky' })).toEqual(['pelisky'])
    expect(run({ q: 'friends armadillo' })).toEqual(['friends'])
    expect(run({ q: 'buek' })).toEqual(['buek'])
  })

  it('requires every selected genre', () => {
    expect(run({ genres: ['comedy', 'family'] })).toEqual(['elf'])
  })

  it('treats titles without an occasion as Christmas', () => {
    expect(run({ holiday: 'new-year' })).toEqual(['buek'])
    expect(run({ holiday: 'christmas' })).not.toContain('buek')
  })

  it('filters by kind, country, decade and original language', () => {
    expect(run({ kinds: ['episode'] })).toEqual(['friends'])
    expect(run({ country: 'CZ' })).toEqual(['pelisky'])
    expect(run({ decade: 1990 })).toEqual(['pelisky'])
    expect(run({ language: 'hu' })).toEqual(['buek'])
  })

  it('uses regional availability for provider, streamability, audio and subtitles', () => {
    expect(run({ provider: 2 })).toEqual(['pelisky'])
    expect(run({ streamable: true })).toEqual(['elf'])
    expect(run({ audio: 'hu' }).sort()).toEqual(['buek', 'elf'])
    expect(run({ subtitle: 'de' })).toEqual(['elf'])
  })

  it('sorts', () => {
    expect(run({ sort: 'newest' })[0]).toBe('buek')
    expect(run({ sort: 'rating' })[0]).toBe('pelisky')
  })
})

describe('url state', () => {
  it('round-trips filters', () => {
    const filters: Filters = { ...EMPTY_FILTERS, q: 'elf', kinds: ['movie', 'episode'], genres: ['family'], decade: 2000, provider: 8, streamable: true, sort: 'newest' }
    expect(parseFilters(serializeFilters(filters))).toEqual(filters)
  })

  it('ignores unknown values and reports emptiness', () => {
    const parsed = parseFilters(new URLSearchParams('kind=movie,nope&sort=weird&genre=horror'))
    expect(parsed.kinds).toEqual(['movie'])
    expect(parsed.sort).toBe('relevance')
    expect(isFiltering(EMPTY_FILTERS)).toBe(false)
    expect(isFiltering(parsed)).toBe(true)
  })
})

describe('normalize', () => {
  it('strips diacritics and punctuation', () => {
    expect(normalize('Tři oříšky pro Popelku!')).toBe('tri orisky pro popelku')
  })
})
