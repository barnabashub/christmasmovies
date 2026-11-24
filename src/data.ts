import { useEffect, useMemo, useState } from 'react'
import catalog from '../catalog/titles.json'
import type { CatalogEntry, DataMeta, Enrichment, Provider, RegionData, Title } from './types'

const entries = catalog as CatalogEntry[]

async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/${path}`)
    return response.ok ? ((await response.json()) as T) : fallback
  } catch {
    return fallback
  }
}

interface Library {
  meta?: DataMeta
  enrichment: Record<string, Enrichment>
  providers: Record<string, Provider>
}

export function useCatalog(region: string) {
  const [library, setLibrary] = useState<Library>({ enrichment: {}, providers: {} })
  const [availability, setAvailability] = useState<RegionData>({})

  useEffect(() => {
    Promise.all([
      fetchJson<DataMeta | undefined>('meta.json', undefined),
      fetchJson<Record<string, Enrichment>>('enrichment.json', {}),
      fetchJson<Record<string, Provider>>('providers.json', {}),
    ]).then(([meta, enrichment, providers]) => setLibrary({ meta, enrichment, providers }))
  }, [])

  useEffect(() => {
    let current = true
    setAvailability({})
    if (library.meta?.regions.includes(region)) {
      fetchJson<RegionData>(`availability/${region}.json`, {}).then((data) => current && setAvailability(data))
    }
    return () => {
      current = false
    }
  }, [region, library.meta])

  const titles = useMemo<Title[]>(
    () =>
      entries.map((entry) => {
        const { episodePosition, ...enrichment } = library.enrichment[entry.id] ?? {}
        return {
          ...enrichment,
          ...entry,
          tmdbId: entry.tmdbId ?? enrichment.tmdbId,
          series: entry.series && { ...entry.series, ...episodePosition },
        }
      }),
    [library.enrichment],
  )

  return { titles, availability, ...library }
}
