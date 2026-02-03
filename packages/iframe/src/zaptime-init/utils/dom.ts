/**
 * Generate a unique ID for Zaptime components
 */
export function generateUniqueId(): string {
  return 'zaptime-' + Math.random().toString(36).substr(2, 9)
}
