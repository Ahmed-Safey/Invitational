import { useState } from 'react'
import PageHeader from '../../components/public/PageHeader'
import Breadcrumb from '../../components/public/Breadcrumb'
import { useContent } from '../../lib/hooks'
import Loading from '../../components/public/Loading'

// FAQ page renders an accordion of question/answer pairs from content_blocks.
// The FAQ data is stored as a single `faq_items` block of type `json` holding
// an array of { q, a } objects, so admins can edit it freely in the Content UI.
export default function Faq() {
  const { blocks, loading } = useContent('faq')
  const [openIdx, setOpenIdx] = useState(0)

  let items = blocks.faq_items
  if (typeof items === 'string') {
    try { items = JSON.parse(items) } catch { items = [] }
  }
  if (!Array.isArray(items)) items = []

  return (
    <>
      <PageHeader slug="faq" label="Common Questions" titleHtml='Frequently Asked <span class="text-gold">Questions</span>' />
      <Breadcrumb page="FAQ" />
      <div className="max-w-[800px] mx-auto py-16 px-8">
        {blocks.faq_intro && <p className="text-sm text-gray-500 mb-8">{blocks.faq_intro}</p>}

        {loading ? (
          <Loading />
        ) : items.length === 0 ? (
          <div className="bg-cream-mid border-2 border-dashed border-crimson/20 p-8 text-center rounded">
            <p className="font-oswald text-sm tracking-widest uppercase text-gray-400">FAQ coming soon</p>
          </div>
        ) : (
          <div className="border border-cream-mid">
            {items.map((item, i) => {
              const isOpen = openIdx === i
              return (
                <div key={i} className={`border-b border-cream-mid last:border-b-0 ${isOpen ? 'bg-cream' : 'bg-white'}`}>
                  <button
                    onClick={() => setOpenIdx(isOpen ? -1 : i)}
                    className="w-full text-left py-4 px-5 flex items-start justify-between gap-4 cursor-pointer bg-transparent border-none hover:bg-cream transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="font-oswald font-semibold text-base text-charcoal tracking-wide">{item.q}</span>
                    <span className={`font-oswald text-2xl text-crimson leading-none transition-transform shrink-0 ${isOpen ? 'rotate-45' : ''}`}>+</span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">{item.a}</div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {blocks.faq_footer && (
          <p className="text-xs italic text-gray-400 mt-8 text-center">{blocks.faq_footer}</p>
        )}
      </div>
    </>
  )
}
