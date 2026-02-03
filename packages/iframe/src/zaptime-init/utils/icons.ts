/**
 * Get the Zaptime logo SVG with the specified color
 */
export function getZaptimeLogo(color: string = '#FFFFFF'): string {
  return (
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="' +
    color +
    '"/>' +
    '</svg>'
  )
}

/**
 * Get the close icon SVG
 */
export function getCloseIcon(): string {
  return (
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>'
  )
}
