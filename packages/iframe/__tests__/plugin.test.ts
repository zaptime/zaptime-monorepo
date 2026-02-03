import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ZaptimePlugin } from '../src/zaptime-init/plugin/ZaptimePlugin'

describe('ZaptimePlugin', () => {
  let mockIframe: HTMLIFrameElement
  let mockContentWindow: { postMessage: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    document.body.innerHTML = ''
    mockContentWindow = {
      postMessage: vi.fn(),
    }
    mockIframe = document.createElement('iframe')
    mockIframe.className = 'zoid-visible'
    Object.defineProperty(mockIframe, 'contentWindow', {
      value: mockContentWindow,
      writable: true,
    })
    document.body.appendChild(mockIframe)
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe('postMessage', () => {
    it('should send postMessage to zoid iframe', () => {
      ZaptimePlugin.postMessage('test-action', { key: 'value' })

      expect(mockContentWindow.postMessage).toHaveBeenCalledWith(
        { action: 'test-action', data: { key: 'value' } },
        '*'
      )
    })

    it('should not throw if no iframe found', () => {
      document.body.innerHTML = ''

      expect(() => {
        ZaptimePlugin.postMessage('test-action')
      }).not.toThrow()
    })

    it('should handle undefined data', () => {
      ZaptimePlugin.postMessage('test-action')

      expect(mockContentWindow.postMessage).toHaveBeenCalledWith({ action: 'test-action', data: undefined }, '*')
    })
  })

  describe('book', () => {
    it('should send book action', () => {
      ZaptimePlugin.book({ eventId: '123' })

      expect(mockContentWindow.postMessage).toHaveBeenCalledWith(
        { action: 'book', data: { eventId: '123' } },
        '*'
      )
    })

    it('should work without payload', () => {
      ZaptimePlugin.book()

      expect(mockContentWindow.postMessage).toHaveBeenCalledWith({ action: 'book', data: undefined }, '*')
    })
  })

  describe('reserve', () => {
    it('should send reserve action', () => {
      ZaptimePlugin.reserve({ slotId: '456' })

      expect(mockContentWindow.postMessage).toHaveBeenCalledWith(
        { action: 'reserve', data: { slotId: '456' } },
        '*'
      )
    })
  })

  describe('confirm', () => {
    it('should send confirm action', () => {
      ZaptimePlugin.confirm({ bookingId: '789' })

      expect(mockContentWindow.postMessage).toHaveBeenCalledWith(
        { action: 'confirm', data: { bookingId: '789' } },
        '*'
      )
    })
  })

  describe('cancel', () => {
    it('should send cancel action', () => {
      ZaptimePlugin.cancel({ bookingId: '789' })

      expect(mockContentWindow.postMessage).toHaveBeenCalledWith(
        { action: 'cancel', data: { bookingId: '789' } },
        '*'
      )
    })
  })
})
