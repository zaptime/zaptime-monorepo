import type { InlineButtonOptions, ZaptimeInstance } from '../types/options'
import { inlineButtonStyles } from '../styles/button'
import { TOKENS } from '../styles/tokens'
import { applyStyles, mergeStyles } from '../styles/utils'
import { generateUniqueId } from '../utils/dom'
import { fetchAccountStatus } from '../utils/accountStatus'
import { ZaptimeModal } from './Modal'

export function createInlineButton(options: InlineButtonOptions): ZaptimeInstance {
  const selector = options.selector

  // User's custom styling options
  const customButtonColor = options.buttonColor || TOKENS.colors.buttonDefault
  const customButtonTextColor = options.buttonTextColor || TOKENS.colors.white
  const customButtonText = options.buttonText || 'Book a Meeting'

  const id = generateUniqueId()
  let buttons: HTMLButtonElement[] = []
  let modal: ZaptimeModal | null = null

  // Get token from config for account status lookup
  const token = options.config?.token as string | undefined

  /**
   * Apply button styling with custom options
   * Only called for subscribed accounts (free accounts don't render InlineButton)
   */
  function applyButtonStyling(button: HTMLButtonElement): void {
    const buttonStyles = mergeStyles(inlineButtonStyles.base, {
      backgroundColor: customButtonColor,
      color: customButtonTextColor,
    })
    applyStyles(button, buttonStyles)
    button.innerHTML = '<span>' + customButtonText + '</span>'
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

      // Apply custom styling
      applyButtonStyling(button)

      // Hover effects
      button.addEventListener('mouseenter', () => {
        applyStyles(button, inlineButtonStyles.hover)
      })
      button.addEventListener('mouseleave', () => {
        button.style.transform = ''
        button.style.boxShadow = TOKENS.shadows.button
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
    // InlineButton is only available for paid accounts
    // Without a token, we can't verify subscription status
    if (!token) {
      return
    }

    fetchAccountStatus(token).then((status) => {
      // If event type is disabled, don't show the button
      if (status?.disabled) {
        return
      }

      // Only show button for subscribed accounts
      if (!status?.isSubscribed) {
        return
      }

      // Create and show the buttons for paid users
      createButtons()
    })
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
