import PageHeader from '../../components/public/PageHeader'
import Breadcrumb from '../../components/public/Breadcrumb'
import { useContent, useBankDetails } from '../../lib/hooks'
import { useSite } from '../../lib/SiteContext'
import { sanitizeHtml } from '../../lib/sanitize'

export default function Fees() {
  const { settings } = useSite()
  const { blocks } = useContent('fees')
  const bank = useBankDetails()

  return (
    <>
      <PageHeader slug="fees" label="Entry Fees" titleHtml='Fees & <span class="text-gold">Payment</span>' />
      <Breadcrumb page="Fees & Payment" />
      <div className="max-w-[900px] mx-auto py-16 px-8">
        <div className="bg-white border-t-4 border-crimson p-10 text-center mb-8">
          <div className="font-oswald font-bold text-6xl text-crimson leading-none mb-1">{settings?.entry_fee_amount}</div>
          <div className="text-sm uppercase tracking-widest text-gray-400 font-oswald">{settings?.entry_fee_label}</div>
        </div>

        <h2 className="section-title">Payment <span className="text-crimson">Details</span></h2>
        <div className="divider" />
        <p className="text-sm text-gray-500 mb-6">{blocks.fees_intro}</p>

        {bank?.is_published && bank.bank_name && (
          <div className="info-card mb-8">
            <h3>Bank Transfer Details</h3>
            <table className="w-full text-sm">
              <tbody>
                {[['Bank Name', bank.bank_name],['IBAN Number', bank.iban_number],['Account Number', bank.account_number],['Swift Code', bank.swift_code],['Beneficiary', bank.beneficiary],['Address in Cairo', bank.address],['Phone', bank.phone]]
                  .filter(([, v]) => v && v.trim() && v.toUpperCase() !== 'TBC' && v.toUpperCase() !== 'TBD')
                  .map(([k,v]) => (
                    <tr key={k} className="border-b border-cream-mid"><td className="py-2 font-bold text-charcoal">{k}</td><td className="py-2 text-gray-500">{v}</td></tr>
                ))}
                {bank.important_note && bank.important_note.trim() && bank.important_note.toUpperCase() !== 'TBC' && (
                  <tr className="border-b border-cream-mid bg-cream">
                    <td colSpan={2} className="py-3 text-center text-sm font-semibold text-crimson">
                      Important: {bank.important_note}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {blocks.invoices_html && (
          <>
            <h2 className="section-title">School <span className="text-crimson">Invoices</span></h2>
            <div className="divider" />
            <div className="mb-8 text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: sanitizeHtml(blocks.invoices_html) }} />
          </>
        )}

        <h2 className="section-title">Payment <span className="text-crimson">Policy</span></h2>
        <div className="divider" />
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-500">
          {['policy_1','policy_2','policy_3','policy_4'].map(k => blocks[k] && <li key={k}>{blocks[k]}</li>)}
        </ul>
      </div>
    </>
  )
}
