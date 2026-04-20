// Shared connection/config error screen used by App.jsx when SiteContext fails
// or Supabase config is missing. ErrorBoundary intentionally uses inline styles
// (doesn't depend on Tailwind), so it stays separate.
export default function ErrorScreen({ title = 'Connection Error', message, actionLabel = 'Retry', onAction }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-8">
      <div className="text-center max-w-md">
        <div className="font-oswald font-bold text-6xl text-crimson mb-4">!</div>
        <h1 className="font-oswald font-bold text-2xl text-black uppercase tracking-wider mb-3">{title}</h1>
        <p className="text-gray-500 text-sm mb-6">{message || 'Unable to connect to the database. Please try again later.'}</p>
        <button onClick={onAction || (() => window.location.reload())} className="btn-primary cursor-pointer">{actionLabel}</button>
      </div>
    </div>
  )
}
