// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SHARE_SETTINGS,
  loadShareSettings,
  saveShareSettings,
} from '../src/client/settings.ts'

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

describe('导出设置', () => {
  it('默认不展示过程', () => {
    expect(DEFAULT_SHARE_SETTINGS).toEqual({ hideProcess: true })
    expect(loadShareSettings(createMemoryStorage())).toEqual({ hideProcess: true })
  })

  it('保存选择，并忽略无效的历史值', () => {
    const storage = createMemoryStorage()
    saveShareSettings(storage, { hideProcess: false })
    expect(loadShareSettings(storage)).toEqual({ hideProcess: false })

    storage.setItem('dsh-share.hide-process', 'invalid')
    expect(loadShareSettings(storage)).toEqual({ hideProcess: false })
  })

  it('没有存储时使用默认值，不抛错', () => {
    expect(loadShareSettings(undefined)).toEqual({ hideProcess: true })
    saveShareSettings(undefined, { hideProcess: false })
  })
})
