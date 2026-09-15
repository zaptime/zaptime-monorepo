/** Publisher-owned configuration supports the same HTML as the Vue calendar.
 * Only configured copy is accepted here; attendee input is always rendered as text.
 */
export function ConfigurationHtml({ html, as: Tag = "span" }: { html: string; as?: "span" | "div" }) {
  return <Tag dangerouslySetInnerHTML={{ __html: html }} />;
}
