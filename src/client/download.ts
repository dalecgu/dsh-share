import { createDownloadFilename } from './filename.ts'

export function downloadMarkdownFile(document: Document, markdown: string, title?: string): void {
  if (!markdown) return
  const objectUrl = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = createDownloadFilename('md', title)
  anchor.click()
  document.defaultView?.setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
}

/** 下载独立HTML文档，给宿主留出读取Blob的时间。 */
export function downloadHtmlFile(document: Document, html: string, title?: string): void {
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = createDownloadFilename('html', title)
  anchor.click()
  document.defaultView?.setTimeout(() => URL.revokeObjectURL(url), 60000)
}
