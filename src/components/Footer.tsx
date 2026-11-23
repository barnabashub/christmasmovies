import { useApp } from '../context'

const REPOSITORY = 'https://github.com/barnabashub/christmasmovies'

export function Footer({ syncedAt }: { syncedAt?: string }) {
  const { t, format, locale } = useApp()

  return (
    <footer className="footer">
      <p>
        <a href={`${REPOSITORY}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer">
          🎁 {t.contribute} ↗
        </a>
      </p>
      {syncedAt && <p>{format(t.syncedAt, { date: new Date(syncedAt).toLocaleDateString(locale) })}</p>}
      <p className="footer__attribution">
        <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer">
          TMDB
        </a>{' '}
        ·{' '}
        <a href="https://www.justwatch.com" target="_blank" rel="noreferrer">
          JustWatch
        </a>
        <br />
        {t.attribution}
      </p>
    </footer>
  )
}
