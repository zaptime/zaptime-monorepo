/**
 * ZaptimePlugin for postMessage communication with the Zaptime iframe
 */

export interface ZaptimePluginPayload {
  [key: string]: unknown
}

export interface ZaptimePluginInterface {
  postMessage: (action: string, data?: ZaptimePluginPayload) => void
  book: (payload?: ZaptimePluginPayload) => void
  reserve: (payload?: ZaptimePluginPayload) => void
  confirm: (payload?: ZaptimePluginPayload) => void
  cancel: (payload?: ZaptimePluginPayload) => void
}

export const ZaptimePlugin: ZaptimePluginInterface = {
  postMessage(action: string, data?: ZaptimePluginPayload): void {
    const iframe = document.querySelector('.zoid-visible') as HTMLIFrameElement | null

    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          action,
          data,
        },
        '*'
      )
    }
  },

  book(payload?: ZaptimePluginPayload): void {
    this.postMessage('book', payload)
  },

  reserve(payload?: ZaptimePluginPayload): void {
    this.postMessage('reserve', payload)
  },

  confirm(payload?: ZaptimePluginPayload): void {
    this.postMessage('confirm', payload)
  },

  cancel(payload?: ZaptimePluginPayload): void {
    this.postMessage('cancel', payload)
  },
}
