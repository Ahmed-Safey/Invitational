import { useSite } from '../../lib/SiteContext'

export default function SeasonToggle() {
  const { seasons, activeSeason, switchSeason } = useSite()
  if (seasons.length < 2) return null

  return (
    <div className="flex gap-0 mb-6">
      {seasons.map(s => (
        <button
          key={s.slug}
          onClick={() => switchSeason(s.slug)}
          className={`font-oswald text-xs font-semibold tracking-widest uppercase px-5 py-3 border transition-colors cursor-pointer ${
            activeSeason === s.slug
              ? 'bg-crimson text-white border-crimson'
              : 'bg-transparent text-gold border-gold/40 hover:border-gold'
          }`}
        >{s.label}</button>
      ))}
    </div>
  )
}
