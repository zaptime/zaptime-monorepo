import type { CSSStyleObject } from '../types/styles'
import { TOKENS } from './tokens'

export const floatingButtonStyles = {
  base: {
    position: 'fixed',
    bottom: TOKENS.dimensions.buttonBottom,
    zIndex: TOKENS.zIndex.button,
    padding: `${TOKENS.dimensions.buttonPaddingY} ${TOKENS.dimensions.buttonPaddingX}`,
    border: 'none',
    borderRadius: TOKENS.borderRadius.button,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: TOKENS.dimensions.buttonGap,
    boxShadow: TOKENS.shadows.button,
    transition: `transform ${TOKENS.timing.hover} ${TOKENS.easing.hover}, box-shadow ${TOKENS.timing.hover} ${TOKENS.easing.hover}`,
    fontFamily: TOKENS.fonts.family,
    fontSize: TOKENS.fonts.size,
    fontWeight: TOKENS.fonts.weight,
  } as CSSStyleObject,

  hover: {
    transform: TOKENS.transforms.buttonHover,
    boxShadow: TOKENS.shadows.buttonHover,
  } as CSSStyleObject,

  positionLeft: {
    left: TOKENS.dimensions.buttonBottom,
  } as CSSStyleObject,

  positionRight: {
    right: TOKENS.dimensions.buttonBottom,
  } as CSSStyleObject,
}

export const inlineButtonStyles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: TOKENS.dimensions.buttonGap,
    padding: `${TOKENS.dimensions.buttonPaddingY} ${TOKENS.dimensions.buttonPaddingX}`,
    border: 'none',
    borderRadius: TOKENS.borderRadius.button,
    cursor: 'pointer',
    boxShadow: TOKENS.shadows.button,
    transition: `transform ${TOKENS.timing.hover} ${TOKENS.easing.hover}, box-shadow ${TOKENS.timing.hover} ${TOKENS.easing.hover}`,
    fontFamily: TOKENS.fonts.family,
    fontSize: TOKENS.fonts.size,
    fontWeight: TOKENS.fonts.weight,
  } as CSSStyleObject,

  hover: {
    transform: TOKENS.transforms.buttonHover,
    boxShadow: TOKENS.shadows.buttonHover,
  } as CSSStyleObject,
}
