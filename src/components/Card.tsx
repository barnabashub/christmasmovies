import { useApp } from '../context'
import type { Title } from '../types'
import { Poster } from './Poster'

interface Props {
  title: Title
  streamable: boolean
  onOpen: (id: string) => void
}

export function Card({ title, streamable, onOpen }: Props) {
  const { t, localTitle, episodeLabel } = useApp()
  const subtitle = title.series
    ? `${title.series.title} · ${episodeLabel(title.series)}`
    : `${title.year} · ${title.genres.map((g) => t.genre[g]).join(', ')}`

  return (
    <button className="card" onClick={() => onOpen(title.id)} aria-label={`${localTitle(title)} – ${t.moreInfo}`}>
      <Poster title={title} />
      <span className="card__badges">
        {title.kind !== 'movie' && <span className={`badge badge--${title.kind}`}>{t.kind[title.kind]}</span>}
        {streamable && <span className="badge badge--live" title={t.offer.flatrate} />}
      </span>
      <span className="card__info">
        <span className="card__title">{localTitle(title)}</span>
        <span className="card__subtitle">{subtitle}</span>
        {title.rating ? <span className="card__rating">★ {title.rating.toFixed(1)}</span> : null}
      </span>
    </button>
  )
}
