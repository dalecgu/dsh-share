import { expect, it } from 'vitest'
import { STYLE_TEXT } from '../src/client/styles.ts'

it('下载与格式选择保持次级样式，下载组靠右排列', () => {
  expect(STYLE_TEXT).toContain('[data-dsh-share-selection-cancel],\n[data-dsh-share-selection-download],\n[data-dsh-share-format-trigger] {\n  background: transparent;')
  // 下载组用 margin-left:auto 吃掉中间空白，使按钮落在底栏右侧。
  expect(STYLE_TEXT).toContain('[data-dsh-share-download-group] { display: inline-flex; align-items: center; margin-left: auto; }')
  // 生成图片按钮已移除。
  expect(STYLE_TEXT).not.toContain('[data-dsh-share-selection-create]')
})
