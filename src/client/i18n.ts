export type ShareLocale = 'zh' | 'en'

export function normalizeShareLocale(locale: string): ShareLocale {
  return locale.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

export interface Translation {
  share: string
  shareTooltip: string
  shareConversation: string
  cancelSelection: string
  selectAll: string
  selectedCount(count: number): string
  selectTurn: string
  unselectTurn: string
  downloadFile: string
  downloadFormat: string
  htmlExporting: string
  htmlExportFailed: string
  htmlMissingImages: string
  hideProcess: string
}
export function getDocumentLocale(document: Document): ShareLocale {
  return normalizeShareLocale(document.documentElement.lang)
}

export function t(locale: ShareLocale): Translation {
  if (locale === 'zh') {
    return {
      share: '分享当前问答',
      shareTooltip: '分享',
      shareConversation: '分享对话',
      cancelSelection: '取消',
      selectAll: '全选',
      selectedCount: count => `已选择 ${count} 组对话`,
      selectTurn: '选择这组对话',
      unselectTurn: '取消选择这组对话',
      downloadFile: '下载',
      downloadFormat: '下载格式',
      htmlExporting: '正在生成 HTML…',
      htmlExportFailed: 'HTML 生成失败，请重试。',
      htmlMissingImages: '部分图片无法内嵌，已在 HTML 中标记。',
      hideProcess: '不展示过程',
    }
  }
  return {
    share: 'Share this Q&A',
    shareTooltip: 'Share',
    shareConversation: 'Share conversation',
    cancelSelection: 'Cancel',
    selectAll: 'Select all',
    selectedCount: count => `${count} conversation ${count === 1 ? 'group' : 'groups'} selected`,
    selectTurn: 'Select this conversation group',
    unselectTurn: 'Unselect this conversation group',
    downloadFile: 'Download',
    downloadFormat: 'Download format',
    htmlExporting: 'Generating HTML…',
    htmlExportFailed: 'Could not generate HTML. Please try again.',
    htmlMissingImages: 'Some images could not be embedded and are marked in the HTML.',
    hideProcess: 'Hide process',
  }
}
