const htmlThemes = new WeakMap<HTMLElement, ReadonlyArray<readonly [string, string]>>()
const HTML_TOKENS = /^(?:--dsw-alias-(?:bg-base|label-(?:primary|secondary|caption)|border-l[12]|link|markdown-(?:inline-code|code-block|code-block-banner))|--dsw-specific-bubble|--dsw-radius-(?:sm|lg|xl)|--dsw-font-(?:family|markdown-(?:base|h[123]|code-block))|--ds-font-family-code|--dsh-content-font-(?:size|delta))$/

/** 仅保存HTML实际消费的主题值，不复制宿主样式表或资源地址。 */
function readHtmlTheme(source: HTMLElement): ReadonlyArray<readonly [string, string]> {
  const saved = htmlThemes.get(source)
  if (saved) return saved
  if (!source.isConnected) return []
  const style = source.ownerDocument.defaultView?.getComputedStyle(source)
  if (!style) return []
  return Array.from(style).filter(name => HTML_TOKENS.test(name))
    .map(name => [name, style.getPropertyValue(name).trim()] as const)
    .filter(([, value]) => value && !/[{};<>\\]|url\s*\(|expression\s*\(/i.test(value))
}

/** HTML使用首个完整主题快照，脱离宿主后仍保持配色。 */
export function applyHtmlExportTheme(target: HTMLElement, sources: readonly HTMLElement[]): void {
  for (const source of sources) {
    const values = readHtmlTheme(source)
    if (!values.some(([name]) => name === '--dsw-alias-bg-base')
      || !values.some(([name]) => name === '--dsw-alias-label-primary')) continue
    for (const [name, value] of values) target.style.setProperty(name, value)
    return
  }
}

/**
 * 在节点仍连接到宿主时保存 HTML 主题快照。
 * 图片导出移除后仍需要它：HTML 产物脱离宿主后要还原配色。
 */
export function saveExportTheme(source: HTMLElement, snapshot: HTMLElement): void {
  htmlThemes.set(snapshot, readHtmlTheme(source))
}
