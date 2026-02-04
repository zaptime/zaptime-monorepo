import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetMockZaptime } from './setup'
import { createInlineButton } from '../src/zaptime-init/components/InlineButton'
import { clearAccountStatus } from '../src/zaptime-init/utils/accountStatus'

/**
 * Mock API response for account status
 */
function mockApiResponse(isSubscribed: boolean, disabled = false): void {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        data: { isSubscribed, disabled },
      }),
  })
}

/**
 * Wait for promises to resolve (for async API calls)
 */
async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

describe('createInlineButton', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="button-container"></div>'
    clearAccountStatus()
    // Default mock to prevent actual API calls
    mockApiResponse(false)
    // Reset mock Zaptime component AFTER other mocks are set
    resetMockZaptime()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    clearAccountStatus()
  })

  it('should create an inline button with unique id', () => {
    const instance = createInlineButton({
      selector: '#button-container',
      config: { token: 'test-token' },
    })

    expect(instance.id).toMatch(/^zaptime-/)
  })

  it('should add button to specified container after API response', async () => {
    mockApiResponse(false)

    const instance = createInlineButton({
      selector: '#button-container',
      config: { token: 'test-token' },
    })

    // Button should not exist yet
    expect(document.getElementById(`${instance.id}-button`)).toBeNull()

    await flushPromises()

    // Now button should exist
    const button = document.getElementById(`${instance.id}-button`)
    expect(button).not.toBeNull()
    expect(button?.tagName).toBe('BUTTON')

    // Button should be inside the container
    const container = document.getElementById('button-container')
    expect(container?.contains(button)).toBe(true)
  })

  it('should not use fixed positioning', async () => {
    mockApiResponse(false)

    const instance = createInlineButton({
      selector: '#button-container',
      config: { token: 'test-token' },
    })

    await flushPromises()

    const button = document.getElementById(`${instance.id}-button`)
    expect(button?.style.position).not.toBe('fixed')
    expect(button?.style.display).toBe('inline-flex')
  })

  it('should use gradient for unsubscribed accounts', async () => {
    mockApiResponse(false) // Not subscribed

    const instance = createInlineButton({
      selector: '#button-container',
      config: { token: 'test-token' },
    })

    await flushPromises()

    const button = document.getElementById(`${instance.id}-button`)
    // Free accounts use gradient background
    expect(button?.style.background).toContain('linear-gradient')
  })

  it('should ignore custom button color for unsubscribed accounts', async () => {
    mockApiResponse(false) // Not subscribed

    const instance = createInlineButton({
      selector: '#button-container',
      config: { token: 'test-token' },
      buttonColor: '#FF0000',
    })

    await flushPromises()

    const button = document.getElementById(`${instance.id}-button`)
    // Should use gradient, not custom color, for free accounts
    expect(button?.style.background).toContain('linear-gradient')
  })

  it('should use custom button color when account is subscribed', async () => {
    mockApiResponse(true) // Subscribed

    const instance = createInlineButton({
      selector: '#button-container',
      config: { token: 'test-token' },
      buttonColor: '#FF0000',
    })

    await flushPromises()

    const button = document.getElementById(`${instance.id}-button`)
    expect(button?.style.backgroundColor).toMatch(/#FF0000|rgb\(255, 0, 0\)/i)
  })

  it('should show Zaptime branding for unsubscribed accounts', async () => {
    mockApiResponse(false) // Not subscribed

    const instance = createInlineButton({
      selector: '#button-container',
      config: { token: 'test-token' },
    })

    await flushPromises()

    const button = document.getElementById(`${instance.id}-button`)
    expect(button?.innerHTML).toContain('Zaptime')
    expect(button?.innerHTML).toContain('<svg')
  })

  it('should enforce Zaptime branding when custom options passed but account is unsubscribed', async () => {
    mockApiResponse(false) // Not subscribed

    const instance = createInlineButton({
      selector: '#button-container',
      config: { token: 'test-token' },
      buttonText: 'Schedule Now',
    })

    await flushPromises()

    const button = document.getElementById(`${instance.id}-button`)
    // Should show Zaptime branding, not custom text
    expect(button?.innerHTML).toContain('Zaptime')
    expect(button?.innerHTML).toContain('<svg')
    expect(button?.innerHTML).not.toContain('Schedule Now')
  })

  it('should show custom text when account is subscribed', async () => {
    mockApiResponse(true) // Subscribed

    const instance = createInlineButton({
      selector: '#button-container',
      config: { token: 'test-token' },
      buttonText: 'Schedule Now',
    })

    await flushPromises()

    const button = document.getElementById(`${instance.id}-button`)
    expect(button?.innerHTML).toContain('Schedule Now')
    expect(button?.innerHTML).not.toContain('Zaptime')
  })

  it('should not show button when event type is disabled', async () => {
    mockApiResponse(true, true) // Subscribed but disabled

    const instance = createInlineButton({
      selector: '#button-container',
      config: { token: 'test-token' },
    })

    await flushPromises()

    const button = document.getElementById(`${instance.id}-button`)
    expect(button).toBeNull()
  })

  it('should not create button when selector not found', async () => {
    mockApiResponse(false)
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const instance = createInlineButton({
      selector: '#non-existent-container',
      config: { token: 'test-token' },
    })

    await flushPromises()

    const button = document.getElementById(`${instance.id}-button`)
    expect(button).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith(
      'Zaptime: Container not found for selector "#non-existent-container"'
    )

    consoleSpy.mockRestore()
  })

  it('should open modal when clicked', async () => {
    mockApiResponse(false)

    const instance = createInlineButton({
      selector: '#button-container',
      config: { token: 'test-token' },
    })

    await flushPromises()

    const button = document.getElementById(`${instance.id}-button`)
    button?.click()

    // Check that backdrop was created
    const backdrops = document.querySelectorAll('[id$="-backdrop"]')
    expect(backdrops.length).toBeGreaterThan(0)
  })

  it('should open modal programmatically', async () => {
    mockApiResponse(false)

    const instance = createInlineButton({
      selector: '#button-container',
      config: { token: 'test-token' },
    })

    await flushPromises()

    instance.open()

    const backdrops = document.querySelectorAll('[id$="-backdrop"]')
    expect(backdrops.length).toBeGreaterThan(0)
  })

  it('should close modal programmatically', async () => {
    vi.useFakeTimers()
    mockApiResponse(false)

    const instance = createInlineButton({
      selector: '#button-container',
      config: { token: 'test-token' },
    })

    await vi.advanceTimersByTimeAsync(10)

    instance.open()
    instance.close()

    await vi.advanceTimersByTimeAsync(200)

    const backdrop = document.querySelector('[id$="-backdrop"]') as HTMLElement
    expect(backdrop?.style.display).toBe('none')

    vi.useRealTimers()
  })

  it('should destroy button and modal', async () => {
    mockApiResponse(false)

    const instance = createInlineButton({
      selector: '#button-container',
      config: { token: 'test-token' },
    })

    await flushPromises()

    instance.open()
    instance.destroy()

    expect(document.getElementById(`${instance.id}-button`)).toBeNull()
    expect(document.querySelector('[id$="-backdrop"]')).toBeNull()
  })

  it('should apply hover styles on mouseenter', async () => {
    mockApiResponse(false)

    const instance = createInlineButton({
      selector: '#button-container',
      config: { token: 'test-token' },
    })

    await flushPromises()

    const button = document.getElementById(`${instance.id}-button`)
    button?.dispatchEvent(new MouseEvent('mouseenter'))

    expect(button?.style.transform).toBe('translateY(-2px)')
  })

  it('should remove hover styles on mouseleave', async () => {
    mockApiResponse(false)

    const instance = createInlineButton({
      selector: '#button-container',
      config: { token: 'test-token' },
    })

    await flushPromises()

    const button = document.getElementById(`${instance.id}-button`)
    button?.dispatchEvent(new MouseEvent('mouseenter'))
    button?.dispatchEvent(new MouseEvent('mouseleave'))

    expect(button?.style.transform).toBe('')
  })

  it('should show button immediately when no token is provided', () => {
    const instance = createInlineButton({
      selector: '#button-container',
      config: {},
    })

    // Button should exist immediately since no API call is made
    const button = document.getElementById(`${instance.id}-button`)
    expect(button).not.toBeNull()
    expect(button?.innerHTML).toContain('Zaptime')
  })
})
