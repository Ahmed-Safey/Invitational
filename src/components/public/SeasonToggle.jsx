import { useSite } from '../../lib/SiteContext'

export default function SeasonToggle() {
  // Compare against currentSeason.slug (not activeSeason) so the correct button
  // highlights on first load even when localStorage is empty and currentSeason
  // falls back to seasons[0].
  const { seasons, currentSeason, switchSeason } = useSite()
  if (seasons.length < 2) return null

  return (
    <div className="flex gap-0 mb-6">
      {seasons.map(s => (
        <button
          key={s.slug}
          onClick={() => switchSeason(s.slug)}
          className={`font-oswald text-xs font-semibold tracking-widest uppercase px-5 py-3 border transition-colors cursor-pointer ${
            currentSeason?.slug === s.slug
              ? 'bg-crimson text-white border-crimson'
              : 'bg-transparent text-gold border-gold/40 hover:border-gold'
          }`}
        >{s.label}</button>
      ))}
    </div>
  )
}
