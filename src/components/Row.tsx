import { useRef } from 'react'
import { useApp } from '../context'
import { isStreamable } from '../filters'
import type { RegionData, Title } from '../types'
import { Card } from './Card'

interface Props {
  heading: string
  titles: Title[]
  availability: RegionData
  onOpen: (id: string) => void
}

export function Row({ heading, titles, availability, onOpen }: Props) {
  const { t } = useApp()
  const track = useRef<HTMLDivElement>(null)
  const scroll = (direction: number) =>
    track.current?.scrollBy({ left: direction * track.current.clientWidth * 0.85, behavior: 'smooth' })

  if (!titles.length) return null

  return (
    <section className="row">
      <h2 className="row__heading">{heading}</h2>
      <div className="row__viewport">
        <button className="row__arrow row__arrow--left" onClick={() => scroll(-1)} aria-label={t.scrollLeft}>
          ‹
        </button>
        <div className="row__track" ref={track}>
          {titles.map((title) => (
            <Card key={title.id} title={title} streamable={isStreamable(title.id, availability)} onOpen={onOpen} />
          ))}
        </div>
        <button className="row__arrow row__arrow--right" onClick={() => scroll(1)} aria-label={t.scrollRight}>
          ›
        </button>
      </div>
    </section>
  )
}
