import type { InlineButtonOptions, ZaptimeInstance } from '../types/options'
import { inlineButtonStyles } from '../styles/button'
import { TOKENS } from '../styles/tokens'
import { applyStyles, mergeStyles } from '../styles/utils'
import { generateUniqueId } from '../utils/dom'
import { getZaptimeFreeLogo } from '../utils/icons'
import { fetchAccountStatus } from '../utils/accountStatus'
import { ZaptimeModal } from './Modal'

export function createInlineButton(options: InlineButtonOptions): ZaptimeInstance {
  const selector = options.selector

  // User's custom options (will only be applied if account is subscribed)
  const customButtonColor = options.buttonColor || TOKENS.colors.buttonDefault
  const customButtonTextColor = options.buttonTextColor || TOKENS.colors.white
  const customButtonText = options.buttonText || 'Book a Meeting'

  const id = generateUniqueId()
  let buttons: HTMLButtonElement[] = []
  let modal: ZaptimeModal | null = null
  let isSubscribed = false

  // Get token from config for account status lookup
  const token = options.config?.token as string | undefined

  /**
   * Apply button styling based on subscription status
   * - If subscribed: use custom options provided by user
   * - If not subscribed: force Zaptime branding
   */
  function applyButtonStyling(button: HTMLButtonElement): void {
    if (isSubscribed) {
      // Subscribed account - use custom styling
      const buttonStyles = mergeStyles(inlineButtonStyles.base, {
        backgroundColor: customButtonColor,
        color: customButtonTextColor,
      })
      applyStyles(button, buttonStyles)
      button.innerHTML = '<span>' + customButtonText + '</span>'
    } else {
      // Free account - show gradient Zaptime branding
      const buttonStyles = mergeStyles(inlineButtonStyles.base, {
        background:
          'linear-gradient(134.86deg, #ff8d47, #ff7447 14.76%, #ff4247 45.41%, #e92a5b 63.69%, #dd1c67 74.04%, #d31071 84.3%, #cf0283)',
        boxShadow: '0 6px 10px rgba(9, 15, 35, 0.05)',
        color: TOKENS.colors.white,
        borderRadius: '0.5rem',
        padding: '12px 24px 12px 18px',
      })
      applyStyles(button, buttonStyles)
      button.innerHTML = getZaptimeFreeLogo() + '<span>Zaptime</span>'
    }
  }

  function createButtons(): void {
    // Find all container elements matching the selector
    const containers = document.querySelectorAll(selector)
    if (containers.length === 0) {
      console.warn(`Zaptime: No containers found for selector "${selector}"`)
      return
    }

    containers.forEach((container, index) => {
      // Create inline button
      const button = document.createElement('button')
      button.id = `${id}-button-${index}`
      button.type = 'button'

      // Apply styling based on subscription status
      applyButtonStyling(button)

      // Hover effects
      button.addEventListener('mouseenter', () => {
        applyStyles(button, inlineButtonStyles.hover)
        // Free account hover - change gradient angle
        if (!isSubscribed) {
          button.style.background =
            'linear-gradient(100deg, #ff8d47, #ff7447 14.76%, #ff4247 45.41%, #e92a5b 63.69%, #dd1c67 74.04%, #d31071 84.3%, #cf0283)'
        }
      })
      button.addEventListener('mouseleave', () => {
        button.style.transform = ''
        // Restore appropriate shadow and background
        if (!isSubscribed) {
          button.style.boxShadow = '0 6px 10px rgba(9, 15, 35, 0.05)'
          button.style.background =
            'linear-gradient(134.86deg, #ff8d47, #ff7447 14.76%, #ff4247 45.41%, #e92a5b 63.69%, #dd1c67 74.04%, #d31071 84.3%, #cf0283)'
        } else {
          button.style.boxShadow = TOKENS.shadows.button
        }
      })

      // Click opens modal (shared modal instance for all buttons)
      button.addEventListener('click', () => {
        if (!modal) {
          modal = new ZaptimeModal({
            type: options.type,
            config: options.config,
            onEventChanged: options.onEventChanged,
            onOpen: options.onOpen,
            onClose: options.onClose,
          })
        }
        modal.open()
      })

      container.appendChild(button)
      buttons.push(button)
    })
  }

  function init(): void {
    // Fetch account status first, then show button
    if (token) {
      fetchAccountStatus(token).then((status) => {
        // If event type is disabled, don't show the button at all
        if (status?.disabled) {
          return
        }

        // Update subscription status
        if (status) {
          isSubscribed = status.isSubscribed
        }

        // Now create and show the buttons
        createButtons()
      })
    } else {
      // No token, show buttons immediately with default branding
      createButtons()
    }
  }

  function open(): void {
    if (!modal) {
      modal = new ZaptimeModal({
        type: options.type,
        config: options.config,
        onEventChanged: options.onEventChanged,
        onOpen: options.onOpen,
        onClose: options.onClose,
      })
    }
    modal.open()
  }

  function close(): void {
    if (modal) {
      modal.close()
    }
  }

  function destroy(): void {
    buttons.forEach((button) => {
      if (button.parentNode) {
        button.parentNode.removeChild(button)
      }
    })
    buttons = []
    if (modal) {
      modal.destroy()
      modal = null
    }
  }

  // Initialize
  init()

  return {
    id,
    open,
    close,
    destroy,
  }
}
