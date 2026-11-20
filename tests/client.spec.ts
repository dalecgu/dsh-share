// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Fragment } from 'react'
import { IconShareOutlineRegular, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import {
  apply,
  createShareRuntime,
  ShareAction,
  ShareConversationAction,
  type ShareActionProps,
  type ShareConversationActionProps,
  type ShareRuntime,
} from '../src/client/index.ts'

interface ConversationFixture {
  column: HTMLElement
  root: HTMLElement
  scroll: HTMLElement
  source: HTMLButtonElement
}

function createMemoryStorage(): Storage {
  const entries = new Map<string, string>()
  return {
    get length() { return entries.size },
    clear: () => entries.clear(),
    getItem: key => entries.get(key) ?? null,
    key: index => Array.from(entries.keys())[index] ?? null,
    removeItem: key => { entries.delete(key) },
    setItem: (key, value) => { entries.set(key, value) },
  }
}

function createConversation(): ConversationFixture {
  const root = document.createElement('main')
  root.dataset.phase = 'active'
  root.innerHTML = `
    <header><button data-header-share-source type="button">分享</button></header>
    <div data-conversation-scroll>
      <div data-test-chat-column></div>
      <div data-composer-seat><textarea>继续对话</textarea></div>
    </div>`
  document.body.append(root)
  return {
    column: root.querySelector('[data-test-chat-column]') as HTMLElement,
    root,
    scroll: root.querySelector('[data-conversation-scroll]') as HTMLElement,
    source: root.querySelector('[data-header-share-source]') as HTMLButtonElement,
  }
}

function addTurn(
  fixture: ConversationFixture,
  id: string,
  turn: number,
  process = false,
): HTMLElement {
  const container = document.createElement('div')
  container.innerHTML = process
    ? `
      <div data-chat-flow-kind="user"><div data-time-hover-root><p>问题 ${id}</p><div><button>复制</button></div></div></div>
      <div data-chat-flow-kind="assistant-step"><div data-variant="think">Think 中间步骤</div><p>中间说明</p></div>
      <div data-chat-flow-kind="tool-call"><div data-disclosure-row><span>Bash</span><span>pnpm test</span></div></div>
      <div data-chat-flow-kind="assistant-step"><div data-variant="think">Think 最终步骤</div><article><p>最终回答 ${id}</p></article></div>
      <div data-chat-flow-kind="turn-tail"><div data-turn-tail="${turn}"><div><button>复制</button><button>分支</button></div></div></div>`
    : `
      <div data-chat-flow-kind="user"><div data-time-hover-root><p>问题 ${id}</p><div><button>复制</button></div></div></div>
      <div data-chat-flow-kind="assistant-step"><article><p>回答 ${id}</p></article></div>
      <div data-chat-flow-kind="turn-tail"><div data-turn-tail="${turn}"><div><button>复制</button><button>分支</button><span>1 秒</span></div></div></div>`
  fixture.column.append(...Array.from(container.children))
  return fixture.column.querySelector(`[data-turn-tail="${turn}"]`) as HTMLElement
}

function actionProps(
  runtime: ShareRuntime,
  messageId = 'message-1',
  sessionId = 'session-1',
): ShareActionProps {
  const locale = {
    active: runtime.getLocale(),
    locales: [],
    revision: 0,
  } as const
  return {
    messageId,
    sessionId,
    shareRuntime: runtime,
    useShareLocale: selector => selector(locale),
    useShareSelection: () => { throw new Error('ShareAction must not subscribe to selection state') },
    useSessions: selector => selector({ byId: { [sessionId]: { title: '测试对话' } } } as never),
    useSession: () => { throw new Error('ShareAction must not subscribe to the session') },
  } as ShareActionProps
}

function headerProps(runtime: ShareRuntime, sessionId = 'session-1'): ShareConversationActionProps {
  const selection = runtime.selectionFor(sessionId)
  const locale = {
    active: runtime.getLocale(),
    locales: [],
    revision: 0,
  } as const
  return {
    sessionId,
    shareRuntime: runtime,
    useShareLocale: selector => selector(locale),
    useShareSelection: selector => selector(selection.getSnapshot()),
    useSessions: selector => selector({ byId: { [sessionId]: { title: '测试对话' } } } as never),
  } as ShareConversationActionProps
}

function clickHeaderShare(runtime: ShareRuntime, source: HTMLButtonElement): void {
  const tooltip = ShareConversationAction(headerProps(runtime))
  const button = tooltip.props.children
  button.props.onClick({ currentTarget: source })
}

function triggerShareAction(
  tail: HTMLElement,
  runtime: ShareRuntime,
  messageId = 'message-1',
): HTMLButtonElement {
  const button = document.createElement('button')
  button.dataset.dshShareButton = ''
  tail.lastElementChild?.append(button)
  const tooltip = ShareAction(actionProps(runtime, messageId))
  tooltip.props.children.props.onClick({ currentTarget: button })
  return button
}

beforeEach(() => {
  document.documentElement.lang = 'zh-CN'
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: createMemoryStorage(),
  })
  Object.defineProperty(window.HTMLImageElement.prototype, 'decode', {
    configurable: true,
    value: vi.fn(async () => undefined),
  })
})

