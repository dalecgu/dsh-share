# dsh-share

简体中文 | [English](./README.en.md)

DSH 对话分享插件，把选中的对话导出为 Markdown 或独立 HTML 文件。

和 DeepSeek 网页端一致的多选交互，操作体验完全一致。

![dsh-share 多轮问答选择](./assets/readme/share-selection.webp)

## 功能

- 从右上角进入问答选择模式，默认全选
- 每轮的分享按钮也会进入选择模式，并只预选当前问答
- 问题和回答两侧都有联动勾选框，也可直接点击内容整组选择，支持不连续选择
- 勾选框会在长内容滚动时吸附在页面上，到当前问题或回答末尾再移出
- 在底部操作栏右侧选择格式（Markdown 或 HTML），再点击下载
- 下载文件使用 `dsh-对话标题` 命名，标题中的非法字符会被清理，过长标题截短，无标题时使用日期时间
- HTML 采用轻量会话布局、用户气泡及官方 Markdown 核心排版规则，保留可用的主题配色快照；文字、代码和表格可离线阅读，图片及表情尽量内嵌，无法内嵌的资源显示占位提示。不包含宿主脚本、交互控件或内部标识；SVG 等非栅格图片不内嵌
- 保留 Markdown、代码块、表格、图片和工具调用摘要
- 默认勾选“不展示过程”，只保留提问和最终回答；需要时可在操作栏取消勾选

性能：日常聊天仅保留分享按钮等轻量开销；选择处理与导出只在使用分享功能时启动。

## 快速安装

使用 DSH CLI 把插件加入 Web Profile，然后重启 `dsh web`：

```sh
dsh plugin --profile web add dsh-share
```

## 其他安装方式

安装指定的 GitHub 版本：

```sh
dsh plugin --profile web add github:hellodigua/dsh-share#vX.Y.Z
```

安装本地源码：

```sh
dsh plugin --profile web add /absolute/path/to/dsh-share
```

修改源码后，先运行 `corepack pnpm build`，再使用 `dsh plugin --profile web add --force /absolute/path/to/dsh-share` 刷新插件。

## 开发

项目不依赖本机 DSH checkout 即可安装依赖、运行测试和构建：

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

也可以用一条命令执行完整检查：

```sh
corepack pnpm verify
```

`lib/` 是 DSH 直接加载的交付物，需要和源码一起提交。修改 `src/` 后，请重新构建并确认 `lib/` 已同步更新。

发布前使用 `corepack pnpm release:check` 校验 npm 包边界，GitHub → npm 的自动化约定见 [RELEASING.md](https://github.com/hellodigua/dsh-share/blob/main/RELEASING.md)。

## 兼容性

开发基线为 `@deepseek-ai/dsh 0.2.0-rc.2`，运行时依赖范围为 `^0.1.7-rc.2 || ^0.2.0-rc.2`。分享入口使用官方 `conversation.chat.assistant-actions` 和 `conversation.session.header.utilities` 插槽，不扫描或修改按钮栏 DOM。多选模式通过 `data-chat-flow-kind` 等稳定的 `data-*` 属性添加选择框，不依赖 CSS Module 生成的类名；DSH 调整对话结构后可能需要同步适配。

## 已知限制

- 无法读取的远程资源会以透明占位跳过。
- 只能选择页面已经加载的完整问答；需要更早内容时，请先向上滚动加载。

## License

项目使用 [MIT](LICENSE) 许可证。浏览器 bundle 内联依赖的许可证见 [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md)。

## 友情链接

已加入 [dshfind.com](https://dshfind.com) DSH 插件超市。
