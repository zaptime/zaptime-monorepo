/**
 * Type definitions for CSS-in-JS style objects
 */

export type CSSStyleObject = Partial<CSSStyleDeclaration>

export interface StyleDefinition {
  [key: string]: CSSStyleObject
}
