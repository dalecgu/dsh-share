/** 把宿主渲染出的消息节点整理成可脱离页面的导出副本。 */

function applyStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
  Object.assign(element.style, styles)
}

function normalizeText(text: string | null): string {
  return text?.replace(/\s+/g, ' ').trim() ?? ''
}

/** 把摘要行里的交互控件转为静态元素，同时保留当前运行时的 class 和图标。 */
function makeToolSummaryStatic(row: HTMLElement): void {
  for (const button of row.querySelectorAll<HTMLButtonElement>('button')) {
    const replacement = row.ownerDocument.createElement('span')
    for (const attribute of button.attributes) {
      if (attribute.name === 'class' || attribute.name === 'style' || attribute.name.startsWith('data-')) {
        replacement.setAttribute(attribute.name, attribute.value)
      }
    }
    replacement.append(...button.childNodes)
    button.replaceWith(replacement)
  }
  for (const control of row.querySelectorAll('input, textarea, select, [role="tooltip"]')) {
    control.remove()
  }
  for (const element of [row, ...row.querySelectorAll<HTMLElement>('*')]) {
    element.removeAttribute('aria-expanded')
    element.removeAttribute('data-expandable')
    element.removeAttribute('role')
    element.removeAttribute('tabindex')
  }
}

/**
 * 工具卡片内部可能包含展开面板和终端输出；这里只克隆原生折叠摘要行。
 * 摘要的运行时 class、图标和内容结构会被保留，不依赖写死的 CSS Module 类名。
 */
function cloneToolCallSummary(source: HTMLElement, locale: 'zh' | 'en'): HTMLElement {
  const clone = source.ownerDocument.createElement('div')
  clone.dataset.dshShareMessage = ''
  clone.dataset.dshShareToolCall = ''
  const summaryRows = source.querySelectorAll<HTMLElement>(
    '[data-disclosure-row], [data-sample="bash"]',
  )

  for (const summary of summaryRows) {
    if (!normalizeText(summary.textContent)) continue
    const row = summary.cloneNode(true) as HTMLElement
    row.dataset.dshShareToolSummary = ''
    makeToolSummaryStatic(row)
    clone.append(row)
  }

  if (clone.childElementCount === 0) {
    const fallback = source.ownerDocument.createElement('div')
    fallback.dataset.dshShareToolSummary = ''
    fallback.textContent = locale === 'zh' ? '工具调用' : 'Tool call'
    clone.append(fallback)
  }

  applyStyles(clone, {
    boxSizing: 'border-box',
    margin: '0',
    maxWidth: 'none',
    width: '100%',
  })
  return clone
}

export function cloneShareMessage(
  source: HTMLElement,
  locale: 'zh' | 'en',
  hideReasoning = false,
): HTMLElement {
  if (source.dataset.chatFlowKind === 'tool-call') {
    return cloneToolCallSummary(source, locale)
  }

  const clone = source.cloneNode(true) as HTMLElement
  clone.dataset.dshShareMessage = ''

  // 导出副本需要脱离页面的过程折叠状态。
  if (source.dataset.turnProcessMember === 'true' && clone.getAttribute('hidden') === 'until-found') {
    clone.removeAttribute('hidden')
  }
  clone.removeAttribute('data-turn-process-member')
  clone.removeAttribute('data-turn-process-hidden')
  clone.removeAttribute('data-turn-process-answer')

  if (hideReasoning) {
    for (const reasoning of clone.querySelectorAll<HTMLElement>('[data-turn-process-inline]')) {
      reasoning.remove()
    }
    for (const reasoning of clone.querySelectorAll<HTMLElement>('[data-variant="think"]')) {
      reasoning.remove()
    }
  } else {
    for (const reasoning of clone.querySelectorAll<HTMLElement>('[data-turn-process-inline]')) {
      if (reasoning.getAttribute('hidden') === 'until-found') reasoning.removeAttribute('hidden')
      reasoning.removeAttribute('data-turn-process-inline')
    }
  }

  // 删除 hover 操作区，避免复制、分支和本插件按钮出现在导出结果里。
  for (const hoverRoot of clone.querySelectorAll<HTMLElement>('[data-time-hover-root]')) {
    const last = hoverRoot.lastElementChild
    if (last?.querySelector('button')) last.remove()
  }
  for (const element of clone.querySelectorAll<HTMLElement>(
    'button, input, textarea, select, [data-dsh-share-button], [role="tooltip"]',
  )) {
    element.remove()
  }

  clone.removeAttribute('data-chat-anchor-key')
  clone.removeAttribute('data-chat-flow-key')
  clone.removeAttribute('data-chat-flow-kind')
  applyStyles(clone, {
    boxSizing: 'border-box',
    margin: '0',
    maxWidth: 'none',
    width: '100%',
  })
  return clone
}

/** 与 HTML 和 Markdown 导出共用的回答过程过滤规则。 */
export function visibleAssistantElements(
  elements: readonly HTMLElement[],
  hideProcess: boolean,
): HTMLElement[] {
  if (!hideProcess) return [...elements]

  const assistantSteps = elements.filter(element =>
    element.dataset.chatFlowKind === 'assistant-step' && element.dataset.chatGroupPart !== 'reasoning',
  )
  const explicitAnswers = assistantSteps.filter(element => element.dataset.turnProcessAnswer === 'true')
  if (explicitAnswers.length > 0) return explicitAnswers

  const hasTurnProcessMembers = elements.some(element => element.dataset.turnProcessMember === 'true')
  if (hasTurnProcessMembers) {
    const answers = assistantSteps.filter(element => element.dataset.turnProcessMember !== 'true')
    if (answers.length > 0) return answers
  }

  // 未折叠的视图没有过程成员标记，以最后一个回答座位为准。
  return assistantSteps.slice(-1)
}
