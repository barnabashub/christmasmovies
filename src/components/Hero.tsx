import { TMDB_IMAGE } from '../config'
import { useApp } from '../context'
import type { Title } from '../types'
import { Flag } from './Flag'
import { Snow } from './Snow'

interface Props {
  title?: Title
  onOpen: (id: string) => void
}

export function Hero({ title, onOpen }: Props) {
  const { t, localTitle, overview } = useApp()
  const background = title?.backdrop ? `url(${TMDB_IMAGE}/w1280${title.backdrop})` : undefined

  return (
    <section className={background ? 'hero' : 'hero hero--plain'} style={{ backgroundImage: background }}>
      <div className="hero__shade" />
      <Snow />
      <div className="hero__content">
        <p className="hero__tagline">{t.tagline}</p>
        {title && (
          <>
            <h1 className="hero__title">{localTitle(title)}</h1>
            <p className="hero__meta">
              {title.year} ·{' '}
              {title.countries.map((c) => (
                <Flag key={c} region={c} />
              ))}{' '}
              · {title.genres.map((g) => t.genre[g]).join(', ')}
            </p>
            {overview(title) && <p className="hero__overview">{overview(title)}</p>}
            <button className="button button--primary" onClick={() => onOpen(title.id)}>
              ℹ {t.moreInfo}
            </button>
          </>
        )}
      </div>
    </section>
  )
}
