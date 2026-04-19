import { Link } from 'react-router-dom'

export default function Breadcrumb({ page }) {
  return (
    <div className="max-w-[900px] mx-auto px-8 pt-4">
      <nav className="font-oswald text-[0.7rem] tracking-widest uppercase">
        <Link to="/" className="text-crimson no-underline hover:text-gold">Home</Link>
        <span className="text-gray-400 mx-2">&rarr;</span>
        <span className="text-gray-400">{page}</span>
      </nav>
    </div>
  )
}
