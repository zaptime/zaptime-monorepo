import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetMockZaptime } from './setup'
import { ZaptimeModal } from '../src/zaptime-init/components/Modal'

describe('ZaptimeModal', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    resetMockZaptime()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('should create a modal with unique id', () => {
    const modal = new ZaptimeModal({
      config: { token: 'test-token' },
    })

    expect(modal.id).toMatch(/^zaptime-/)
  })

  it('should open and create DOM elements', () => {
    const modal = new ZaptimeModal({
      config: { token: 'test-token' },
    })

    modal.open()

    const backdrop = document.getElementById(`${modal.id}-backdrop`)
    expect(backdrop).not.toBeNull()
    expect(backdrop?.style.display).toBe('flex')
  })

  it('should call onOpen callback when opened', () => {
    const onOpen = vi.fn()
    const modal = new ZaptimeModal({
      config: { token: 'test-token' },
      onOpen,
    })

    modal.open()

    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('should not open twice', () => {
    const onOpen = vi.fn()
    const modal = new ZaptimeModal({
      config: { token: 'test-token' },
      onOpen,
    })

    modal.open()
    modal.open()

    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('should close the modal', async () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    const modal = new ZaptimeModal({
      config: { token: 'test-token' },
      onClose,
    })

    modal.open()
    modal.close()

    // Wait for animation timeout
    await vi.advanceTimersByTimeAsync(200)

    expect(onClose).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('should not close if not open', async () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    const modal = new ZaptimeModal({
      config: { token: 'test-token' },
      onClose,
    })

    modal.close()

    await vi.advanceTimersByTimeAsync(200)

    expect(onClose).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('should close on escape key', () => {
    vi.useFakeTimers()
    const modal = new ZaptimeModal({
      config: { token: 'test-token' },
    })

    modal.open()

    const event = new KeyboardEvent('keydown', { key: 'Escape' })
    document.dispatchEvent(event)

    expect(document.getElementById(`${modal.id}-backdrop`)?.style.opacity).toBe('0')
    vi.useRealTimers()
  })

  it('should close on backdrop click', () => {
    vi.useFakeTimers()
    const modal = new ZaptimeModal({
      config: { token: 'test-token' },
    })

    modal.open()

    const backdrop = document.getElementById(`${modal.id}-backdrop`)
    backdrop?.click()

    expect(backdrop?.style.opacity).toBe('0')
    vi.useRealTimers()
  })

  it('should have close button', () => {
    const modal = new ZaptimeModal({
      config: { token: 'test-token' },
    })

    modal.open()

    const closeButton = document.querySelector(`#${modal.id}-container button`)
    expect(closeButton).not.toBeNull()
    expect(closeButton?.getAttribute('aria-label')).toBe('Close')
  })

  it('should destroy modal and remove from DOM', () => {
    const modal = new ZaptimeModal({
      config: { token: 'test-token' },
    })

    modal.open()
    const backdrop = document.getElementById(`${modal.id}-backdrop`)
    expect(backdrop).not.toBeNull()

    modal.destroy()

    expect(document.getElementById(`${modal.id}-backdrop`)).toBeNull()
  })

  it('should restore body overflow on destroy when open', () => {
    const modal = new ZaptimeModal({
      config: { token: 'test-token' },
    })

    document.body.style.overflow = 'auto'
    modal.open()
    expect(document.body.style.overflow).toBe('hidden')

    modal.destroy()
    expect(document.body.style.overflow).toBe('auto')
  })

  it('should lock body scroll when opened', () => {
    const modal = new ZaptimeModal({
      config: { token: 'test-token' },
    })

    document.body.style.overflow = 'auto'
    modal.open()

    expect(document.body.style.overflow).toBe('hidden')
  })
})
