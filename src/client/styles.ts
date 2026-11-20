export const STYLE_ID = 'dsh-share-style'

export const STYLE_TEXT: string = `
/* Match the chat surface and keep translucent themes backed by an opaque color. */
[data-dsh-share-selection-footer],
[data-dsh-share-dialog] {
  --dsh-share-panel-base: #fff;
  background-color: var(--dsh-share-panel-base);
  background-image: linear-gradient(
    var(--dsw-alias-bg-base, transparent),
    var(--dsw-alias-bg-base, transparent)
  );
}
body[data-ds-dark-theme] [data-dsh-share-selection-footer],
body[data-ds-dark-theme] [data-dsh-share-dialog] {
  --dsh-share-panel-base: #151517;
}
[data-dsh-share-button] {
  align-items: center;
  appearance: none;
  background: transparent;
  border: 0;
  border-radius: var(--dsw-radius-sm, 6px);
  color: var(--dsw-alias-label-tertiary, currentColor);
  cursor: pointer;
  display: inline-flex;
  height: calc(28px + var(--dsh-content-font-delta, 0px));
  justify-content: center;
  margin: 0;
  padding: 6px;
  width: calc(28px + var(--dsh-content-font-delta, 0px));
}
[data-dsh-share-button] svg {
  width: calc(15px + var(--dsh-content-font-delta, 0px));
  height: calc(15px + var(--dsh-content-font-delta, 0px));
}
[data-clock="end"] [data-dsh-share-button] svg {
  width: calc(17px + var(--dsh-content-font-delta, 0px));
  height: calc(17px + var(--dsh-content-font-delta, 0px));
}
/* 官方 slot 固定在分支按钮前；只调整 flex 视觉顺序，不移动 React 管理的 DOM。 */
[data-dsh-share-button] { order: 1; }
div:has([data-dsh-share-button]) > span { order: 2; }
[data-dsh-share-button]:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(127, 127, 127, .12));
  color: var(--dsw-alias-label-secondary, currentColor);
  opacity: 1;
}
[data-dsh-share-button]:disabled { cursor: wait; opacity: .38; }
[data-dsh-share-conversation] {
  align-items: center;
  appearance: none;
  background: transparent;
  border: 0;
  border-radius: var(--dsw-radius-sm, 6px);
  color: var(--dsw-alias-label-primary, currentColor);
  cursor: pointer;
  display: inline-flex;
  height: 34px;
  justify-content: center;
  padding: 0;
  width: 34px;
}
[data-dsh-share-conversation]:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127, 127, 127, .12)); }

/* DeepSeek 官网式选择模式：一轮问答作为一组，常规操作和输入区让位给底栏。 */
[data-conversation-scroll][data-dsh-share-selection] [data-composer-seat],
[data-conversation-scroll][data-dsh-share-selection] [data-chat-flow-kind="turn-tail"] {
  pointer-events: none !important;
  visibility: hidden !important;
}
[data-conversation-scroll][data-dsh-share-selection]
  [data-chat-flow-kind="user"] [data-time-hover-root] > :last-child:has(button),
[data-conversation-scroll][data-dsh-share-selection]
  [data-chat-flow-kind="steering"] [data-time-hover-root] > :last-child:has(button) {
  pointer-events: none !important;
  visibility: hidden !important;
}
[data-dsh-share-select-anchor],
[data-dsh-share-select-range-root] { position: relative !important; }
[data-conversation-scroll][data-dsh-share-selection] [data-dsh-share-select-content] {
  cursor: pointer !important;
}
[data-conversation-scroll][data-dsh-share-selection]
  [data-dsh-share-select-content] > :not([data-dsh-share-select-region]),
[data-conversation-scroll][data-dsh-share-selection]
  [data-dsh-share-select-content] > :not([data-dsh-share-select-region]) * {
  cursor: pointer !important;
  pointer-events: none !important;
}
[data-dsh-share-select-region="question"] {
  height: 44px;
  margin-bottom: -44px;
  pointer-events: none;
  position: sticky;
  top: 0;
  width: 0;
  z-index: 2;
}
[data-dsh-share-select-region="answer"] {
  left: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  z-index: 2;
}
[data-dsh-share-select-sticky] {
  height: 44px;
  pointer-events: none;
  position: sticky;
  top: 0;
  width: 0;
}
[data-dsh-share-turn-select] {
  align-items: center;
  appearance: none;
  background: transparent;
  border: 0;
  cursor: pointer;
  display: inline-flex;
  height: 44px;
  justify-content: center;
  left: -42px;
  margin: 0;
  padding: 0;
  pointer-events: auto;
  position: absolute;
  top: 0;
  width: 18px;
  z-index: 2;
}
[data-dsh-share-turn-select-box],
[data-dsh-share-select-all-box] {
  align-items: center;
  border: 1.5px solid var(--dsw-alias-border-l1, rgba(127, 127, 127, .48));
  border-radius: var(--dsw-radius-xs, 4px);
  box-sizing: border-box;
  display: inline-flex;
  height: 18px;
  justify-content: center;
  position: relative;
  width: 18px;
}
[data-dsh-share-turn-select][aria-checked="true"] [data-dsh-share-turn-select-box],
[data-dsh-share-select-all][aria-checked="true"] [data-dsh-share-select-all-box] {
  background: var(--dsw-alias-brand-primary, #4d6bfe);
  border-color: var(--dsw-alias-brand-primary, #4d6bfe);
}
[data-dsh-share-turn-select][aria-checked="true"] [data-dsh-share-turn-select-box]::after,
[data-dsh-share-select-all][aria-checked="true"] [data-dsh-share-select-all-box]::after {
  border-bottom: 1.8px solid #fff;
  border-right: 1.8px solid #fff;
  content: '';
  height: 8px;
  transform: rotate(45deg) translate(-1px, -1px);
  width: 4px;
}
[data-dsh-share-turn-select]:focus-visible [data-dsh-share-turn-select-box],
[data-dsh-share-select-all]:focus-visible [data-dsh-share-select-all-box] {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-focus-ring-color, var(--dsw-alias-brand-primary, #4d6bfe));
  outline-offset: 2px;
}
[data-dsh-share-selection-footer] {
  align-items: center;
  border-top: 1px solid var(--dsw-alias-border-l2, rgba(127, 127, 127, .18));
  bottom: 0;
  box-sizing: border-box;
  display: flex;
  flex: none;
  height: 66px;
  justify-content: center;
  margin-top: -66px;
  position: sticky;
  width: 100%;
  z-index: 9;
}
[data-dsh-share-selection-footer-inner] {
  align-items: center;
  display: flex;
  gap: 8px;
  max-width: 840px;
  width: min(840px, calc(100% - 64px));
}
[data-dsh-share-select-all] {
  align-items: center;
  appearance: none;
  background: transparent;
  border: 0;
  color: var(--dsw-alias-label-primary, currentColor);
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-size: 13px;
  gap: 10px;
  height: 36px;
  padding: 0 2px;
}
[data-dsh-share-selection-divider] {
  background: var(--dsw-alias-border-l2, rgba(127, 127, 127, .24));
  height: 18px;
  margin: 0 8px 0 6px;
  width: 1px;
}
[data-dsh-share-selection-count] {
  color: var(--dsw-alias-label-primary, currentColor);
  flex: 1 1 auto;
  font-size: 14px;
  line-height: 22px;
}
[data-dsh-share-selection-cancel],
[data-dsh-share-selection-download],
[data-dsh-share-format-trigger] {
  appearance: none;
  border-radius: var(--dsw-radius-md, 8px);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  height: 36px;
  line-height: 22px;
  padding: 6px 18px;
  white-space: nowrap;
}
[data-dsh-share-selection-cancel],
[data-dsh-share-selection-download],
[data-dsh-share-format-trigger] {
  background: transparent;
  border: 1px solid var(--dsw-alias-border-l1, rgba(127, 127, 127, .4));
  color: var(--dsw-alias-label-primary, currentColor);
}
[data-dsh-share-selection-cancel] {
  min-width: 72px;
}
[data-dsh-share-download-group] { display: inline-flex; align-items: center; margin-left: auto; }
[data-dsh-share-selection-hide-process] {
  align-items: center;
  color: var(--dsw-alias-label-secondary, currentColor);
  cursor: pointer;
  display: inline-flex;
  font-size: 13px;
  gap: 6px;
  user-select: none;
  white-space: nowrap;
}
[data-dsh-share-selection-hide-process] input {
  accent-color: var(--dsw-alias-brand-primary, #4d6bfe);
  cursor: pointer;
  height: 15px;
  margin: 0;
  width: 15px;
}
/* 组内左侧是格式菜单、右侧是下载：贴合的边去掉圆角并共用一条描边。 */
[data-dsh-share-format-trigger] {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-start-end-radius: 0;
  border-end-end-radius: 0;
}
[data-dsh-share-download-group] [data-dsh-share-selection-download] {
  border-start-start-radius: 0;
  border-end-start-radius: 0;
  margin-left: -1px;
}
[data-dsh-share-selection-cancel]:hover,
[data-dsh-share-format-trigger]:hover:not(:disabled),
[data-dsh-share-selection-download]:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover, rgba(127, 127, 127, .12)); }
[data-dsh-share-selection-download]:disabled,
[data-dsh-share-format-trigger]:disabled { cursor: not-allowed; opacity: .45; }
[data-dsh-share-html-status]:empty { display: none; }
[data-dsh-share-html-status]:not(:empty) {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  padding: 8px 16px;
  font-size: 13px;
  background: var(--dsw-alias-bg-base, var(--dsh-share-panel-base, #fff));
  color: var(--dsw-alias-label-secondary, #68707c);
}
[data-dsh-share-label="compact"] { display: none; }
@media (max-width: 720px) {
  [data-dsh-share-selection-footer] {
    height: 148px;
    margin-top: -148px;
    padding: 10px 0;
  }
  /* 窄屏改为两列网格：计数与过程开关占上行，取消与下载组占下行并按右对齐。 */
  [data-dsh-share-selection-footer-inner] {
    display: grid;
    gap: 8px;
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-rows: repeat(2, 36px) auto;
    width: calc(100% - 32px);
  }
  [data-dsh-share-select-all] {
    grid-column: 1;
    grid-row: 1;
    justify-self: start;
  }
  [data-dsh-share-selection-divider] { display: none; }
  [data-dsh-share-selection-count] {
    font-size: 13px;
    grid-column: 2;
    grid-row: 1;
    overflow: hidden;
    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  [data-dsh-share-selection-hide-process] {
    grid-column: 1 / 3;
    grid-row: 3;
    justify-self: start;
  }
  [data-dsh-share-selection-cancel],
  [data-dsh-share-selection-download],
  [data-dsh-share-format-trigger] {
    font-size: 13px;
    grid-row: 2;
    min-width: 0;
    padding-inline: 6px;
  }
  [data-dsh-share-selection-cancel] {
    grid-column: 1;
    justify-self: start;
  }
  /* 下载组贴右下角：靠第二列末端对齐。 */
  [data-dsh-share-download-group] {
    grid-column: 2;
    grid-row: 2;
    justify-self: end;
    margin-left: 0;
    min-width: 0;
  }
  [data-dsh-share-download-group] > span { min-width: 0; }
  [data-dsh-share-format-trigger] { font-size: 12px; }
  [data-dsh-share-label="wide"] { display: none; }
  [data-dsh-share-label="compact"] { display: inline; }
}
`
