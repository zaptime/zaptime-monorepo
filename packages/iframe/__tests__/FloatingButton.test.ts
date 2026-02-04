import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetMockZaptime } from './setup'
import { createFloatingButton } from '../src/zaptime-init/components/FloatingButton'
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

describe('createFloatingButton', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
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

  it('should create a floating button with unique id', () => {
    const instance = createFloatingButton({
      config: { token: 'test-token' },
    })

    expect(instance.id).toMatch(/^zaptime-/)
  })

  it('should add button to DOM after API response', async () => {
    mockApiResponse(false)

    const instance = createFloatingButton({
      config: { token: 'test-token' },
    })

    // Button should not exist yet
    expect(document.getElementById(`${instance.id}-button`)).toBeNull()

    await flushPromises()

    // Now button should exist
    const button = document.getElementById(`${instance.id}-button`)
    expect(button).not.toBeNull()
    expect(button?.tagName).toBe('BUTTON')
  })

  it('should position button on bottom-right by default', async () => {
    mockApiResponse(false)

    const instance = createFloatingButton({
      config: { token: 'test-token' },
    })

    await flushPromises()

    const button = document.getElementById(`${instance.id}-button`)
    expect(button?.style.right).toBe('24px')
  })

  it('should position button on bottom-left when specified', async () => {
    mockApiResponse(false)

    const instance = createFloatingButton({
      config: { token: 'test-token' },
      position: 'bottom-left',
    })

    await flushPromises()

    const button = document.getElementById(`${instance.id}-button`)
    expect(button?.style.left).toBe('24px')
  })

  it('should use gradient for unsubscribed accounts', async () => {
    mockApiResponse(false) // Not subscribed

    const instance = createFloatingButton({
      config: { token: 'test-token' },
    })

    await flushPromises()

    const button = document.getElementById(`${instance.id}-button`)
    // Free accounts use gradient background
    expect(button?.style.background).toContain('linear-gradient')
  })

  it('should ignore custom button color for unsubscribed accounts', async () => {
    mockApiResponse(false) // Not subscribed

    const instance = createFloatingButton({
      config: { token: 'test-token' },
      buttonColor: '#FF0000',
      branding: false,
    })

    await flushPromises()

    const button = document.getElementById(`${instance.id}-button`)
    // Should use gradient, not custom color, for free accounts
    expect(button?.style.background).toContain('linear-gradient')
  })

  it('should use custom button color when account is subscribed', async () => {
    mockApiResponse(true) // Subscribed

    const instance = createFloatingButton({
      config: { token: 'test-token' },
      buttonColor: '#FF0000',
      branding: false,
    })

    await flushPromises()

    const button = document.getElementById(`${instance.id}-button`)
    expect(button?.style.backgroundColor).toMatch(/#FF0000|rgb\(255, 0, 0\)/i)
  })

  it('should show Zaptime branding for unsubscribed accounts', async () => {
    mockApiResponse(false) // Not subscribed

    const instance = createFloatingButton({
      config: { token: 'test-token' },
    })

    await flushPromises()

    const button = document.getElementById(`${instance.id}-button`)
    expect(button?.innerHTML).toContain('Zaptime')
    expect(button?.innerHTML).toContain('<svg')
  })

  it('should enforce Zaptime branding when branding is false but account is unsubscribed', async () => {
    mockApiResponse(false) // Not subscribed

    const instance = createFloatingButton({
      config: { token: 'test-token' },
      branding: false,
      buttonText: 'Schedule Now',
    })

    await flushPromises()

    const button = document.getElementById(`${instance.id}-button`)
    // Should show Zaptime branding, not custom text
    expect(button?.innerHTML).toContain('Zaptime')
    expect(button?.innerHTML).toContain('<svg')
    expect(button?.innerHTML).not.toContain('Schedule Now')
  })

  it('should show custom text when branding is false and account is subscribed', async () => {
    mockApiResponse(true) // Subscribed

    const instance = createFloatingButton({
      config: { token: 'test-token' },
      branding: false,
      buttonText: 'Schedule Now',
    })

    await flushPromises()

    const button = document.getElementById(`${instance.id}-button`)
    expect(button?.innerHTML).toContain('Schedule Now')
    expect(button?.innerHTML).not.toContain('Zaptime')
  })

  it('should show Zaptime branding when user wants branding even if subscribed', async () => {
    mockApiResponse(true) // Subscribed

    const instance = createFloatingButton({
      config: { token: 'test-token' },
      branding: true, // User explicitly wants branding
      buttonText: 'Custom Text',
    })

    await flushPromises()

    const button = document.getElementById(`${instance.id}-button`)
    // Should show Zaptime branding because user wants it
    expect(button?.innerHTML).toContain('Zaptime')
    expect(button?.innerHTML).toContain('<svg')
  })

  it('should not show button when event type is disabled', async () => {
    mockApiResponse(true, true) // Subscribed but disabled

    const instance = createFloatingButton({
      config: { token: 'test-token' },
    })

    await flushPromises()

    const button = document.getElementById(`${instance.id}-button`)
    expect(button).toBeNull()
  })

  it('should open modal when clicked', async () => {
    mockApiResponse(false)

    const instance = createFloatingButton({
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

    const instance = createFloatingButton({
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

    const instance = createFloatingButton({
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

    const instance = createFloatingButton({
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

    const instance = createFloatingButton({
      config: { token: 'test-token' },
    })

    await flushPromises()

    const button = document.getElementById(`${instance.id}-button`)
    button?.dispatchEvent(new MouseEvent('mouseenter'))

    expect(button?.style.transform).toBe('translateY(-2px)')
  })

  it('should remove hover styles on mouseleave', async () => {
    mockApiResponse(false)

    const instance = createFloatingButton({
      config: { token: 'test-token' },
    })

    await flushPromises()

    const button = document.getElementById(`${instance.id}-button`)
    button?.dispatchEvent(new MouseEvent('mouseenter'))
    button?.dispatchEvent(new MouseEvent('mouseleave'))

    expect(button?.style.transform).toBe('')
  })

  it('should show button immediately when no token is provided', () => {
    const instance = createFloatingButton({
      config: {},
    })

    // Button should exist immediately since no API call is made
    const button = document.getElementById(`${instance.id}-button`)
    expect(button).not.toBeNull()
    expect(button?.innerHTML).toContain('Zaptime')
  })
})
