import { useApp } from '../context'
import { EMPTY_FILTERS, SORTS, isFiltering, type Filters } from '../filters'
import { GENRES, HOLIDAYS, KINDS } from '../types'

export interface FilterOptions {
  countries: string[]
  languages: string[]
  decades: number[]
  providers: { id: number; name: string; count: number }[]
  audio: string[]
  subtitles: string[]
}

interface Props {
  filters: Filters
  options: FilterOptions
  onChange: (filters: Filters) => void
}

const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

interface SelectProps<T extends string | number> {
  label: string
  value?: T
  options: { value: T; label: string }[]
  onChange: (value?: T) => void
}

function Select<T extends string | number>({ label, value, options, onChange }: SelectProps<T>) {
  const { t } = useApp()
  if (!options.length) return null
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <select
        value={value ?? ''}
        onChange={(e) => {
          const picked = options.find((o) => String(o.value) === e.target.value)
          onChange(picked?.value)
        }}
      >
        <option value="">{t.any}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function FilterBar({ filters, options, onChange }: Props) {
  const { t, names, format, region, locale } = useApp()
  const set = <K extends keyof Filters>(key: K) => (value: Filters[K]) => onChange({ ...filters, [key]: value })
  const byName = (a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label, locale)
  const languageOptions = (codes: string[]) => codes.map((c) => ({ value: c, label: names.language(c) })).sort(byName)

  return (
    <section className="filters" aria-label={t.filters}>
      <div className="chips">
        {KINDS.map((kind) => (
          <button
            key={kind}
            className="chip"
            aria-pressed={filters.kinds.includes(kind)}
            onClick={() => set('kinds')(toggle(filters.kinds, kind))}
          >
            {t.kindPlural[kind]}
          </button>
        ))}
        <span className="chips__divider" aria-hidden />
        {GENRES.map((genre) => (
          <button
            key={genre}
            className="chip"
            aria-pressed={filters.genres.includes(genre)}
            onClick={() => set('genres')(toggle(filters.genres, genre))}
          >
            {t.genre[genre]}
          </button>
        ))}
      </div>
      <div className="fields">
        <Select
          label={t.occasion}
          value={filters.holiday}
          options={HOLIDAYS.map((h) => ({ value: h, label: t.holiday[h] }))}
          onChange={set('holiday')}
        />
        <Select
          label={t.country}
          value={filters.country}
          options={options.countries.map((c) => ({ value: c, label: names.region(c) })).sort(byName)}
          onChange={set('country')}
        />
        <Select label={t.originalLanguage} value={filters.language} options={languageOptions(options.languages)} onChange={set('language')} />
        <Select
          label={t.decade}
          value={filters.decade}
          options={options.decades.map((d) => ({ value: d, label: `${d}–${d + 9}` }))}
          onChange={set('decade')}
        />
        <Select
          label={format(t.providerIn, { region: names.region(region) })}
          value={filters.provider}
          options={options.providers.map((p) => ({ value: p.id, label: `${p.name} (${p.count})` }))}
          onChange={set('provider')}
        />
        <Select label={t.audio} value={filters.audio} options={languageOptions(options.audio)} onChange={set('audio')} />
        <Select label={t.subtitles} value={filters.subtitle} options={languageOptions(options.subtitles)} onChange={set('subtitle')} />
        <Select
          label={t.sortBy}
          value={filters.sort === 'relevance' ? undefined : filters.sort}
          options={SORTS.filter((s) => s !== 'relevance').map((s) => ({ value: s, label: t.sort[s] }))}
          onChange={(sort) => set('sort')(sort ?? 'relevance')}
        />
        {options.providers.length > 0 && (
          <label className="toggle">
            <input type="checkbox" checked={filters.streamable} onChange={(e) => set('streamable')(e.target.checked)} />
            <span>{format(t.streamableOnly, { region: names.region(region) })}</span>
          </label>
        )}
        {isFiltering(filters) && (
          <button className="button button--ghost" onClick={() => onChange(EMPTY_FILTERS)}>
            ✕ {t.clear}
          </button>
        )}
      </div>
    </section>
  )
}
