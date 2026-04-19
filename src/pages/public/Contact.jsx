import PageHeader from '../../components/public/PageHeader'
import Breadcrumb from '../../components/public/Breadcrumb'
import { useContent } from '../../lib/hooks'
import { useSite } from '../../lib/SiteContext'

export default function Contact() {
  const { settings } = useSite()
  const { blocks } = useContent('contact')
  const s = settings

  return (
    <>
      <PageHeader slug="contact" label="Get In Touch" titleHtml='Contact & <span class="text-gold">Registration</span>' />
      <Breadcrumb page="Contact & Registration" />
      <div className="max-w-[900px] mx-auto py-16 px-8">
        <p className="text-sm text-gray-500 mb-8">{blocks.contact_intro}</p>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {s?.contact_email_athletics && (
            <a href={`mailto:${s.contact_email_athletics}`} className="info-card no-underline block">
              <h3>Athletics Director</h3>
              <p className="text-sm text-crimson">{s.contact_email_athletics}</p>
            </a>
          )}
          {s?.contact_email_aquatics && (
            <a href={`mailto:${s.contact_email_aquatics}`} className="info-card no-underline block">
              <h3>Aquatics Department</h3>
              <p className="text-sm text-crimson">{s.contact_email_aquatics}</p>
            </a>
          )}
        </div>

        <div className="flex gap-4 flex-wrap mb-12">
          {s?.google_form_url && <a href={s.google_form_url} target="_blank" rel="noreferrer" className="btn-primary no-underline">Submit Interest Form &rarr;</a>}
          {s?.meet_info_pdf_url && <a href={s.meet_info_pdf_url} target="_blank" rel="noreferrer" className="btn-outline no-underline !text-crimson !border-crimson/30">Meet Info PDF &rarr;</a>}
        </div>

        {s?.google_form_embed_url && (
          <>
            <h2 className="section-title">Interest <span className="text-crimson">Form</span></h2>
            <div className="divider" />
            <div className="bg-white shadow-lg">
              <div className="bg-black px-5 py-3 flex items-center justify-between flex-wrap gap-2">
                <span className="font-oswald text-xs tracking-widest uppercase text-white/60">Interest Form</span>
                <a href={s.google_form_url} target="_blank" rel="noreferrer" className="font-oswald text-xs tracking-widest uppercase text-gold border border-gold/40 px-3 py-1 hover:border-gold no-underline">Open in New Tab &nearr;</a>
              </div>
              <iframe src={s.google_form_embed_url} className="w-full border-none h-[680px]" title="Interest Form">Loading form…</iframe>
            </div>
          </>
        )}
      </div>
    </>
  )
}
