/**
 * Ambient type declarations for the zoid library.
 * Zoid is loaded via script concatenation before this code runs.
 */

interface ZoidPropDefinition {
  type: 'string' | 'object' | 'function' | 'boolean' | 'number'
  required?: boolean
  default?: () => unknown
}

interface ZoidDimensions {
  width: string
  height: string
}

interface ZoidAutoResize {
  width?: boolean
  height?: boolean
}

interface ZoidComponentOptions {
  tag: string
  url: string
  dimensions?: ZoidDimensions
  autoResize?: ZoidAutoResize
  props?: Record<string, ZoidPropDefinition>
}

interface ZoidRenderOptions {
  type?: string
  config: object
  onEventChanged?: (event: unknown) => void
  position?: string
}

interface ZoidInstance {
  render: (container: HTMLElement | string) => Promise<void>
  close: () => Promise<void>
}

type ZoidComponent = {
  (options: ZoidRenderOptions): ZoidInstance
}

interface Zoid {
  create: (options: ZoidComponentOptions) => ZoidComponent
}

declare const zoid: Zoid
