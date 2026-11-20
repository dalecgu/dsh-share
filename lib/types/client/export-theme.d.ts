/** HTML使用首个完整主题快照，脱离宿主后仍保持配色。 */
export declare function applyHtmlExportTheme(target: HTMLElement, sources: readonly HTMLElement[]): void;
/**
 * 在节点仍连接到宿主时保存 HTML 主题快照。
 * 图片导出移除后仍需要它：HTML 产物脱离宿主后要还原配色。
 */
export declare function saveExportTheme(source: HTMLElement, snapshot: HTMLElement): void;
//# sourceMappingURL=export-theme.d.ts.map