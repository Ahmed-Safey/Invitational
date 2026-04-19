import { useEffect, useState } from 'react'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  if (!visible) return null
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-8 w-12 h-12 bg-crimson text-white border-none rounded-full text-2xl cursor-pointer shadow-lg hover:bg-crimson-dark transition-colors z-50 flex items-center justify-center"
      aria-label="Back to top"
    >&uarr;</button>
  )
}
