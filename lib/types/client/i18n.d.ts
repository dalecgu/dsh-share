export type ShareLocale = 'zh' | 'en';
export declare function normalizeShareLocale(locale: string): ShareLocale;
export interface Translation {
    share: string;
    shareTooltip: string;
    shareConversation: string;
    cancelSelection: string;
    selectAll: string;
    selectedCount(count: number): string;
    selectTurn: string;
    unselectTurn: string;
    downloadFile: string;
    downloadFormat: string;
    htmlExporting: string;
    htmlExportFailed: string;
    htmlMissingImages: string;
    hideProcess: string;
}
export declare function getDocumentLocale(document: Document): ShareLocale;
export declare function t(locale: ShareLocale): Translation;
//# sourceMappingURL=i18n.d.ts.map