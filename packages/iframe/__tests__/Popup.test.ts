import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetMockZaptime } from './setup'
import { createPopup } from '../src/zaptime-init/components/Popup'

describe('createPopup', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    resetMockZaptime()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('should create a popup with unique id', () => {
    const instance = createPopup({
      config: { token: 'test-token' },
    })

    expect(instance.id).toMatch(/^zaptime-/)
  })

  it('should bind to elements with data-zaptime-link by default', () => {
    document.body.innerHTML = '<a href="#" data-zaptime-link>Book</a>'

    createPopup({
      config: { token: 'test-token' },
    })

    const link = document.querySelector('[data-zaptime-link]')
    link?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    const backdrops = document.querySelectorAll('[id$="-backdrop"]')
    expect(backdrops.length).toBeGreaterThan(0)
  })

  it('should bind to custom selector', () => {
    document.body.innerHTML = '<button class="book-btn">Book</button>'

    createPopup({
      config: { token: 'test-token' },
      selector: '.book-btn',
    })

    const button = document.querySelector('.book-btn')
    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    const backdrops = document.querySelectorAll('[id$="-backdrop"]')
    expect(backdrops.length).toBeGreaterThan(0)
  })

  it('should prevent default on click', () => {
    document.body.innerHTML = '<a href="https://example.com" data-zaptime-link>Book</a>'

    createPopup({
      config: { token: 'test-token' },
    })

    const link = document.querySelector('[data-zaptime-link]') as HTMLAnchorElement
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    link?.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
  })

  it('should open modal programmatically', () => {
    const instance = createPopup({
      config: { token: 'test-token' },
    })

    instance.open()

    const backdrops = document.querySelectorAll('[id$="-backdrop"]')
    expect(backdrops.length).toBeGreaterThan(0)
  })

  it('should close modal programmatically', async () => {
    vi.useFakeTimers()
    const instance = createPopup({
      config: { token: 'test-token' },
    })

    instance.open()
    instance.close()

    await vi.advanceTimersByTimeAsync(200)

    const backdrop = document.querySelector('[id$="-backdrop"]') as HTMLElement
    expect(backdrop?.style.display).toBe('none')

    vi.useRealTimers()
  })

  it('should bind to dynamically added elements', async () => {
    createPopup({
      config: { token: 'test-token' },
    })

    // Add element dynamically
    const link = document.createElement('a')
    link.setAttribute('data-zaptime-link', '')
    link.textContent = 'Book'
    document.body.appendChild(link)

    // Wait for MutationObserver to fire
    await new Promise((resolve) => setTimeout(resolve, 10))

    link.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    const backdrops = document.querySelectorAll('[id$="-backdrop"]')
    expect(backdrops.length).toBeGreaterThan(0)
  })

  it('should not bind same element twice', () => {
    document.body.innerHTML = '<a href="#" data-zaptime-link>Book</a>'

    createPopup({
      config: { token: 'test-token' },
    })

    // Trigger rebind by simulating observer
    const link = document.querySelector('[data-zaptime-link]')
    link?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    link?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    // Should still only have one modal
    const backdrops = document.querySelectorAll('[id$="-backdrop"]')
    expect(backdrops.length).toBe(1)
  })

  it('should destroy and unbind elements', () => {
    document.body.innerHTML = '<a href="#" data-zaptime-link>Book</a>'

    const instance = createPopup({
      config: { token: 'test-token' },
    })

    instance.destroy()

    const link = document.querySelector('[data-zaptime-link]')
    link?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    // Modal should not open after destroy
    const backdrops = document.querySelectorAll('[id$="-backdrop"]')
    expect(backdrops.length).toBe(0)
  })

  it('should bind to elements inside dynamically added containers', async () => {
    createPopup({
      config: { token: 'test-token' },
    })

    // Add container with nested element
    const container = document.createElement('div')
    container.innerHTML = '<a href="#" data-zaptime-link>Book</a>'
    document.body.appendChild(container)

    // Wait for MutationObserver to fire
    await new Promise((resolve) => setTimeout(resolve, 10))

    const link = container.querySelector('[data-zaptime-link]')
    link?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    const backdrops = document.querySelectorAll('[id$="-backdrop"]')
    expect(backdrops.length).toBeGreaterThan(0)
  })
})
