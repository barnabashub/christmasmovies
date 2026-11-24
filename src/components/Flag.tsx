const FLAGS = import.meta.glob<string>('/node_modules/flag-icons/flags/4x3/*.svg', {
  query: '?url',
  import: 'default',
  eager: true,
})

const flagUrl = (region: string) => FLAGS[`/node_modules/flag-icons/flags/4x3/${region.toLowerCase()}.svg`]

export function Flag({ region, title }: { region: string; title?: string }) {
  const src = flagUrl(region)
  if (!src) return <span className="flag flag--missing">{region}</span>
  return <img className="flag" src={src} alt={title ?? region} title={title} loading="lazy" width={20} height={15} />
}
