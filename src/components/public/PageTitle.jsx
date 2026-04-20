import { useEffect } from 'react'

// Default site-wide description — restored whenever a page does not supply one
// so meta description does not persist stale values across route changes.
const DEFAULT_DESCRIPTION = "Swimming Eagles Invitational Series — Cairo American College's annual international invitational swim meet hosted at the Hassan and Webb Aquatics Center."

export default function PageTitle({ title, description }) {
  useEffect(() => {
    document.title = title
      ? `${title.replace(/<[^>]*>/g, '')} | SEIS`
      : 'Swimming Eagles Invitational Series | SEIS'
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta) }
    meta.content = description || DEFAULT_DESCRIPTION
  }, [title, description])
  return null
}
