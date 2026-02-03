/**
 * Detect if the website prefers dark mode
 * Checks common patterns: html.dark, body.dark, data-theme="dark", data-mode="dark"
 */
export function isDarkMode(): boolean {
  if (typeof document === 'undefined') {
    return false
  }

  const html = document.documentElement
  const body = document.body

  // Check for dark class on html or body
  if (html.classList.contains('dark') || body?.classList.contains('dark')) {
    return true
  }

  // Check for data-theme attribute
  const htmlTheme = html.getAttribute('data-theme')
  const bodyTheme = body?.getAttribute('data-theme')
  if (htmlTheme === 'dark' || bodyTheme === 'dark') {
    return true
  }

  // Check for data-mode attribute
  const htmlMode = html.getAttribute('data-mode')
  const bodyMode = body?.getAttribute('data-mode')
  if (htmlMode === 'dark' || bodyMode === 'dark') {
    return true
  }

  // Check for color-scheme style
  const htmlColorScheme = getComputedStyle(html).colorScheme
  if (htmlColorScheme === 'dark') {
    return true
  }

  return false
}

/**
 * Listen for website dark mode changes
 * Uses MutationObserver to watch for class/attribute changes on html and body
 */
export function onDarkModeChange(callback: (isDark: boolean) => void): () => void {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') {
    return () => {}
  }

  let currentIsDark = isDarkMode()

  const checkAndNotify = () => {
    const newIsDark = isDarkMode()
    if (newIsDark !== currentIsDark) {
      currentIsDark = newIsDark
      callback(newIsDark)
    }
  }

  const observer = new MutationObserver(checkAndNotify)

  // Observe html element
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme', 'data-mode', 'style'],
  })

  // Observe body element when available
  if (document.body) {
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'data-mode', 'style'],
    })
  }

  return () => observer.disconnect()
}
