import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateUniqueId } from '../src/zaptime-init/utils/dom'
import { getZaptimeLogo, getCloseIcon } from '../src/zaptime-init/utils/icons'
import { isDarkMode, onDarkModeChange } from '../src/zaptime-init/utils/darkMode'

describe('generateUniqueId', () => {
  it('should generate an id starting with "zaptime-"', () => {
    const id = generateUniqueId()
    expect(id).toMatch(/^zaptime-/)
  })

  it('should generate unique ids on each call', () => {
    const id1 = generateUniqueId()
    const id2 = generateUniqueId()
    const id3 = generateUniqueId()

    expect(id1).not.toBe(id2)
    expect(id2).not.toBe(id3)
    expect(id1).not.toBe(id3)
  })

  it('should generate ids with correct length', () => {
    const id = generateUniqueId()
    // "zaptime-" (8 chars) + 9 random chars = 17
    expect(id.length).toBe(17)
  })
})

describe('getZaptimeLogo', () => {
  it('should return an SVG string', () => {
    const svg = getZaptimeLogo()
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
  })

  it('should use white color by default', () => {
    const svg = getZaptimeLogo()
    expect(svg).toContain('fill="#FFFFFF"')
  })

  it('should use provided color', () => {
    const svg = getZaptimeLogo('#FF0000')
    expect(svg).toContain('fill="#FF0000"')
  })

  it('should have correct dimensions', () => {
    const svg = getZaptimeLogo()
    expect(svg).toContain('width="20"')
    expect(svg).toContain('height="20"')
  })
})

describe('getCloseIcon', () => {
  it('should return an SVG string', () => {
    const svg = getCloseIcon()
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
  })

  it('should use currentColor for stroke', () => {
    const svg = getCloseIcon()
    expect(svg).toContain('stroke="currentColor"')
  })

  it('should have correct dimensions', () => {
    const svg = getCloseIcon()
    expect(svg).toContain('width="16"')
    expect(svg).toContain('height="16"')
  })
})

describe('isDarkMode', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark')
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.removeAttribute('data-mode')
    document.body.classList.remove('dark')
    document.body.removeAttribute('data-theme')
    document.body.removeAttribute('data-mode')
  })

  it('should return false when no dark mode indicators', () => {
    expect(isDarkMode()).toBe(false)
  })

  it('should return true when html has dark class', () => {
    document.documentElement.classList.add('dark')
    expect(isDarkMode()).toBe(true)
  })

  it('should return true when body has dark class', () => {
    document.body.classList.add('dark')
    expect(isDarkMode()).toBe(true)
  })

  it('should return true when data-theme="dark" on html', () => {
    document.documentElement.setAttribute('data-theme', 'dark')
    expect(isDarkMode()).toBe(true)
  })

  it('should return true when data-mode="dark" on html', () => {
    document.documentElement.setAttribute('data-mode', 'dark')
    expect(isDarkMode()).toBe(true)
  })

  it('should return false when data-theme="light"', () => {
    document.documentElement.setAttribute('data-theme', 'light')
    expect(isDarkMode()).toBe(false)
  })
})

describe('onDarkModeChange', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark')
    document.documentElement.removeAttribute('data-theme')
  })

  it('should return a cleanup function', () => {
    const cleanup = onDarkModeChange(() => {})
    expect(typeof cleanup).toBe('function')
    cleanup()
  })

  it('should call callback when dark mode changes', async () => {
    const callback = vi.fn()
    const cleanup = onDarkModeChange(callback)

    document.documentElement.classList.add('dark')

    // Wait for MutationObserver
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(callback).toHaveBeenCalledWith(true)

    cleanup()
  })

  it('should not call callback if dark mode stays the same', async () => {
    const callback = vi.fn()
    const cleanup = onDarkModeChange(callback)

    // Set some other attribute
    document.documentElement.setAttribute('data-foo', 'bar')

    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(callback).not.toHaveBeenCalled()

    cleanup()
  })
})
