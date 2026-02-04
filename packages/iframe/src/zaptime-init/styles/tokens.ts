/**
 * Design tokens for Zaptime components
 * Extracts magic values for maintainability
 */

export const TOKENS = {
  zIndex: {
    modal: '2147483647',
    button: '2147483646',
    closeButton: '10',
  },
  colors: {
    light: {
      backdrop: 'rgba(0, 0, 0, 0.5)',
      modalBg: '#ffffff',
      closeButtonBg: 'rgba(0, 0, 0, 0.05)',
      closeButtonHoverBg: 'rgba(0, 0, 0, 0.1)',
      closeButtonColor: '#374151',
    },
    dark: {
      backdrop: 'rgba(0, 0, 0, 0.7)',
      modalBg: '#171717',
      closeButtonBg: 'rgba(255, 255, 255, 0.1)',
      closeButtonHoverBg: 'rgba(255, 255, 255, 0.2)',
      closeButtonColor: '#e5e7eb',
    },
    buttonDefault: '#15B79E',
    white: '#ffffff',
  },
  timing: {
    fadeIn: '0.2s',
    hover: '0.15s',
  },
  easing: {
    default: 'ease-in-out',
    hover: 'ease',
  },
  borderRadius: {
    modal: '12px',
    button: '9999px',
    closeButton: '50%',
  },
  shadows: {
    modal: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    button: '0 4px 14px rgba(0, 0, 0, 0.15)',
    buttonHover: '0 6px 20px rgba(0, 0, 0, 0.2)',
  },
  dimensions: {
    modalWidth: '90vw',
    modalMaxWidth: '1050px',
    modalHeight: '90vh',
    modalMaxHeight: '850px',
    contentMaxWidth: '1050px',
    closeButtonSize: '32px',
    buttonPaddingY: '12px',
    buttonPaddingX: '24px',
    buttonGap: '8px',
    buttonBottom: '24px',
  },
  fonts: {
    family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    size: '14px',
    weight: '500',
  },
  transforms: {
    modalHidden: 'scale(0.95)',
    modalVisible: 'scale(1)',
    buttonHover: 'translateY(-2px)',
  },
} as const

export type Tokens = typeof TOKENS
