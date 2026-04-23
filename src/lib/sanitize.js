import DOMPurify from 'dompurify'

// Defense-in-depth against stored XSS. Admins write HTML content blocks
// (e.g. `fees.invoices_html`) via the admin panel. RLS + is_admin() keeps
// writes locked to allow-listed admins, but if any admin credential leaks,
// this layer blocks script injection from reaching site visitors' browsers.
//
// Default profile: text formatting, lists, links, tables. No scripts, no
// event handlers, no iframes/objects/embeds. Safe for trusted-but-auditable
// content.
export function sanitizeHtml(dirty) {
  if (!dirty) return ''
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'span', 'div',
      'table', 'thead', 'tbody', 'tr', 'td', 'th',
      'blockquote', 'code', 'pre',
      'hr',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'title', 'class', 'colspan', 'rowspan'],
    // Force all links to open safely in a new tab without leaking referrer.
    ADD_ATTR: ['target'],
  })
}
