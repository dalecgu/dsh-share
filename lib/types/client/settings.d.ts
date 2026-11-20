export interface ShareSettings {
    hideProcess: boolean;
}
/** 过程默认折叠：导出默认只含提问和最终回答。 */
export declare const DEFAULT_SHARE_SETTINGS: ShareSettings;
/** 读取失败时回到默认值，避免隐私模式下 localStorage 异常阻断导出功能。 */
export declare function loadShareSettings(storage?: Storage): ShareSettings;
export declare function saveShareSettings(storage: Storage | undefined, settings: ShareSettings): void;
//# sourceMappingURL=settings.d.ts.map