import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { Locale } from './config'
import { dictionaries, displayNames, format, type Dictionary } from './i18n'
import type { Title } from './types'

interface AppContext {
  locale: Locale
  region: string
  t: Dictionary
  format: typeof format
  names: ReturnType<typeof displayNames>
  localTitle: (title: Title) => string
  overview: (title: Title) => string | undefined
}

const Context = createContext<AppContext | null>(null)

export function AppProvider({ locale, region, children }: { locale: Locale; region: string; children: ReactNode }) {
  const value = useMemo<AppContext>(
    () => ({
      locale,
      region,
      t: dictionaries[locale],
      format,
      names: displayNames(locale),
      localTitle: (title) => title.titles?.[locale] ?? title.title,
      overview: (title) => title.overviews?.[locale] ?? title.overviews?.en,
    }),
    [locale, region],
  )
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useApp() {
  const value = useContext(Context)
  if (!value) throw new Error('useApp must be used inside AppProvider')
  return value
}
