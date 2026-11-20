// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { STYLE_TEXT } from '../src/client/styles.ts'

function declarations(selector: string): string {
  const start = STYLE_TEXT.indexOf(`${selector} {`)
  expect(start).toBeGreaterThanOrEqual(0)
  return STYLE_TEXT.slice(start, STYLE_TEXT.indexOf('}', start))
}

describe('导出界面主题契约', () => {
  it('消息入口跟随官方圆角和内容字号增量', () => {
    const button = declarations('[data-dsh-share-button]')
    expect(button).toContain('border-radius: var(--dsw-radius-sm, 6px)')
    expect(button).toContain('width: calc(28px + var(--dsh-content-font-delta, 0px))')
    expect(button).toContain('height: calc(28px + var(--dsh-content-font-delta, 0px))')
    expect(declarations('[data-dsh-share-button] svg')).toContain('calc(15px + var(--dsh-content-font-delta, 0px))')
    expect(declarations('[data-clock="end"] [data-dsh-share-button] svg')).toContain('calc(17px + var(--dsh-content-font-delta, 0px))')
  })

  it('控件圆角和交互颜色使用宿主变量', () => {
    expect(STYLE_TEXT).not.toMatch(/border-radius:\s*\d/)
    expect(STYLE_TEXT).not.toContain('--dsw-static-deepseek-500')
    expect(STYLE_TEXT).not.toContain('--dsw-alias-line-border')
    // 底栏半透明皮肤下需要不透明兜底。
    expect(STYLE_TEXT).toContain('--dsh-share-panel-base')
    expect(STYLE_TEXT).toContain('var(--dsw-alias-bg-base')
    expect(STYLE_TEXT).toContain('border: 1px solid var(--dsw-alias-border-l1')
  })

  it('勾选框沿用宿主品牌色，不写死颜色', () => {
    const input = declarations('[data-dsh-share-selection-hide-process] input')
    expect(input).toContain('accent-color: var(--dsw-alias-brand-primary')
  })
})
