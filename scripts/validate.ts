import { readFile } from 'node:fs/promises'
import { GENRES, HOLIDAYS, KINDS, type CatalogEntry } from '../src/types.ts'

const entries: CatalogEntry[] = JSON.parse(await readFile(new URL('../catalog/titles.json', import.meta.url), 'utf8'))
const currentYear = new Date().getFullYear()
const errors: string[] = []
const seen = new Set<string>()

const check = (ok: unknown, id: string, message: string) => {
  if (!ok) errors.push(`${id}: ${message}`)
}

for (const entry of entries) {
  const { id } = entry
  check(/^[a-z0-9-]+$/.test(id), id, 'id must be kebab-case')
  check(!seen.has(id), id, 'duplicate id')
  seen.add(id)
  check(KINDS.includes(entry.kind), id, `unknown kind "${entry.kind}"`)
  check(entry.title?.trim(), id, 'missing title')
  check(Number.isInteger(entry.year) && entry.year > 1890 && entry.year <= currentYear + 1, id, 'invalid year')
  check(entry.countries.length > 0 && entry.countries.every((c) => /^[A-Z]{2}$/.test(c)), id, 'countries must be ISO 3166-1 alpha-2')
  check(entry.languages.length > 0 && entry.languages.every((l) => /^[a-z]{2,3}$/.test(l)), id, 'languages must be ISO 639-1')
  check(entry.genres.length > 0 && entry.genres.every((g) => GENRES.includes(g)), id, 'unknown genre')
  check(!entry.holiday || HOLIDAYS.includes(entry.holiday), id, `unknown holiday "${entry.holiday}"`)
  check((entry.kind === 'episode') === Boolean(entry.series), id, 'episodes (and only episodes) need a series reference')
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`✔ ${entries.length} catalog entries are valid`)
