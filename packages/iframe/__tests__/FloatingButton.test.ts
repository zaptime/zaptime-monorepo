import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetMockZaptime } from './setup'
import { createFloatingButton } from '../src/zaptime-init/components/FloatingButton'

describe('createFloatingButton', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    resetMockZaptime()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('should create a floating button with unique id', () => {
    const instance = createFloatingButton({
      config: { token: 'test-token' },
    })

    expect(instance.id).toMatch(/^zaptime-/)
  })

  it('should add button to DOM', () => {
    const instance = createFloatingButton({
      config: { token: 'test-token' },
    })

    const button = document.getElementById(`${instance.id}-button`)
    expect(button).not.toBeNull()
    expect(button?.tagName).toBe('BUTTON')
  })

  it('should position button on bottom-right by default', () => {
    const instance = createFloatingButton({
      config: { token: 'test-token' },
    })

    const button = document.getElementById(`${instance.id}-button`)
    expect(button?.style.right).toBe('24px')
  })

  it('should position button on bottom-left when specified', () => {
    const instance = createFloatingButton({
      config: { token: 'test-token' },
      position: 'bottom-left',
    })

    const button = document.getElementById(`${instance.id}-button`)
    expect(button?.style.left).toBe('24px')
  })

  it('should use default button color', () => {
    const instance = createFloatingButton({
      config: { token: 'test-token' },
    })

    const button = document.getElementById(`${instance.id}-button`)
    // Happy-dom may return the color in hex format
    expect(button?.style.backgroundColor).toMatch(/#15B79E|rgb\(21, 183, 158\)/i)
  })

  it('should use custom button color', () => {
    const instance = createFloatingButton({
      config: { token: 'test-token' },
      buttonColor: '#FF0000',
    })

    const button = document.getElementById(`${instance.id}-button`)
    expect(button?.style.backgroundColor).toMatch(/#FF0000|rgb\(255, 0, 0\)/i)
  })

  it('should show branding by default', () => {
    const instance = createFloatingButton({
      config: { token: 'test-token' },
    })

    const button = document.getElementById(`${instance.id}-button`)
    expect(button?.innerHTML).toContain('Zaptime')
    expect(button?.innerHTML).toContain('<svg')
  })

  it('should show custom text when branding is false', () => {
    const instance = createFloatingButton({
      config: { token: 'test-token' },
      branding: false,
      buttonText: 'Schedule Now',
    })

    const button = document.getElementById(`${instance.id}-button`)
    expect(button?.innerHTML).toContain('Schedule Now')
    expect(button?.innerHTML).not.toContain('Zaptime')
  })

  it('should open modal when clicked', () => {
    const instance = createFloatingButton({
      config: { token: 'test-token' },
    })

    const button = document.getElementById(`${instance.id}-button`)
    button?.click()

    // Check that backdrop was created
    const backdrops = document.querySelectorAll('[id$="-backdrop"]')
    expect(backdrops.length).toBeGreaterThan(0)
  })

  it('should open modal programmatically', () => {
    const instance = createFloatingButton({
      config: { token: 'test-token' },
    })

    instance.open()

    const backdrops = document.querySelectorAll('[id$="-backdrop"]')
    expect(backdrops.length).toBeGreaterThan(0)
  })

  it('should close modal programmatically', async () => {
    vi.useFakeTimers()
    const instance = createFloatingButton({
      config: { token: 'test-token' },
    })

    instance.open()
    instance.close()

    await vi.advanceTimersByTimeAsync(200)

    const backdrop = document.querySelector('[id$="-backdrop"]') as HTMLElement
    expect(backdrop?.style.display).toBe('none')

    vi.useRealTimers()
  })

  it('should destroy button and modal', () => {
    const instance = createFloatingButton({
      config: { token: 'test-token' },
    })

    instance.open()
    instance.destroy()

    expect(document.getElementById(`${instance.id}-button`)).toBeNull()
    expect(document.querySelector('[id$="-backdrop"]')).toBeNull()
  })

  it('should apply hover styles on mouseenter', () => {
    const instance = createFloatingButton({
      config: { token: 'test-token' },
    })

    const button = document.getElementById(`${instance.id}-button`)
    button?.dispatchEvent(new MouseEvent('mouseenter'))

    expect(button?.style.transform).toBe('translateY(-2px)')
  })

  it('should remove hover styles on mouseleave', () => {
    const instance = createFloatingButton({
      config: { token: 'test-token' },
    })

    const button = document.getElementById(`${instance.id}-button`)
    button?.dispatchEvent(new MouseEvent('mouseenter'))
    button?.dispatchEvent(new MouseEvent('mouseleave'))

    expect(button?.style.transform).toBe('')
  })
})
