import { TMDB_IMAGE } from '../config'
import { useApp } from '../context'
import { flag } from '../i18n'
import type { Title } from '../types'

const PALETTES = [
  ['#7f1d1d', '#ef4444'],
  ['#14532d', '#22c55e'],
  ['#1e3a8a', '#60a5fa'],
  ['#78350f', '#f59e0b'],
  ['#4c1d95', '#a78bfa'],
  ['#134e4a', '#2dd4bf'],
  ['#831843', '#f472b6'],
  ['#1f2937', '#94a3b8'],
]

const ORNAMENTS = ['✦', '❄', '★', '✧', '❅', '✺']

function hash(text: string) {
  let value = 0
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) >>> 0
  return value
}

export function Poster({ title }: { title: Title }) {
  const { localTitle } = useApp()
  const name = localTitle(title)

  if (title.poster) {
    return <img className="poster" src={`${TMDB_IMAGE}/w342${title.poster}`} alt={name} loading="lazy" />
  }

  const seed = hash(title.id)
  const [dark, light] = PALETTES[seed % PALETTES.length]
  return (
    <div className="poster poster--generated" style={{ background: `linear-gradient(160deg, ${light}, ${dark} 65%)` }}>
      <span className="poster__ornament" aria-hidden>
        {ORNAMENTS[seed % ORNAMENTS.length]}
      </span>
      {title.series && <span className="poster__series">{title.series.title}</span>}
      <span className="poster__title">{name}</span>
      <span className="poster__meta">
        {title.countries.map(flag).join(' ')} {title.year}
      </span>
    </div>
  )
}
