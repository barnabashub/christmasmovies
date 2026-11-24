import { LOCALES, type Locale } from '../config'
import { useApp } from '../context'
import { flag } from '../i18n'

interface Props {
  query: string
  regions: string[]
  onQuery: (query: string) => void
  onRegion: (region: string) => void
  onLocale: (locale: Locale) => void
  onHome: () => void
}

const LOCALE_LABELS: Record<Locale, string> = { en: 'English', hu: 'Magyar', de: 'Deutsch' }

export function Header({ query, regions, onQuery, onRegion, onLocale, onHome }: Props) {
  const { t, names, region, locale } = useApp()
  const sortedRegions = [...new Set([...regions, region])].sort((a, b) => names.region(a).localeCompare(names.region(b), locale))

  return (
    <header className="header">
      <button className="logo" onClick={onHome} aria-label="Christmas Movies">
        <span className="logo__mark" aria-hidden>
          🎄
        </span>
        <span className="logo__word">
          Christmas <em>Movies</em>
        </span>
      </button>
      <label className="search">
        <span className="visually-hidden">{t.searchPlaceholder}</span>
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M10.5 3a7.5 7.5 0 0 1 5.9 12.1l4.8 4.8-1.4 1.4-4.8-4.8A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z" />
        </svg>
        <input type="search" value={query} placeholder={t.searchPlaceholder} onChange={(e) => onQuery(e.target.value)} />
      </label>
      <div className="header__settings">
        <label>
          <span className="visually-hidden">{t.region}</span>
          <select value={region} onChange={(e) => onRegion(e.target.value)} title={t.region}>
            {sortedRegions.map((code) => (
              <option key={code} value={code}>
                {flag(code)} {names.region(code)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="visually-hidden">{t.uiLanguage}</span>
          <select value={locale} onChange={(e) => onLocale(e.target.value as Locale)} title={t.uiLanguage}>
            {LOCALES.map((code) => (
              <option key={code} value={code}>
                {LOCALE_LABELS[code]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  )
}
