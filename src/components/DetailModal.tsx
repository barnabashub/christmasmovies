import { useEffect, useRef } from 'react'
import { TMDB_IMAGE } from '../config'
import { useApp } from '../context'
import { flag } from '../i18n'
import { MONETIZATIONS, type Provider, type RegionAvailability, type Title } from '../types'
import { Poster } from './Poster'

interface Props {
  title: Title
  availability?: RegionAvailability
  providers: Record<string, Provider>
  synced: boolean
  hasLanguageData: boolean
  siblings: Title[]
  onOpen: (id: string) => void
  onClose: () => void
}

const justWatchSearch = (region: string, query: string) =>
  `https://www.justwatch.com/${region === 'GB' ? 'uk' : region.toLowerCase()}/search?q=${encodeURIComponent(query)}`

export function DetailModal({ title, availability, providers, synced, hasLanguageData, siblings, onOpen, onClose }: Props) {
  const { t, format, names, region, localTitle, overview } = useApp()
  const closeButton = useRef<HTMLButtonElement>(null)
  const name = localTitle(title)
  const regionName = names.region(region)
  const offers = availability?.offers ?? []
  const searchQuery = title.series?.title ?? title.title
  const watchLink = availability?.link ?? justWatchSearch(region, searchQuery)

  useEffect(() => {
    closeButton.current?.focus()
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.classList.add('no-scroll')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('no-scroll')
    }
  }, [onClose])

  const facts = [
    title.series && `${title.series.title} · ${format(t.seasonEpisode, { season: title.series.season, episode: title.series.episode })}`,
    String(title.year),
    t.kind[title.kind],
    title.runtime && format(t.minutes, { n: title.runtime }),
    title.rating && `★ ${title.rating.toFixed(1)}`,
    title.holiday && title.holiday !== 'christmas' && t.holiday[title.holiday],
  ].filter(Boolean)

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={onClose}>
      <article className="modal__panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" ref={closeButton} onClick={onClose} aria-label={t.close}>
          ✕
        </button>
        <div
          className="modal__backdrop"
          style={{ backgroundImage: title.backdrop ? `url(${TMDB_IMAGE}/w1280${title.backdrop})` : undefined }}
        />
        <div className="modal__body">
          <div className="modal__poster">
            <Poster title={title} />
          </div>
          <div className="modal__main">
            <h2 id="modal-title" className="modal__title">
              {name}
            </h2>
            {title.originalTitle && title.originalTitle !== name && (
              <p className="modal__original">
                {t.originalTitle}: <span lang={title.languages[0]}>{title.originalTitle}</span>
              </p>
            )}
            <p className="modal__facts">{facts.join(' · ')}</p>
            <ul className="tags">
              {title.genres.map((g) => (
                <li key={g}>{t.genre[g]}</li>
              ))}
              {title.countries.map((c) => (
                <li key={c}>
                  {flag(c)} {names.region(c)}
                </li>
              ))}
              {title.languages.map((l) => (
                <li key={l}>🗣 {names.language(l)}</li>
              ))}
            </ul>
            {overview(title) && <p className="modal__overview">{overview(title)}</p>}

            <section className="watch">
              <h3>{format(t.whereToWatch, { region: `${flag(region)} ${regionName}` })}</h3>
              {!synced && <p className="muted">{t.noSync}</p>}
              {synced && !offers.length && <p className="muted">{format(t.notAvailable, { region: regionName })}</p>}
              {MONETIZATIONS.map((type) => {
                const ofType = offers.filter((o) => o.type === type)
                if (!ofType.length) return null
                return (
                  <div className="watch__group" key={type}>
                    <span className="watch__type">{t.offer[type]}</span>
                    <ul className="watch__providers">
                      {ofType.map(({ provider }) => (
                        <li key={provider}>
                          <a
                            href={availability?.deepLinks?.[provider] ?? watchLink}
                            target="_blank"
                            rel="noreferrer"
                            title={format(t.watchOn, { provider: providers[provider]?.name ?? provider })}
                          >
                            {providers[provider]?.logo ? (
                              <img src={`${TMDB_IMAGE}/w92${providers[provider].logo}`} alt={providers[provider].name} />
                            ) : (
                              <span>{providers[provider]?.name ?? provider}</span>
                            )}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
              {availability?.audio?.length || availability?.subtitles?.length ? (
                <dl className="watch__languages">
                  <dt>{t.audio}</dt>
                  <dd>{availability.audio?.map(names.language).join(', ') || '–'}</dd>
                  <dt>{t.subtitles}</dt>
                  <dd>{availability.subtitles?.map(names.language).join(', ') || '–'}</dd>
                </dl>
              ) : (
                hasLanguageData && offers.length > 0 && <p className="muted">{t.languagesUnknown}</p>
              )}
              <a className="watch__more" href={watchLink} target="_blank" rel="noreferrer">
                {t.checkJustWatch} ↗
              </a>
            </section>

            {title.series && siblings.length > 0 && (
              <section className="siblings">
                <h3>{format(t.moreEpisodes, { series: title.series.title })}</h3>
                <ul>
                  {siblings.map((episode) => (
                    <li key={episode.id}>
                      <button onClick={() => onOpen(episode.id)}>
                        <span className="siblings__number">
                          {format(t.seasonEpisode, { season: episode.series!.season, episode: episode.series!.episode })}
                        </span>
                        <span>{localTitle(episode)}</span>
                        <span className="muted">{episode.year}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {title.streamingRegions && title.streamingRegions.length > 0 && (
              <details className="regions">
                <summary>{format(t.streamsIn, { count: title.streamingRegions.length })}</summary>
                <p>
                  {title.streamingRegions.map((code) => (
                    <span key={code} title={names.region(code)}>
                      {flag(code)}
                    </span>
                  ))}
                </p>
              </details>
            )}
          </div>
        </div>
      </article>
    </div>
  )
}
