import type { PopupOptions, ZaptimeInstance } from '../types/options'
import { generateUniqueId } from '../utils/dom'
import { ZaptimeModal } from './Modal'

export function createPopup(options: PopupOptions = {} as PopupOptions): ZaptimeInstance {
  const selector = options.selector || '[data-zaptime-link]'
  const id = generateUniqueId()
  let modal: ZaptimeModal | null = null
  let observer: MutationObserver | null = null
  let boundElements: Element[] = []

  function getModal(): ZaptimeModal {
    if (!modal) {
      modal = new ZaptimeModal({
        type: options.type,
        config: options.config,
        onEventChanged: options.onEventChanged,
        onOpen: options.onOpen,
        onClose: options.onClose,
      })
    }
    return modal
  }

  function handleClick(e: Event): void {
    e.preventDefault()
    getModal().open()
  }

  function bindElement(element: Element): void {
    if (boundElements.indexOf(element) === -1) {
      element.addEventListener('click', handleClick)
      boundElements.push(element)
    }
  }

  function bindElements(): void {
    const elements = document.querySelectorAll(selector)
    for (let i = 0; i < elements.length; i++) {
      bindElement(elements[i])
    }
  }

  function setupObserver(): void {
    if (typeof MutationObserver === 'undefined') return

    observer = new MutationObserver((mutations) => {
      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i]
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          for (let j = 0; j < mutation.addedNodes.length; j++) {
            const node = mutation.addedNodes[j]
            if (node.nodeType === 1) {
              // Element node
              const element = node as Element
              if (element.matches && element.matches(selector)) {
                bindElement(element)
              }
              // Also check descendants
              if (element.querySelectorAll) {
                const descendants = element.querySelectorAll(selector)
                for (let k = 0; k < descendants.length; k++) {
                  bindElement(descendants[k])
                }
              }
            }
          }
        }
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }

  function open(): void {
    getModal().open()
  }

  function close(): void {
    if (modal) {
      modal.close()
    }
  }

  function destroy(): void {
    // Remove event listeners from bound elements
    for (let i = 0; i < boundElements.length; i++) {
      boundElements[i].removeEventListener('click', handleClick)
    }
    boundElements = []

    // Disconnect observer
    if (observer) {
      observer.disconnect()
      observer = null
    }

    // Destroy modal
    if (modal) {
      modal.destroy()
      modal = null
    }
  }

  // Initialize
  bindElements()
  setupObserver()

  return {
    id,
    open,
    close,
    destroy,
  }
}
