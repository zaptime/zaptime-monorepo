import type { CSSStyleObject } from '../types/styles'
import { TOKENS } from './tokens'

export interface ModalStyleSet {
  backdrop: CSSStyleObject
  backdropVisible: CSSStyleObject
  container: CSSStyleObject
  containerVisible: CSSStyleObject
  closeButton: CSSStyleObject
  closeButtonHover: CSSStyleObject
  content: CSSStyleObject
}

function createModalStyles(isDark: boolean): ModalStyleSet {
  const colors = isDark ? TOKENS.colors.dark : TOKENS.colors.light

  return {
    backdrop: {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: colors.backdrop,
      zIndex: TOKENS.zIndex.modal,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: '0',
      transition: `opacity ${TOKENS.timing.fadeIn} ${TOKENS.easing.default}`,
    },

    backdropVisible: {
      opacity: '1',
    },

    container: {
      position: 'relative',
      backgroundColor: colors.modalBg,
      borderRadius: TOKENS.borderRadius.modal,
      boxShadow: TOKENS.shadows.modal,
      width: TOKENS.dimensions.modalWidth,
      maxWidth: TOKENS.dimensions.modalMaxWidth,
      height: TOKENS.dimensions.modalHeight,
      maxHeight: TOKENS.dimensions.modalMaxHeight,
      overflow: 'hidden',
      transform: TOKENS.transforms.modalHidden,
      transition: `transform ${TOKENS.timing.fadeIn} ${TOKENS.easing.default}, background-color ${TOKENS.timing.fadeIn} ${TOKENS.easing.default}`,
    },

    containerVisible: {
      transform: TOKENS.transforms.modalVisible,
    },

    closeButton: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      width: TOKENS.dimensions.closeButtonSize,
      height: TOKENS.dimensions.closeButtonSize,
      border: 'none',
      backgroundColor: colors.closeButtonBg,
      color: colors.closeButtonColor,
      borderRadius: TOKENS.borderRadius.closeButton,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: TOKENS.zIndex.closeButton,
      transition: `background-color ${TOKENS.timing.hover} ${TOKENS.easing.hover}`,
    },

    closeButtonHover: {
      backgroundColor: colors.closeButtonHoverBg,
    },

    content: {
      width: '100%',
      height: '100%',
      overflow: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }
}

// Export light mode styles as default for backwards compatibility
export const modalStyles = createModalStyles(false)

// Export dark mode styles
export const modalStylesDark = createModalStyles(true)

// Export factory function for dynamic usage
export { createModalStyles }