afterEach(() => {
  document.body.innerHTML = ''
  document.head.innerHTML = ''
  window.localStorage.clear()
  vi.restoreAllMocks()
})

describe('分享按钮运行时', () => {
  it.each([
    ['消息', 1, false],
    ['消息', 0, true],
    ['Header', 1, false],
    ['Header', 0, true],
  ] as const)('%s 入口 detail=%s 时在打开分享前保留焦点=%s', (entry, detail, keepFocus) => {
    const fixture = createConversation()
    const tail = addTurn(fixture, 'one', 1)
    const runtime = createShareRuntime(document)
    const source = entry === 'Header' ? fixture.source : document.createElement('button')
    if (entry === '消息') tail.append(source)
    const enter = vi.spyOn(runtime, 'enterSelection').mockImplementation(() => {
      expect(document.activeElement === source).toBe(keepFocus)
    })
    const tooltip = entry === 'Header'
      ? ShareConversationAction(headerProps(runtime))
      : ShareAction(actionProps(runtime))
    source.focus()
    expect(document.activeElement).toBe(source)
    tooltip.props.children.props.onClick({ currentTarget: source, detail })
    expect(enter).toHaveBeenCalledWith('session-1', source, entry === '消息' ? 1 : undefined, '测试对话')
    runtime.dispose()
  })

  it('通过官方消息与 Header 插槽注册双入口，并在卸载时清理', () => {
    const fixture = createConversation()
    addTurn(fixture, 'one', 1)
    const disposeRegistration = vi.fn()
    const disposeLocale = vi.fn()
    const injectionDisposers: Array<() => void> = []
    const register = vi.fn(() => disposeRegistration)
    const subscribeLocale = vi.fn(() => disposeLocale)
    const injectSlot = vi.fn((_name: string, callback: () => void | (() => void)) => {
      const dispose = callback()
      if (dispose) injectionDisposers.push(dispose)
    })

    const localeSnapshot = { active: 'zh', locales: [], revision: 0 } as const
    apply({
      locale: {
        getLocale: () => localeSnapshot,
        getSnapshot: () => localeSnapshot,
        subscribe: subscribeLocale,
      },
      slots: { inject: injectSlot, register },
    } as never)

    expect(injectSlot).toHaveBeenCalledWith('conversation.chat.assistant-actions', expect.any(Function))
    expect(injectSlot).toHaveBeenCalledWith('conversation.session.header.utilities', expect.any(Function))
    const actionRegistration = register.mock.calls.find(call =>
      (call[0] as { name: string }).name === 'conversation.chat.assistant-actions')
    const headerRegistration = register.mock.calls.find(call =>
      (call[0] as { name: string }).name === 'conversation.session.header.utilities')
    const [actionOptions, actionComponent] = actionRegistration as unknown as [
      {
        name: string
        id: string
        order: number
        inject(sessionId: string): { shareRuntime: ShareRuntime }
      },
      (props: ShareActionProps) => ReturnType<typeof ShareAction>,
    ]
    expect(actionOptions).toMatchObject({
      name: 'conversation.chat.assistant-actions',
      id: 'share',
      order: 20,
    })

    const runtime = actionOptions.inject('session-one').shareRuntime
    expect(subscribeLocale).not.toHaveBeenCalled()
    expect(document.querySelector('[data-dsh-share-dialog]')).toBeNull()
    const [headerOptions, headerComponent] = headerRegistration as unknown as [
      {
        name: string
        id: string
        order: number
        inject(sessionId: string): { shareRuntime: ShareRuntime }
      },
      (props: ShareConversationActionProps) => ReturnType<typeof ShareConversationAction>,
    ]
    expect(headerOptions).toMatchObject({
      name: 'conversation.session.header.utilities',
      id: 'share-conversation',
      order: -10,
    })
    expect(headerOptions.inject('session-one').shareRuntime).toBe(runtime)
    expect(subscribeLocale).not.toHaveBeenCalled()

    const action = actionComponent(actionProps(runtime, 'message-one'))
    expect(action.type).toBe(Tooltip)
    expect(action.props).toMatchObject({ label: '分享', side: 'bottom' })
    expect(action.props.children.type).toBe('button')
    expect(action.props.children.props).toMatchObject({
      'data-dsh-share-button': '',
      'aria-label': '分享当前问答',
    })
    expect(action.props.children.props.children).toMatchObject({
      type: IconShareOutlineRegular,
      props: { size: 16 },
    })

    const header = headerComponent(headerProps(runtime))
    expect(header.type).toBe(Tooltip)
    expect(header.props).toMatchObject({ label: '分享对话', side: 'bottom' })
    expect(header.props.children.props).toMatchObject({
      'data-dsh-share-conversation': '',
      'aria-label': '分享对话',
    })
    header.props.children.props.onClick({ currentTarget: fixture.source })
    expect(subscribeLocale).toHaveBeenCalledOnce()

    const styleText = document.getElementById('dsh-share-style')?.textContent ?? ''
    expect(styleText).toContain('[data-dsh-share-button] { order: 1; }')
    expect(styleText).toContain('[data-dsh-share-turn-select]')
    expect(styleText).toContain('[data-dsh-share-selection-footer]')
    expect(styleText).toContain('height: 66px')
    // 窄屏多出一行「不展示过程」开关，底栏相应加高。
    expect(styleText).toContain('height: 148px')
    // 生成图片相关的样式随功能一起移除。
    expect(styleText).not.toContain('[data-dsh-share-card]')
    expect(styleText).not.toContain('.dsh-share-dialog__')
    expect(styleText).not.toContain('[data-dsh-share-select]')

    for (const dispose of injectionDisposers) dispose()
    expect(disposeRegistration).toHaveBeenCalledTimes(2)
    expect(disposeLocale).toHaveBeenCalledOnce()
    expect(document.querySelector('[data-dsh-share-dialog]')).toBeNull()
    expect(document.getElementById('dsh-share-style')).toBeNull()
  })

  it('使用 DSH 官方语言状态渲染英文，而不是依赖固定的 HTML lang', () => {
    const fixture = createConversation()
    const tail = addTurn(fixture, 'one', 1)
    let locale: 'zh' | 'en' = 'en'
    const runtime = createShareRuntime(document, {
      getLocale: () => locale,
      renderImage: vi.fn(async () => new Blob(['image'], { type: 'image/png' })),
    })
    const action = ShareAction(actionProps(runtime, 'message-en'))
    const header = ShareConversationAction(headerProps(runtime))

    expect(action.props.label).toBe('Share')
    expect(action.props.children.props['aria-label']).toBe('Share this Q&A')
    expect(header.props.label).toBe('Share conversation')
    expect(document.querySelector('[data-dsh-share-dialog]')).toBeNull()

    locale = 'zh'
    triggerShareAction(tail, runtime)
    const toggleLabel = fixture.scroll.querySelector('[data-dsh-share-selection-hide-process]')
    expect(toggleLabel?.textContent).toBe('不展示过程')

    runtime.dispose()
  })

  it('选择模式打开时跟随 DSH 语言刷新完整操作栏', () => {
    const fixture = createConversation()
    addTurn(fixture, 'one', 1)
    let locale: 'zh' | 'en' = 'zh'
    let notifyLocale = (): void => undefined
    const disposeLocale = vi.fn()
    const runtime = createShareRuntime(document, {
      getLocale: () => locale,
      subscribeLocale: (listener) => {
        notifyLocale = listener
        return disposeLocale
      },
    })
    clickHeaderShare(runtime, fixture.source)

    locale = 'en'
    notifyLocale()

    const footer = fixture.scroll.querySelector('[data-dsh-share-selection-footer]') as HTMLElement
    const selectAll = footer.querySelector<HTMLButtonElement>('[data-dsh-share-select-all]')
    const cancel = footer.querySelector<HTMLButtonElement>('[data-dsh-share-selection-cancel]')
    const markdown = footer.querySelector<HTMLButtonElement>('[data-dsh-share-selection-download]')
    expect(selectAll?.ariaLabel).toBe('Select all')
    expect(selectAll?.textContent).toBe('Select all')
    expect(footer.querySelector('[data-dsh-share-selection-count]')?.textContent)
      .toBe('1 conversation group selected')
    expect(cancel?.textContent).toBe('Cancel')
    expect(markdown?.ariaLabel).toBe('Download')
    expect(markdown?.querySelector('[data-dsh-share-label="compact"]')?.textContent).toBe('Download')
    expect([...fixture.scroll.querySelectorAll<HTMLButtonElement>('[data-dsh-share-turn-select]')]
      .every(button => button.ariaLabel === 'Unselect this conversation group')).toBe(true)

    runtime.cancelSelection('session-1')
    expect(disposeLocale).toHaveBeenCalledOnce()
    runtime.dispose()
    expect(disposeLocale).toHaveBeenCalledOnce()
  })

  it('运行时重复释放不会报错', () => {
    const runtime = createShareRuntime(document)
    runtime.dispose()
    runtime.dispose()
    expect(document.querySelector('[data-dsh-share-dialog]')).toBeNull()
  })

  it('把单轮分享按钮显示在分支右侧，并保持用量和时间信息在其后', () => {
    const runtime = createShareRuntime(document)
    const turnTail = document.createElement('div')
    const row = document.createElement('div')
    row.style.display = 'flex'
    row.innerHTML = `
      <button data-copy></button>
      <div data-slot="conversation.chat.assistant-actions" style="display: contents">
        <button data-dsh-share-button></button>
      </div>
      <button data-branch></button>
      <span data-usage><button></button></span>
      <span data-duration><button></button></span>
      <span data-clock></span>`
    turnTail.append(row)
    document.body.append(turnTail)

    expect(getComputedStyle(row.querySelector('[data-branch]') as HTMLElement).order).toBe('')
    expect(getComputedStyle(row.querySelector('[data-dsh-share-button]') as HTMLElement).order).toBe('1')
    expect(getComputedStyle(row.querySelector('[data-usage]') as HTMLElement).order).toBe('2')
    expect(getComputedStyle(row.querySelector('[data-duration]') as HTMLElement).order).toBe('2')
    expect(getComputedStyle(row.querySelector('[data-clock]') as HTMLElement).order).toBe('2')

    runtime.dispose()
  })

  it('进入官网式选择模式后默认全选，每轮问题和回答各放一个联动选择框', () => {
    const fixture = createConversation()
    addTurn(fixture, 'first', 1)
    addTurn(fixture, 'second', 2)
    fixture.scroll.scrollTop = 128
    const runtime = createShareRuntime(document)

    clickHeaderShare(runtime, fixture.source)

    expect(runtime.selectionFor('session-1').getSnapshot()).toMatchObject({
      active: true,
      allSelected: true,
      count: 2,
      total: 2,
    })
    const checkboxes = fixture.scroll.querySelectorAll<HTMLButtonElement>('[data-dsh-share-turn-select]')
    expect(checkboxes).toHaveLength(4)
    expect([...checkboxes].map(button => `${button.dataset.turnId}:${button.dataset.dshShareTurnSelectKind}`))
      .toEqual(['1:question', '2:question', '1:answer', '2:answer'])
    expect([...checkboxes].every(button => button.getAttribute('aria-checked') === 'true')).toBe(true)
    expect(fixture.column.querySelector(
      '[data-chat-flow-kind="user"] > [data-dsh-share-select-region="question"] [data-dsh-share-turn-select]',
    )).not.toBeNull()
    expect(fixture.column.querySelectorAll('[data-dsh-share-select-region="answer"]')).toHaveLength(2)
    expect(fixture.column.querySelectorAll('[data-dsh-share-select-content="question"]')).toHaveLength(2)
    expect(fixture.column.querySelectorAll('[data-dsh-share-select-content="answer"]')).toHaveLength(2)
    const firstQuestion = fixture.column.querySelector<HTMLElement>(
      '[data-dsh-share-select-content="question"][data-dsh-share-select-turn-id="1"]',
    )
    const firstAnswer = fixture.column.querySelector<HTMLElement>(
      '[data-dsh-share-select-content="answer"][data-dsh-share-select-turn-id="1"]',
    )
    expect(getComputedStyle(firstQuestion as HTMLElement).cursor).toBe('pointer')
    expect(getComputedStyle(firstQuestion?.querySelector('p') as HTMLElement).pointerEvents).toBe('none')
    expect(getComputedStyle(firstAnswer?.querySelector('article') as HTMLElement).pointerEvents).toBe('none')
    expect(getComputedStyle(fixture.column.querySelector('[data-dsh-share-select-sticky]') as HTMLElement).position)
      .toBe('sticky')
    expect(getComputedStyle(fixture.column.querySelector('[data-dsh-share-select-sticky]') as HTMLElement).top)
      .toBe('0px')
    expect(fixture.scroll.dataset.dshShareSelection).toBe('')
    expect(fixture.scroll.scrollTop).toBe(128)
    expect(getComputedStyle(fixture.root.querySelector('[data-composer-seat]') as HTMLElement).visibility).toBe('hidden')
    expect(getComputedStyle(fixture.root.querySelector('[data-chat-flow-kind="turn-tail"]') as HTMLElement).visibility).toBe('hidden')

    const footer = fixture.scroll.querySelector('[data-dsh-share-selection-footer]') as HTMLElement
    expect(footer).not.toBeNull()
    expect(footer.textContent).toContain('全选')
    expect(footer.textContent).toContain('已选择 2 组对话')
    expect(getComputedStyle(footer).height).toBe('66px')
    const markdown = footer.querySelector<HTMLButtonElement>('[data-dsh-share-selection-download]')
    expect(markdown?.ariaLabel).toBe('下载')
    expect(markdown?.querySelector('[data-dsh-share-label="wide"]')?.textContent).toBe('下载')
    expect(markdown?.querySelector('[data-dsh-share-label="compact"]')?.textContent).toBe('下载')
    // 底栏不再有「生成图片」按钮；下载组是最后一个控件，整体靠右。
    expect(footer.querySelector('[data-dsh-share-selection-create]')).toBeNull()
    const hideProcess = footer.querySelector<HTMLElement>('[data-dsh-share-selection-hide-process]')
    const downloadGroup = footer.querySelector<HTMLElement>('[data-dsh-share-download-group]')
    expect(hideProcess?.nextElementSibling).toBe(downloadGroup)
    expect(downloadGroup?.lastElementChild).toBe(markdown)
    expect(getComputedStyle(downloadGroup as HTMLElement).marginLeft).toBe('auto')
    expect(ShareAction(actionProps(runtime)).type).toBe(Tooltip)
    expect(ShareConversationAction(headerProps(runtime)).type).toBe(Fragment)

    runtime.dispose()
  })

  it('点击问题或回答正文会切换整组选择，并阻止原内容交互穿透', () => {
    const fixture = createConversation()
    addTurn(fixture, 'first', 1, true)
    addTurn(fixture, 'second', 2)
    const runtime = createShareRuntime(document)
    clickHeaderShare(runtime, fixture.source)

    const firstPair = fixture.scroll.querySelectorAll<HTMLButtonElement>(
      '[data-dsh-share-turn-select][data-turn-id="1"]',
    )
    const question = fixture.scroll.querySelector<HTMLElement>(
      '[data-dsh-share-select-content="question"][data-dsh-share-select-turn-id="1"]',
    )
    const answerParts = fixture.scroll.querySelectorAll<HTMLElement>(
      '[data-dsh-share-select-content="answer"][data-dsh-share-select-turn-id="1"]',
    )
    const toolControl = answerParts[1]?.querySelector<HTMLElement>('[data-disclosure-row]')

    expect(answerParts).toHaveLength(3)
    expect(getComputedStyle(toolControl as HTMLElement).pointerEvents).toBe('none')

    const answerClick = new MouseEvent('click', { bubbles: true, cancelable: true })
    answerParts[1]?.dispatchEvent(answerClick)
    expect(answerClick.defaultPrevented).toBe(true)
    expect(runtime.selectionFor('session-1').getSnapshot()).toMatchObject({ count: 1 })
    expect([...firstPair].every(button => button.getAttribute('aria-checked') === 'false')).toBe(true)

    const questionClick = new MouseEvent('click', { bubbles: true, cancelable: true })
    question?.dispatchEvent(questionClick)
    expect(questionClick.defaultPrevented).toBe(true)
    expect(runtime.selectionFor('session-1').getSnapshot()).toMatchObject({ count: 2 })
    expect([...firstPair].every(button => button.getAttribute('aria-checked') === 'true')).toBe(true)

    ;(fixture.scroll.querySelector('[data-dsh-share-selection-cancel]') as HTMLButtonElement).click()
    expect(fixture.scroll.querySelector('[data-dsh-share-select-content]')).toBeNull()

    runtime.dispose()
  })

  it.each([false, true])('过程分组展开=%s 时回答选择区域覆盖整轮且与问题联动', (expanded) => {
    const fixture = createConversation()
    addTurn(fixture, 'grouped', 1, true)
    const parts = [...fixture.column.querySelectorAll<HTMLElement>(
      '[data-chat-flow-kind="assistant-step"], [data-chat-flow-kind="tool-call"]',
    )]
    const group = document.createElement('div')
    group.dataset.stepProcess = ''
    group.innerHTML = `<button data-process-toggle>过程</button><div data-step-process-body style="height:${expanded ? 'auto' : '0px'};overflow:hidden"><div data-step-process-content></div></div>`
    parts[0]!.before(group)
    group.querySelector('[data-step-process-content]')!.append(...parts.slice(0, 2))
    const response = parts[2]!
    vi.spyOn(fixture.column, 'getBoundingClientRect').mockReturnValue({ top: 10 } as DOMRect)
    vi.spyOn(group, 'getBoundingClientRect').mockReturnValue({ top: 50 } as DOMRect)
    vi.spyOn(response, 'getBoundingClientRect').mockReturnValue({ bottom: 250 } as DOMRect)
    const runtime = createShareRuntime(document)
    try {
      clickHeaderShare(runtime, fixture.source)
      const pair = fixture.scroll.querySelectorAll<HTMLButtonElement>('[data-dsh-share-turn-select]')
      const region = fixture.column.querySelector<HTMLElement>(':scope > [data-dsh-share-select-region="answer"]')
      expect(pair).toHaveLength(2)
      expect(region?.style.top).toBe('40px')
      expect(region?.style.height).toBe('200px')
      expect(fixture.scroll.querySelectorAll('[data-dsh-share-select-content="answer"]')).toHaveLength(3)
      // 分组开关保持原有交互，不把分组标题当作导出内容或可选正文。
      const headerClick = new MouseEvent('click', { bubbles: true, cancelable: true })
      group.querySelector('button')!.dispatchEvent(headerClick)
      expect(headerClick.defaultPrevented).toBe(false)
      expect(runtime.selectionFor('session-1').getSnapshot().count).toBe(1)
      response.querySelector('p')!.click()
      expect(runtime.selectionFor('session-1').getSnapshot().count).toBe(0)
      expect([...pair].every(button => button.getAttribute('aria-checked') === 'false')).toBe(true)
      fixture.column.querySelector<HTMLElement>('[data-chat-flow-kind="user"] p')!.click()
      expect([...pair].every(button => button.getAttribute('aria-checked') === 'true')).toBe(true)
      if (expanded) {
        parts[1]!.click()
        expect(runtime.selectionFor('session-1').getSnapshot().count).toBe(0)
        pair[1]!.click()
        expect(runtime.selectionFor('session-1').getSnapshot().count).toBe(1)
      }
      runtime.cancelSelection('session-1')
      expect(fixture.scroll.querySelector('[data-dsh-share-select-content]')).toBeNull()
      expect(fixture.scroll.querySelector('[data-dsh-share-select-region]')).toBeNull()
      expect(fixture.scroll.querySelector('[data-dsh-share-select-range-root]')).toBeNull()
      expect(group.querySelectorAll('[data-chat-flow-kind]')).toHaveLength(2)
    } finally {
      runtime.dispose()
    }
  })

  it('切换已有问答组时复用快照，不重新深拷贝全部消息 DOM', async () => {
    const fixture = createConversation()
    addTurn(fixture, 'first', 1)
    addTurn(fixture, 'second', 2)
    const cloneNode = vi.spyOn(window.Node.prototype, 'cloneNode')
    const runtime = createShareRuntime(document)
    clickHeaderShare(runtime, fixture.source)
    await Promise.resolve()

    const clonesAfterEntry = cloneNode.mock.calls.length
    expect(clonesAfterEntry).toBeGreaterThan(0)

    const first = fixture.scroll.querySelector<HTMLButtonElement>('[data-turn-id="1"]')
    first?.click()
    await new Promise(resolve => window.setTimeout(resolve, 0))
    first?.click()
    await new Promise(resolve => window.setTimeout(resolve, 0))

    expect(cloneNode).toHaveBeenCalledTimes(clonesAfterEntry)
    runtime.dispose()
  })

  it('支持单组取消、全选与清空，并在零选择时禁用生成按钮', () => {
    const fixture = createConversation()
    addTurn(fixture, 'first', 1)
    addTurn(fixture, 'second', 2)
    const runtime = createShareRuntime(document)
    clickHeaderShare(runtime, fixture.source)

    const firstPair = fixture.scroll.querySelectorAll<HTMLButtonElement>(
      '[data-dsh-share-turn-select][data-turn-id="1"]',
    )
    const first = firstPair[1]
    const selectAll = fixture.scroll.querySelector<HTMLButtonElement>('[data-dsh-share-select-all]')
    const markdown = fixture.scroll.querySelector<HTMLButtonElement>('[data-dsh-share-selection-download]')
    first?.click()
    expect(runtime.selectionFor('session-1').getSnapshot()).toMatchObject({
      allSelected: false,
      count: 1,
    })
    expect(first?.getAttribute('aria-checked')).toBe('false')
    expect([...firstPair].every(button => button.getAttribute('aria-checked') === 'false')).toBe(true)
    expect(selectAll?.getAttribute('aria-checked')).toBe('false')

    selectAll?.click()
    expect(runtime.selectionFor('session-1').getSnapshot()).toMatchObject({
      allSelected: true,
      count: 2,
    })
    selectAll?.click()
    expect(runtime.selectionFor('session-1').getSnapshot()).toMatchObject({
      allSelected: false,
      count: 0,
    })
    expect(markdown?.disabled).toBe(true)

    runtime.dispose()
  })

  it('下载前可在选择栏直接切换不展示过程，无需先打开图片预览', async () => {
    const createdBlobs: Blob[] = []
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn((blob: Blob) => {
        createdBlobs.push(blob)
        return 'blob:dsh-share-markdown'
      }),
    })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() })
    vi.spyOn(window.HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    window.localStorage.clear()

    const fixture = createConversation()
    addTurn(fixture, 'process', 1, true)
    const runtime = createShareRuntime(document)
    clickHeaderShare(runtime, fixture.source)

    const toggle = fixture.scroll.querySelector<HTMLInputElement>(
      '[data-dsh-share-selection-hide-process-input]',
    )!
    const download = fixture.scroll.querySelector<HTMLButtonElement>(
      '[data-dsh-share-selection-download]',
    )!
    // 默认勾选：导出默认不展示过程。
    expect(toggle.checked).toBe(true)
    expect(document.querySelector('[data-dsh-share-dialog]')).toBeNull()
    expect(fixture.scroll.querySelector('[data-dsh-share-selection-hide-process]')?.textContent)
      .toContain('不展示过程')

    toggle.click()
    expect(toggle.checked).toBe(false)
    expect(window.localStorage.getItem('dsh-share.hide-process')).toBe('false')
    expect(document.querySelector('[data-dsh-share-dialog]')).toBeNull()

    // 在构造 Blob 时截获正文，jsdom 的 Blob 不提供 .text()。
    let markdown = ''
    const RealBlob = globalThis.Blob
    vi.stubGlobal('Blob', class extends RealBlob {
      constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options)
        if (options?.type?.startsWith('text/markdown')) markdown = String(parts?.[0] ?? '')
      }
    })
    // 取消勾选后导出保留过程内容，且整个过程不创建图片预览。
    download.click()
    await vi.waitFor(() => expect(markdown).not.toBe(''))
    expect(markdown).toContain('Think 中间步骤')
    expect(markdown).toContain('Bash')
    expect(document.querySelector('[data-dsh-share-dialog]')).toBeNull()

    vi.unstubAllGlobals()
    runtime.dispose()
    window.localStorage.clear()
  })

  it('按轮次生成不连续问答组，并可下载同一内容的 Markdown', async () => {
    const createdBlobs: Blob[] = []
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn((blob: Blob) => {
        createdBlobs.push(blob)
        return blob.type.startsWith('text/markdown') ? 'blob:dsh-share-markdown' : 'blob:dsh-share-multi'
      }),
    })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() })
    let downloadedFilename = ''
    vi.spyOn(window.HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
      downloadedFilename = this.download
    })

    const fixture = createConversation()
    addTurn(fixture, 'first', 1)
    addTurn(fixture, 'second', 2)
    addTurn(fixture, 'third', 3)
    const rendered: HTMLElement[] = []
    const renderImage = vi.fn(async (element: HTMLElement) => {
      rendered.push(element.cloneNode(true) as HTMLElement)
      return new Blob(['png'], { type: 'image/png' })
    })
    const runtime = createShareRuntime(document, { renderImage })
    clickHeaderShare(runtime, fixture.source)
    ;(fixture.scroll.querySelector('[data-dsh-share-select-all]') as HTMLButtonElement).click()
    ;(fixture.scroll.querySelector('[data-turn-id="1"]') as HTMLButtonElement).click()
    ;(fixture.scroll.querySelector('[data-turn-id="3"]') as HTMLButtonElement).click()

    const markdownButton = fixture.scroll.querySelector(
      '[data-dsh-share-selection-download]',
    ) as HTMLButtonElement
    expect(markdownButton.disabled).toBe(false)
    markdownButton.click()
    expect(createdBlobs.some(blob => blob.type.startsWith('text/markdown'))).toBe(true)
    expect(downloadedFilename).toBe('dsh-测试对话.md')

    await vi.waitFor(() => expect(fixture.scroll.querySelector('[data-dsh-share-format-trigger]')).not.toBeNull())
    fixture.scroll.querySelector<HTMLButtonElement>('[data-dsh-share-format-trigger]')!.click()
    await vi.waitFor(() => expect(document.querySelector('[role="menu"]')).not.toBeNull())
    const htmlOption = [...document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')].find(item => item.textContent?.includes('HTML'))!
    htmlOption.click()
    await vi.waitFor(() => expect(fixture.scroll.querySelector('[data-dsh-share-format-trigger]')!.textContent).toBe('HTML'))
    markdownButton.click()
    expect(markdownButton.disabled).toBe(true)
    await vi.waitFor(() => expect(downloadedFilename).toBe('dsh-测试对话.html'))
    expect(createdBlobs.some(blob => blob.type.startsWith('text/html'))).toBe(true)
    expect(markdownButton.disabled).toBe(false)

    runtime.dispose()
  })

  it('新消息渲染后补上选择框，并遵守用户当前的全选意图', async () => {
    const fixture = createConversation()
    addTurn(fixture, 'first', 1)
    const runtime = createShareRuntime(document)
    clickHeaderShare(runtime, fixture.source)

    addTurn(fixture, 'second', 2)
    await vi.waitFor(() => {
      expect(runtime.selectionFor('session-1').getSnapshot()).toMatchObject({ count: 2, total: 2 })
    })

    ;(fixture.scroll.querySelector('[data-turn-id="1"]') as HTMLButtonElement).click()
    addTurn(fixture, 'third', 3)
    await vi.waitFor(() => {
      expect(runtime.selectionFor('session-1').getSnapshot()).toMatchObject({ count: 1, total: 3 })
    })
    expect(fixture.scroll.querySelector('[data-turn-id="3"]')?.getAttribute('aria-checked')).toBe('false')

    runtime.dispose()
  })

  it('取消选择模式会完整清理选择界面并保持当前位置', () => {
    const fixture = createConversation()
    addTurn(fixture, 'first', 1)
    const runtime = createShareRuntime(document)
    clickHeaderShare(runtime, fixture.source)
    fixture.scroll.scrollTop = 246

    ;(fixture.scroll.querySelector('[data-dsh-share-selection-cancel]') as HTMLButtonElement).click()

    expect(runtime.selectionFor('session-1').getSnapshot()).toMatchObject({ active: false, count: 0, total: 0 })
    expect(fixture.scroll.querySelector('[data-dsh-share-selection-footer]')).toBeNull()
    expect(fixture.scroll.querySelector('[data-dsh-share-turn-select]')).toBeNull()
    expect(fixture.scroll.hasAttribute('data-dsh-share-selection')).toBe(false)
    expect(fixture.scroll.scrollTop).toBe(246)
    expect(getComputedStyle(fixture.root.querySelector('[data-composer-seat]') as HTMLElement).visibility).not.toBe('hidden')

    runtime.dispose()
  })

  it('点击单轮按钮后进入多选模式，仅预选当前问答组', async () => {
    const createObjectURL = vi.fn(() => 'blob:dsh-share-preview')
    const revokeObjectURL = vi.fn()
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL })

    const fixture = createConversation()
    addTurn(fixture, 'first', 1)
    const tail = addTurn(fixture, 'click', 2)
    addTurn(fixture, 'third', 3)
    const runtime = createShareRuntime(document)
    triggerShareAction(tail, runtime, 'message-2')

    expect(runtime.selectionFor('session-1').getSnapshot()).toMatchObject({
      active: true,
      allSelected: false,
      count: 1,
      total: 3,
    })
    expect(runtime.selectionFor('session-1').getSnapshot().selectedIds).toEqual(new Set(['2']))
    const checkboxes = fixture.scroll.querySelectorAll<HTMLButtonElement>('[data-dsh-share-turn-select]')
    expect(checkboxes).toHaveLength(6)
    expect([...checkboxes].filter(button => button.getAttribute('aria-checked') === 'true')
      .map(button => button.dataset.dshShareTurnSelectKind)).toEqual(['question', 'answer'])
    expect(fixture.scroll.querySelector('[data-dsh-share-selection-count]')?.textContent)
      .toBe('已选择 1 组对话')
    expect(document.querySelector('[data-dsh-share-dialog]')).toBeNull()

    runtime.dispose()
  })

  it('单轮入口只为已选问答建立快照，首次选择其他轮次后缓存复用', async () => {
    const fixture = createConversation()
    addTurn(fixture, 'first', 1)
    const secondTail = addTurn(fixture, 'second', 2)
    addTurn(fixture, 'third', 3)
    const cloneNode = vi.spyOn(window.Node.prototype, 'cloneNode')
    const runtime = createShareRuntime(document)
    triggerShareAction(secondTail, runtime, 'message-2')
    await Promise.resolve()

    expect(cloneNode).toHaveBeenCalledTimes(2)
    const first = fixture.scroll.querySelector<HTMLButtonElement>('[data-turn-id="1"]')
    first?.click()
    await Promise.resolve()
    expect(cloneNode).toHaveBeenCalledTimes(4)

    first?.click()
    first?.click()
    await Promise.resolve()
    expect(cloneNode).toHaveBeenCalledTimes(4)

    runtime.dispose()
  })

  it('勾选不展示过程后导出的 Markdown 不含 Think、工具调用和中间步骤', async () => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:dsh-share-markdown'),
    })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() })
    vi.spyOn(window.HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    window.localStorage.clear()

    const fixture = createConversation()
    const tail = addTurn(fixture, 'clean', 1, true)
    const runtime = createShareRuntime(document)

    // 先取消默认勾选，确认过程内容会被导出。
    const toggle = () => fixture.scroll.querySelector<HTMLInputElement>(
      '[data-dsh-share-selection-hide-process-input]',
    )!
    let exported = ''
    const RealBlob = globalThis.Blob
    vi.stubGlobal('Blob', class extends RealBlob {
      constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options)
        if (options?.type?.startsWith('text/markdown')) exported = String(parts?.[0] ?? '')
      }
    })

    triggerShareAction(tail, runtime)
    expect(toggle().checked).toBe(true)
    toggle().click()
    expect(toggle().checked).toBe(false)
    ;(fixture.scroll.querySelector('[data-dsh-share-selection-download]') as HTMLButtonElement).click()
    await vi.waitFor(() => expect(exported).not.toBe(''))
    expect(exported).toContain('Think 中间步骤')
    expect(exported).toContain('Bash')

    exported = ''
    toggle().click()
    expect(toggle().checked).toBe(true)
    ;(fixture.scroll.querySelector('[data-dsh-share-selection-download]') as HTMLButtonElement).click()
    await vi.waitFor(() => expect(exported).not.toBe(''))
    expect(exported).toContain('最终回答 clean')
    expect(exported).not.toContain('Think')
    expect(exported).not.toContain('Bash')
    expect(exported).not.toContain('中间说明')

    vi.unstubAllGlobals()
    runtime.dispose()
    window.localStorage.clear()
  })
})
