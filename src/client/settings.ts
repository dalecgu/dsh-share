export interface ShareSettings {
  hideProcess: boolean
}

/** 过程默认折叠：导出默认只含提问和最终回答。 */
export const DEFAULT_SHARE_SETTINGS: ShareSettings = {
  hideProcess: true,
}

const HIDE_PROCESS_STORAGE_KEY = 'dsh-share.hide-process'

/** 读取失败时回到默认值，避免隐私模式下 localStorage 异常阻断导出功能。 */
export function loadShareSettings(storage?: Storage): ShareSettings {
  if (!storage) return { ...DEFAULT_SHARE_SETTINGS }
  try {
    const hideProcess = storage.getItem(HIDE_PROCESS_STORAGE_KEY)
    return {
      hideProcess: hideProcess === null
        ? DEFAULT_SHARE_SETTINGS.hideProcess
        : hideProcess === 'true',
    }
  } catch {
    return { ...DEFAULT_SHARE_SETTINGS }
  }
}

export function saveShareSettings(storage: Storage | undefined, settings: ShareSettings): void {
  if (!storage) return
  try {
    storage.setItem(HIDE_PROCESS_STORAGE_KEY, String(settings.hideProcess))
  } catch {
    // localStorage 可能被浏览器策略禁用；设置仍在当前会话内有效。
  }
}
