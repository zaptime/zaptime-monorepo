/**
 * Account status management for enforcing branding on free accounts
 * Fetches status from API endpoint on init
 */

export interface AccountStatus {
  isSubscribed: boolean
  disabled: boolean
  token: string
}

type AccountStatusCallback = (status: AccountStatus) => void

// Store account status by token
const accountStatusMap = new Map<string, AccountStatus>()
const pendingCallbacks = new Map<string, AccountStatusCallback[]>()
const fetchingTokens = new Set<string>()

const API_BASE_URL = 'https://api.zaptime.app'

/**
 * Fetch account status from API
 */
export async function fetchAccountStatus(token: string): Promise<AccountStatus | null> {
  // If already fetched, return cached
  const cached = accountStatusMap.get(token)
  if (cached) {
    return cached
  }

  // If already fetching, wait for it
  if (fetchingTokens.has(token)) {
    return new Promise((resolve) => {
      onAccountStatus(token, resolve)
    })
  }

  fetchingTokens.add(token)

  try {
    const response = await fetch(`${API_BASE_URL}/event-types/init`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      console.warn(`[Zaptime] Failed to fetch account status: ${response.status}`)
      fetchingTokens.delete(token)
      return null
    }

    const data = await response.json()

    const status: AccountStatus = {
      isSubscribed: Boolean(data.data?.isSubscribed),
      disabled: Boolean(data.data?.disabled),
      token,
    }

    // Cache the status
    accountStatusMap.set(token, status)
    fetchingTokens.delete(token)

    // Notify any pending callbacks
    const callbacks = pendingCallbacks.get(token)
    if (callbacks) {
      callbacks.forEach((cb) => cb(status))
      pendingCallbacks.delete(token)
    }

    return status
  } catch (error) {
    console.warn('[Zaptime] Error fetching account status:', error)
    fetchingTokens.delete(token)
    return null
  }
}

/**
 * Get cached account status for a token
 */
export function getAccountStatus(token: string): AccountStatus | null {
  return accountStatusMap.get(token) ?? null
}

/**
 * Check if account is subscribed (returns cached value or null if unknown)
 */
export function isAccountSubscribed(token: string): boolean | null {
  const status = accountStatusMap.get(token)
  return status?.isSubscribed ?? null
}

/**
 * Check if event type is disabled (returns cached value or null if unknown)
 */
export function isEventTypeDisabled(token: string): boolean | null {
  const status = accountStatusMap.get(token)
  return status?.disabled ?? null
}

/**
 * Register a callback to be called when account status is received
 */
export function onAccountStatus(token: string, callback: AccountStatusCallback): void {
  // If we already have the status, call immediately
  const cached = accountStatusMap.get(token)
  if (cached) {
    callback(cached)
    return
  }

  // Otherwise, queue the callback
  const existing = pendingCallbacks.get(token) || []
  existing.push(callback)
  pendingCallbacks.set(token, existing)
}

/**
 * Clear account status (useful for testing)
 */
export function clearAccountStatus(token?: string): void {
  if (token) {
    accountStatusMap.delete(token)
    pendingCallbacks.delete(token)
    fetchingTokens.delete(token)
  } else {
    accountStatusMap.clear()
    pendingCallbacks.clear()
    fetchingTokens.clear()
  }
}

/**
 * Set account status directly (useful for testing)
 */
export function setAccountStatus(token: string, status: Omit<AccountStatus, 'token'>): void {
  accountStatusMap.set(token, { ...status, token })
}
