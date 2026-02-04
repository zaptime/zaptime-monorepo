import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  fetchAccountStatus,
  getAccountStatus,
  isAccountSubscribed,
  isEventTypeDisabled,
  onAccountStatus,
  clearAccountStatus,
  setAccountStatus,
} from '../src/zaptime-init/utils/accountStatus'

describe('accountStatus', () => {
  beforeEach(() => {
    clearAccountStatus()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    clearAccountStatus()
  })

  describe('fetchAccountStatus', () => {
    it('should fetch and cache account status from API', async () => {
      const token = 'test-token'
      const mockResponse = {
        data: {
          isSubscribed: true,
          disabled: false,
        },
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const status = await fetchAccountStatus(token)

      expect(fetch).toHaveBeenCalledWith(
        'https://api.zaptime.app/event-types/init',
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        })
      )

      expect(status).toEqual({
        isSubscribed: true,
        disabled: false,
        token,
      })
    })

    it('should return cached status on subsequent calls', async () => {
      const token = 'cached-token'
      const mockResponse = {
        data: {
          isSubscribed: true,
          disabled: false,
        },
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      // First call
      await fetchAccountStatus(token)

      // Reset mock to verify second call doesn't fetch
      vi.mocked(fetch).mockClear()

      // Second call should use cache
      const status = await fetchAccountStatus(token)

      expect(fetch).not.toHaveBeenCalled()
      expect(status).toEqual({
        isSubscribed: true,
        disabled: false,
        token,
      })
    })

    it('should return null on API error', async () => {
      const token = 'error-token'

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      })

      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const status = await fetchAccountStatus(token)

      expect(status).toBeNull()
      expect(consoleWarn).toHaveBeenCalled()

      consoleWarn.mockRestore()
    })

    it('should return null on network error', async () => {
      const token = 'network-error-token'

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const status = await fetchAccountStatus(token)

      expect(status).toBeNull()
      expect(consoleWarn).toHaveBeenCalled()

      consoleWarn.mockRestore()
    })

    it('should call pending callbacks when status is received', async () => {
      const token = 'callback-token'
      const callback = vi.fn()
      const mockResponse = {
        data: {
          isSubscribed: true,
          disabled: false,
        },
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      // Register callback before fetching
      onAccountStatus(token, callback)

      // Fetch status
      await fetchAccountStatus(token)

      expect(callback).toHaveBeenCalledWith({
        isSubscribed: true,
        disabled: false,
        token,
      })
    })
  })

  describe('getAccountStatus', () => {
    it('should return null for unknown token', () => {
      expect(getAccountStatus('unknown-token')).toBeNull()
    })

    it('should return cached status', () => {
      const token = 'get-token'
      setAccountStatus(token, { isSubscribed: true, disabled: false })

      expect(getAccountStatus(token)).toEqual({
        isSubscribed: true,
        disabled: false,
        token,
      })
    })
  })

  describe('isAccountSubscribed', () => {
    it('should return null for unknown token', () => {
      expect(isAccountSubscribed('unknown-token')).toBeNull()
    })

    it('should return true for subscribed account', () => {
      const token = 'subscribed-token'
      setAccountStatus(token, { isSubscribed: true, disabled: false })

      expect(isAccountSubscribed(token)).toBe(true)
    })

    it('should return false for unsubscribed account', () => {
      const token = 'free-token'
      setAccountStatus(token, { isSubscribed: false, disabled: false })

      expect(isAccountSubscribed(token)).toBe(false)
    })
  })

  describe('isEventTypeDisabled', () => {
    it('should return null for unknown token', () => {
      expect(isEventTypeDisabled('unknown-token')).toBeNull()
    })

    it('should return true for disabled event type', () => {
      const token = 'disabled-token'
      setAccountStatus(token, { isSubscribed: true, disabled: true })

      expect(isEventTypeDisabled(token)).toBe(true)
    })

    it('should return false for enabled event type', () => {
      const token = 'enabled-token'
      setAccountStatus(token, { isSubscribed: true, disabled: false })

      expect(isEventTypeDisabled(token)).toBe(false)
    })
  })

  describe('onAccountStatus', () => {
    it('should call callback immediately if status is cached', () => {
      const token = 'immediate-token'
      const callback = vi.fn()

      setAccountStatus(token, { isSubscribed: true, disabled: false })

      onAccountStatus(token, callback)

      expect(callback).toHaveBeenCalledWith({
        isSubscribed: true,
        disabled: false,
        token,
      })
    })

    it('should queue callback if status is not yet available', () => {
      const token = 'pending-token'
      const callback = vi.fn()

      onAccountStatus(token, callback)

      // Callback should not be called yet
      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('clearAccountStatus', () => {
    it('should clear specific token', () => {
      const token = 'clear-token'
      setAccountStatus(token, { isSubscribed: true, disabled: false })

      expect(getAccountStatus(token)).not.toBeNull()

      clearAccountStatus(token)

      expect(getAccountStatus(token)).toBeNull()
    })

    it('should clear all tokens when called without argument', () => {
      const tokens = ['token1', 'token2', 'token3']
      tokens.forEach((token) => {
        setAccountStatus(token, { isSubscribed: true, disabled: false })
      })

      tokens.forEach((token) => {
        expect(getAccountStatus(token)).not.toBeNull()
      })

      clearAccountStatus()

      tokens.forEach((token) => {
        expect(getAccountStatus(token)).toBeNull()
      })
    })
  })

  describe('setAccountStatus', () => {
    it('should set account status directly', () => {
      const token = 'set-token'

      setAccountStatus(token, { isSubscribed: true, disabled: true })

      expect(getAccountStatus(token)).toEqual({
        isSubscribed: true,
        disabled: true,
        token,
      })
    })
  })
})
