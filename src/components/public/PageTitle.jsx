import { useEffect } from 'react'

export default function PageTitle({ title, description }) {
  useEffect(() => {
    document.title = title
      ? `${title.replace(/<[^>]*>/g, '')} | SEIS`
      : 'Swimming Eagles Invitational Series | SEIS'
    if (description) {
      let meta = document.querySelector('meta[name="description"]')
      if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta) }
      meta.content = description
    }
  }, [title, description])
  return null
}
