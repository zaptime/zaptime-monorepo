import type { FloatingButtonOptions, ZaptimeInstance } from '../types/options'
import { floatingButtonStyles } from '../styles/button'
import { TOKENS } from '../styles/tokens'
import { applyStyles, mergeStyles } from '../styles/utils'
import { generateUniqueId } from '../utils/dom'
import { getZaptimeLogo } from '../utils/icons'
import { ZaptimeModal } from './Modal'

export function createFloatingButton(options: FloatingButtonOptions = {} as FloatingButtonOptions): ZaptimeInstance {
  const position = options.position || 'bottom-right'
  const buttonColor = options.buttonColor || TOKENS.colors.buttonDefault
  const buttonTextColor = options.buttonTextColor || TOKENS.colors.white
  const buttonText = options.buttonText || 'Book a Meeting'
  const branding = options.branding !== false // Default to true (free mode shows logo)

  const id = generateUniqueId()
  let button: HTMLButtonElement | null = null
  let modal: ZaptimeModal | null = null

  function create(): void {
    // Create floating button
    button = document.createElement('button')
    button.id = `${id}-button`
    button.type = 'button'

    const positionStyles =
      position === 'bottom-left' ? floatingButtonStyles.positionLeft : floatingButtonStyles.positionRight

    const buttonStyles = mergeStyles(floatingButtonStyles.base, positionStyles, {
      backgroundColor: buttonColor,
      color: buttonTextColor,
    })

    applyStyles(button, buttonStyles)

    // Button content - branding mode shows logo, otherwise custom text
    if (branding) {
      button.innerHTML = getZaptimeLogo(buttonTextColor) + '<span>Zaptime</span>'
    } else {
      button.innerHTML = '<span>' + buttonText + '</span>'
    }

    // Hover effects
    button.addEventListener('mouseenter', () => {
      if (button) {
        applyStyles(button, floatingButtonStyles.hover)
      }
    })
    button.addEventListener('mouseleave', () => {
      if (button) {
        button.style.transform = ''
        button.style.boxShadow = TOKENS.shadows.button
      }
    })

    // Click opens modal
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

    document.body.appendChild(button)
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
    if (button && button.parentNode) {
      button.parentNode.removeChild(button)
      button = null
    }
    if (modal) {
      modal.destroy()
      modal = null
    }
  }

  // Initialize
  create()

  return {
    id,
    open,
    close,
    destroy,
  }
}
