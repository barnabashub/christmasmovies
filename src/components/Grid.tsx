import { useApp } from '../context'
import { isStreamable } from '../filters'
import type { RegionData, Title } from '../types'
import { Card } from './Card'

interface Props {
  titles: Title[]
  availability: RegionData
  onOpen: (id: string) => void
}

export function Grid({ titles, availability, onOpen }: Props) {
  const { t, format } = useApp()

  return (
    <section className="results">
      <p className="results__count" aria-live="polite">
        {format(t.results, { count: titles.length })}
      </p>
      {titles.length ? (
        <div className="grid">
          {titles.map((title) => (
            <Card key={title.id} title={title} streamable={isStreamable(title.id, availability)} onOpen={onOpen} />
          ))}
        </div>
      ) : (
        <p className="results__empty">🎄 {t.noResults}</p>
      )}
    </section>
  )
}
