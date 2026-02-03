import type { CSSStyleObject } from '../types/styles'

/**
 * Apply a style object to an HTML element
 */
export function applyStyles(element: HTMLElement, styles: CSSStyleObject): void {
  const styleKeys = Object.keys(styles) as Array<keyof CSSStyleDeclaration>
  for (const key of styleKeys) {
    const value = styles[key]
    if (value !== undefined && typeof value === 'string') {
      // Use bracket notation with type assertion for dynamic property access
      ;(element.style as unknown as Record<string, string>)[key as string] = value
    }
  }
}

/**
 * Merge multiple style objects into one
 */
export function mergeStyles(...styleObjects: CSSStyleObject[]): CSSStyleObject {
  return Object.assign({}, ...styleObjects)
}
