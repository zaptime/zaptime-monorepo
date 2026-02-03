import { describe, it, expect, beforeEach } from 'vitest'
import { applyStyles, mergeStyles } from '../src/zaptime-init/styles/utils'
import { TOKENS } from '../src/zaptime-init/styles/tokens'
import { modalStyles } from '../src/zaptime-init/styles/modal'
import { floatingButtonStyles } from '../src/zaptime-init/styles/button'

describe('applyStyles', () => {
  let element: HTMLDivElement

  beforeEach(() => {
    element = document.createElement('div')
  })

  it('should apply styles to an element', () => {
    applyStyles(element, {
      backgroundColor: 'red',
      color: 'blue',
    })

    expect(element.style.backgroundColor).toBe('red')
    expect(element.style.color).toBe('blue')
  })

  it('should handle empty style object', () => {
    applyStyles(element, {})
    // Should not throw
    expect(element.style.cssText).toBe('')
  })

  it('should skip undefined values', () => {
    element.style.color = 'blue'
    applyStyles(element, {
      backgroundColor: 'red',
      color: undefined,
    })

    expect(element.style.backgroundColor).toBe('red')
    expect(element.style.color).toBe('blue')
  })
})

describe('mergeStyles', () => {
  it('should merge two style objects', () => {
    const result = mergeStyles({ color: 'red' }, { backgroundColor: 'blue' })

    expect(result).toEqual({
      color: 'red',
      backgroundColor: 'blue',
    })
  })

  it('should override with later styles', () => {
    const result = mergeStyles({ color: 'red' }, { color: 'blue' })

    expect(result.color).toBe('blue')
  })

  it('should handle multiple style objects', () => {
    const result = mergeStyles({ color: 'red' }, { backgroundColor: 'blue' }, { fontSize: '14px' })

    expect(result).toEqual({
      color: 'red',
      backgroundColor: 'blue',
      fontSize: '14px',
    })
  })

  it('should handle empty objects', () => {
    const result = mergeStyles({}, { color: 'red' }, {})

    expect(result).toEqual({ color: 'red' })
  })
})

describe('TOKENS', () => {
  it('should have zIndex tokens', () => {
    expect(TOKENS.zIndex.modal).toBe('2147483647')
    expect(TOKENS.zIndex.button).toBe('2147483646')
  })

  it('should have color tokens', () => {
    expect(TOKENS.colors.buttonDefault).toBe('#15B79E')
    expect(TOKENS.colors.white).toBe('#ffffff')
  })

  it('should have dimension tokens', () => {
    expect(TOKENS.dimensions.modalMaxWidth).toBe('900px')
    expect(TOKENS.dimensions.modalMaxHeight).toBe('850px')
  })
})

describe('modalStyles', () => {
  it('should have backdrop styles', () => {
    expect(modalStyles.backdrop.position).toBe('fixed')
    expect(modalStyles.backdrop.zIndex).toBe(TOKENS.zIndex.modal)
  })

  it('should have container styles', () => {
    expect(modalStyles.container.borderRadius).toBe(TOKENS.borderRadius.modal)
    expect(modalStyles.container.maxWidth).toBe(TOKENS.dimensions.modalMaxWidth)
  })

  it('should have visible states', () => {
    expect(modalStyles.backdropVisible.opacity).toBe('1')
    expect(modalStyles.containerVisible.transform).toBe(TOKENS.transforms.modalVisible)
  })
})

describe('floatingButtonStyles', () => {
  it('should have base styles', () => {
    expect(floatingButtonStyles.base.position).toBe('fixed')
    expect(floatingButtonStyles.base.cursor).toBe('pointer')
  })

  it('should have position styles', () => {
    expect(floatingButtonStyles.positionLeft.left).toBe(TOKENS.dimensions.buttonBottom)
    expect(floatingButtonStyles.positionRight.right).toBe(TOKENS.dimensions.buttonBottom)
  })

  it('should have hover styles', () => {
    expect(floatingButtonStyles.hover.transform).toBe(TOKENS.transforms.buttonHover)
    expect(floatingButtonStyles.hover.boxShadow).toBe(TOKENS.shadows.buttonHover)
  })
})
