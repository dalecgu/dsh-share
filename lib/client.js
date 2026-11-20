window.__ModuleLoader__.load({
	id: "dsh-share",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		//#endregion
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react = require("react");
		let react_dom_client = require("react-dom/client");
		//#region src/client/i18n.ts
		function normalizeShareLocale(locale) {
			return locale.toLowerCase().startsWith("zh") ? "zh" : "en";
		}
		function getDocumentLocale(document) {
			return normalizeShareLocale(document.documentElement.lang);
		}
		function t(locale) {
			if (locale === "zh") return {
				share: "分享当前问答",
				shareTooltip: "分享",
				shareConversation: "分享对话",
				cancelSelection: "取消",
				selectAll: "全选",
				selectedCount: (count) => `已选择 ${count} 组对话`,
				selectTurn: "选择这组对话",
				unselectTurn: "取消选择这组对话",
				downloadFile: "下载",
				downloadFormat: "下载格式",
				htmlExporting: "正在生成 HTML…",
				htmlExportFailed: "HTML 生成失败，请重试。",
				htmlMissingImages: "部分图片无法内嵌，已在 HTML 中标记。",
				hideProcess: "不展示过程"
			};
			return {
				share: "Share this Q&A",
				shareTooltip: "Share",
				shareConversation: "Share conversation",
				cancelSelection: "Cancel",
				selectAll: "Select all",
				selectedCount: (count) => `${count} conversation ${count === 1 ? "group" : "groups"} selected`,
				selectTurn: "Select this conversation group",
				unselectTurn: "Unselect this conversation group",
				downloadFile: "Download",
				downloadFormat: "Download format",
				htmlExporting: "Generating HTML…",
				htmlExportFailed: "Could not generate HTML. Please try again.",
				htmlMissingImages: "Some images could not be embedded and are marked in the HTML.",
				hideProcess: "Hide process"
			};
		}
		//#endregion
		//#region src/client/content.ts
		/** 始终按会话顺序输出；一轮问答拆成连续的用户与回答消息供渲染器使用。 */
		function selectedTurnsToShareMessages(selected) {
			const ordered = [...selected].sort((left, right) => left.turn - right.turn);
			return ordered.flatMap((item, index) => {
				const previous = ordered[index - 1];
				const messages = turnToShareMessages(item.content, item.turn);
				messages[0].omittedBefore = previous === void 0 ? 0 : Math.max(0, item.turn - previous.turn - 1);
				return messages;
			});
		}
		/** 一轮问答转成连续的“用户消息 + 回答消息”渲染模型。 */
		function turnToShareMessages(content, turn) {
			return [{
				elements: content.prompts,
				omittedBefore: 0,
				order: turn * 2,
				role: "user",
				turn
			}, {
				elements: content.answers,
				omittedBefore: 0,
				order: turn * 2 + 1,
				role: "assistant",
				turn
			}];
		}
		//#endregion
		//#region src/client/export-theme.ts
		const htmlThemes = /* @__PURE__ */ new WeakMap();
		const HTML_TOKENS = /^(?:--dsw-alias-(?:bg-base|label-(?:primary|secondary|caption)|border-l[12]|link|markdown-(?:inline-code|code-block|code-block-banner))|--dsw-specific-bubble|--dsw-radius-(?:sm|lg|xl)|--dsw-font-(?:family|markdown-(?:base|h[123]|code-block))|--ds-font-family-code|--dsh-content-font-(?:size|delta))$/;
		/** 仅保存HTML实际消费的主题值，不复制宿主样式表或资源地址。 */
		function readHtmlTheme(source) {
			const saved = htmlThemes.get(source);
			if (saved) return saved;
			if (!source.isConnected) return [];
			const style = source.ownerDocument.defaultView?.getComputedStyle(source);
			if (!style) return [];
			return Array.from(style).filter((name) => HTML_TOKENS.test(name)).map((name) => [name, style.getPropertyValue(name).trim()]).filter(([, value]) => value && !/[{};<>\\]|url\s*\(|expression\s*\(/i.test(value));
		}
		/** HTML使用首个完整主题快照，脱离宿主后仍保持配色。 */
		function applyHtmlExportTheme(target, sources) {
			for (const source of sources) {
				const values = readHtmlTheme(source);
				if (!values.some(([name]) => name === "--dsw-alias-bg-base") || !values.some(([name]) => name === "--dsw-alias-label-primary")) continue;
				for (const [name, value] of values) target.style.setProperty(name, value);
				return;
			}
		}
		/**
		* 在节点仍连接到宿主时保存 HTML 主题快照。
		* 图片导出移除后仍需要它：HTML 产物脱离宿主后要还原配色。
		*/
		function saveExportTheme(source, snapshot) {
			htmlThemes.set(snapshot, readHtmlTheme(source));
		}
		//#endregion
		//#region src/client/dom.ts
		const TURN_TAIL_SELECTOR = "[data-turn-tail]";
		const TURN_FLOW_SELECTOR = "[data-chat-flow-kind=\"turn-tail\"]";
		/** 立即克隆消息节点，后续滚动卸载原 DOM 也不会影响导出。 */
		function snapshotElements(elements) {
			return elements.map((element) => {
				const snapshot = element.cloneNode(true);
				saveExportTheme(element, snapshot);
				return snapshot;
			});
		}
		/**
		* 在用户勾选一轮时立即保存消息节点，避免后续滚动加载或视图切换影响导出内容。
		* tail 保留原节点引用，只用于判断会话顺序；真正渲染的问答均使用脱离页面的副本。
		*/
		function snapshotTurnContent(content) {
			return {
				prompts: snapshotElements(content.prompts),
				answers: snapshotElements(content.answers),
				tail: content.tail
			};
		}
		/**
		* 这里集中保存当前 DSH 页面结构的假设，方便上游 DOM 调整后只改一个地方。
		* 从 turn-tail 回溯到本轮 user，并展开过程分组中的消息座位，保留原始顺序。
		*/
		function findTurnContent(tail) {
			const flowTail = tail.closest(TURN_FLOW_SELECTOR);
			if (!flowTail) return void 0;
			const prompts = [];
			const answers = [];
			let sibling = flowTail.previousElementSibling;
			let foundStart = false;
			while (sibling instanceof HTMLElement) {
				const kind = sibling.dataset.chatFlowKind;
				if (kind === "assistant-step" || kind === "tool-call") answers.unshift(sibling);
				else if (sibling.hasAttribute("data-step-process")) {
					const members = sibling.querySelectorAll("[data-step-process-content] > [data-chat-flow-kind]");
					answers.unshift(...[...members].filter((member) => member.dataset.chatFlowKind === "assistant-step" || member.dataset.chatFlowKind === "tool-call"));
				} else if (kind === "steering") prompts.unshift(sibling);
				else if (kind === "user") {
					prompts.unshift(sibling);
					foundStart = true;
					break;
				} else if (kind === "turn-tail") break;
				sibling = sibling.previousElementSibling;
			}
			if (!foundStart || prompts.length === 0 || answers.length === 0) return void 0;
			return {
				prompts,
				answers,
				tail
			};
		}
		/** 从官方 assistant-actions 插槽渲染的按钮定位并收集当前轮内容。 */
		function findTurnContentFromAction(action) {
			const tail = action.closest(TURN_TAIL_SELECTOR);
			return tail ? findTurnContent(tail) : void 0;
		}
		/** 收集当前会话页面中已经渲染并完成的轮次，按 DSH 原始 turn 排序。 */
		function findRenderedTurns(root) {
			return [...root.querySelectorAll(TURN_TAIL_SELECTOR)].map((tail) => {
				const turn = Number(tail.dataset.turnTail);
				if (!Number.isFinite(turn)) return void 0;
				const content = findTurnContent(tail);
				return content ? {
					content,
					turn
				} : void 0;
			}).filter((item) => item !== void 0).sort((left, right) => left.turn - right.turn);
		}
		//#endregion
		//#region node_modules/turndown/lib/turndown.cjs.js
		var require_turndown_cjs = /* @__PURE__ */ __commonJSMin(((exports, module) => {
			function extend(destination) {
				for (var i = 1; i < arguments.length; i++) {
					var source = arguments[i];
					for (var key in source) if (Object.prototype.hasOwnProperty.call(source, key)) destination[key] = source[key];
				}
				return destination;
			}
			function repeat(character, count) {
				return Array(count + 1).join(character);
			}
			function trimLeadingNewlines(string) {
				return string.replace(/^\n*/, "");
			}
			function trimTrailingNewlines(string) {
				var indexEnd = string.length;
				while (indexEnd > 0 && string[indexEnd - 1] === "\n") indexEnd--;
				return string.substring(0, indexEnd);
			}
			function trimNewlines(string) {
				return trimTrailingNewlines(trimLeadingNewlines(string));
			}
			var blockElements = [
				"ADDRESS",
				"ARTICLE",
				"ASIDE",
				"AUDIO",
				"BLOCKQUOTE",
				"BODY",
				"CANVAS",
				"CENTER",
				"DD",
				"DIR",
				"DIV",
				"DL",
				"DT",
				"FIELDSET",
				"FIGCAPTION",
				"FIGURE",
				"FOOTER",
				"FORM",
				"FRAMESET",
				"H1",
				"H2",
				"H3",
				"H4",
				"H5",
				"H6",
				"HEADER",
				"HGROUP",
				"HR",
				"HTML",
				"ISINDEX",
				"LI",
				"MAIN",
				"MENU",
				"NAV",
				"NOFRAMES",
				"NOSCRIPT",
				"OL",
				"OUTPUT",
				"P",
				"PRE",
				"SECTION",
				"TABLE",
				"TBODY",
				"TD",
				"TFOOT",
				"TH",
				"THEAD",
				"TR",
				"UL"
			];
			function isBlock(node) {
				return is(node, blockElements);
			}
			var voidElements = [
				"AREA",
				"BASE",
				"BR",
				"COL",
				"COMMAND",
				"EMBED",
				"HR",
				"IMG",
				"INPUT",
				"KEYGEN",
				"LINK",
				"META",
				"PARAM",
				"SOURCE",
				"TRACK",
				"WBR"
			];
			function isVoid(node) {
				return is(node, voidElements);
			}
			function hasVoid(node) {
				return has(node, voidElements);
			}
			var meaningfulWhenBlankElements = [
				"A",
				"TABLE",
				"THEAD",
				"TBODY",
				"TFOOT",
				"TH",
				"TD",
				"IFRAME",
				"SCRIPT",
				"AUDIO",
				"VIDEO"
			];
			function isMeaningfulWhenBlank(node) {
				return is(node, meaningfulWhenBlankElements);
			}
			function hasMeaningfulWhenBlank(node) {
				return has(node, meaningfulWhenBlankElements);
			}
			function is(node, tagNames) {
				return tagNames.indexOf(node.nodeName) >= 0;
			}
			function has(node, tagNames) {
				return node.getElementsByTagName && tagNames.some(function(tagName) {
					return node.getElementsByTagName(tagName).length;
				});
			}
			var markdownEscapes = [
				[/\\/g, "\\\\"],
				[/\*/g, "\\*"],
				[/^-/g, "\\-"],
				[/^\+ /g, "\\+ "],
				[/^(=+)/g, "\\$1"],
				[/^(#{1,6}) /g, "\\$1 "],
				[/`/g, "\\`"],
				[/^~~~/g, "\\~~~"],
				[/\[/g, "\\["],
				[/\]/g, "\\]"],
				[/^>/g, "\\>"],
				[/_/g, "\\_"],
				[/^(\d+)\. /g, "$1\\. "]
			];
			function escapeMarkdown(string) {
				return markdownEscapes.reduce(function(accumulator, escape) {
					return accumulator.replace(escape[0], escape[1]);
				}, string);
			}
			var rules = {};
			rules.paragraph = {
				filter: "p",
				replacement: function(content) {
					return "\n\n" + content + "\n\n";
				}
			};
			rules.lineBreak = {
				filter: "br",
				replacement: function(content, node, options) {
					return options.br + "\n";
				}
			};
			rules.heading = {
				filter: [
					"h1",
					"h2",
					"h3",
					"h4",
					"h5",
					"h6"
				],
				replacement: function(content, node, options) {
					var hLevel = Number(node.nodeName.charAt(1));
					if (options.headingStyle === "setext" && hLevel < 3) {
						var underline = repeat(hLevel === 1 ? "=" : "-", content.length);
						return "\n\n" + content + "\n" + underline + "\n\n";
					} else return "\n\n" + repeat("#", hLevel) + " " + content + "\n\n";
				}
			};
			rules.blockquote = {
				filter: "blockquote",
				replacement: function(content) {
					content = trimNewlines(content).replace(/^/gm, "> ");
					return "\n\n" + content + "\n\n";
				}
			};
			rules.list = {
				filter: ["ul", "ol"],
				replacement: function(content, node) {
					var parent = node.parentNode;
					if (parent.nodeName === "LI" && parent.lastElementChild === node) return "\n" + content;
					else return "\n\n" + content + "\n\n";
				}
			};
			rules.listItem = {
				filter: "li",
				replacement: function(content, node, options) {
					var prefix = options.bulletListMarker + "   ";
					var parent = node.parentNode;
					if (parent.nodeName === "OL") {
						var start = parent.getAttribute("start");
						var index = Array.prototype.indexOf.call(parent.children, node);
						prefix = (start ? Number(start) + index : index + 1) + ".  ";
					}
					var isParagraph = /\n$/.test(content);
					content = trimNewlines(content) + (isParagraph ? "\n" : "");
					content = content.replace(/\n/gm, "\n" + " ".repeat(prefix.length));
					return prefix + content + (node.nextSibling ? "\n" : "");
				}
			};
			rules.indentedCodeBlock = {
				filter: function(node, options) {
					return options.codeBlockStyle === "indented" && node.nodeName === "PRE" && node.firstChild && node.firstChild.nodeName === "CODE";
				},
				replacement: function(content, node, options) {
					return "\n\n    " + node.firstChild.textContent.replace(/\n/g, "\n    ") + "\n\n";
				}
			};
			rules.fencedCodeBlock = {
				filter: function(node, options) {
					return options.codeBlockStyle === "fenced" && node.nodeName === "PRE" && node.firstChild && node.firstChild.nodeName === "CODE";
				},
				replacement: function(content, node, options) {
					var language = ((node.firstChild.getAttribute("class") || "").match(/language-(\S+)/) || [null, ""])[1];
					var code = node.firstChild.textContent;
					var fenceChar = options.fence.charAt(0);
					var fenceSize = 3;
					var fenceInCodeRegex = new RegExp("^" + fenceChar + "{3,}", "gm");
					var match;
					while (match = fenceInCodeRegex.exec(code)) if (match[0].length >= fenceSize) fenceSize = match[0].length + 1;
					var fence = repeat(fenceChar, fenceSize);
					return "\n\n" + fence + language + "\n" + code.replace(/\n$/, "") + "\n" + fence + "\n\n";
				}
			};
			rules.horizontalRule = {
				filter: "hr",
				replacement: function(content, node, options) {
					return "\n\n" + options.hr + "\n\n";
				}
			};
			rules.inlineLink = {
				filter: function(node, options) {
					return options.linkStyle === "inlined" && node.nodeName === "A" && node.getAttribute("href");
				},
				replacement: function(content, node) {
					var href = escapeLinkDestination(node.getAttribute("href"));
					var title = escapeLinkTitle(cleanAttribute(node.getAttribute("title")));
					var titlePart = title ? " \"" + title + "\"" : "";
					return "[" + content + "](" + href + titlePart + ")";
				}
			};
			rules.referenceLink = {
				filter: function(node, options) {
					return options.linkStyle === "referenced" && node.nodeName === "A" && node.getAttribute("href");
				},
				replacement: function(content, node, options) {
					var href = escapeLinkDestination(node.getAttribute("href"));
					var title = cleanAttribute(node.getAttribute("title"));
					if (title) title = " \"" + escapeLinkTitle(title) + "\"";
					var replacement;
					var reference;
					switch (options.linkReferenceStyle) {
						case "collapsed":
							replacement = "[" + content + "][]";
							reference = "[" + content + "]: " + href + title;
							break;
						case "shortcut":
							replacement = "[" + content + "]";
							reference = "[" + content + "]: " + href + title;
							break;
						default:
							var id = this.references.length + 1;
							replacement = "[" + content + "][" + id + "]";
							reference = "[" + id + "]: " + href + title;
					}
					this.references.push(reference);
					return replacement;
				},
				references: [],
				append: function(options) {
					var references = "";
					if (this.references.length) {
						references = "\n\n" + this.references.join("\n") + "\n\n";
						this.references = [];
					}
					return references;
				}
			};
			rules.emphasis = {
				filter: ["em", "i"],
				replacement: function(content, node, options) {
					if (!content.trim()) return "";
					return options.emDelimiter + content + options.emDelimiter;
				}
			};
			rules.strong = {
				filter: ["strong", "b"],
				replacement: function(content, node, options) {
					if (!content.trim()) return "";
					return options.strongDelimiter + content + options.strongDelimiter;
				}
			};
			rules.code = {
				filter: function(node) {
					var hasSiblings = node.previousSibling || node.nextSibling;
					var isCodeBlock = node.parentNode.nodeName === "PRE" && !hasSiblings;
					return node.nodeName === "CODE" && !isCodeBlock;
				},
				replacement: function(content) {
					if (!content) return "";
					content = content.replace(/\r?\n|\r/g, " ");
					var extraSpace = /^`|^ .*?[^ ].* $|`$/.test(content) ? " " : "";
					var delimiter = "`";
					var matches = content.match(/`+/gm) || [];
					while (matches.indexOf(delimiter) !== -1) delimiter = delimiter + "`";
					return delimiter + extraSpace + content + extraSpace + delimiter;
				}
			};
			rules.image = {
				filter: "img",
				replacement: function(content, node) {
					var alt = escapeMarkdown(cleanAttribute(node.getAttribute("alt")));
					var src = escapeLinkDestination(node.getAttribute("src") || "");
					var title = cleanAttribute(node.getAttribute("title"));
					var titlePart = title ? " \"" + escapeLinkTitle(title) + "\"" : "";
					return src ? "![" + alt + "](" + src + titlePart + ")" : "";
				}
			};
			function cleanAttribute(attribute) {
				return attribute ? attribute.replace(/(\n+\s*)+/g, "\n") : "";
			}
			function escapeLinkDestination(destination) {
				var escaped = destination.replace(/([<>()])/g, "\\$1");
				return escaped.indexOf(" ") >= 0 ? "<" + escaped + ">" : escaped;
			}
			function escapeLinkTitle(title) {
				return title.replace(/"/g, "\\\"");
			}
			/**
			* Manages a collection of rules used to convert HTML to Markdown
			*/
			function Rules(options) {
				this.options = options;
				this._keep = [];
				this._remove = [];
				this.blankRule = { replacement: options.blankReplacement };
				this.keepReplacement = options.keepReplacement;
				this.defaultRule = { replacement: options.defaultReplacement };
				this.array = [];
				for (var key in options.rules) this.array.push(options.rules[key]);
			}
			Rules.prototype = {
				add: function(key, rule) {
					this.array.unshift(rule);
				},
				keep: function(filter) {
					this._keep.unshift({
						filter,
						replacement: this.keepReplacement
					});
				},
				remove: function(filter) {
					this._remove.unshift({
						filter,
						replacement: function() {
							return "";
						}
					});
				},
				forNode: function(node) {
					if (node.isBlank) return this.blankRule;
					var rule;
					if (rule = findRule(this.array, node, this.options)) return rule;
					if (rule = findRule(this._keep, node, this.options)) return rule;
					if (rule = findRule(this._remove, node, this.options)) return rule;
					return this.defaultRule;
				},
				forEach: function(fn) {
					for (var i = 0; i < this.array.length; i++) fn(this.array[i], i);
				}
			};
			function findRule(rules, node, options) {
				for (var i = 0; i < rules.length; i++) {
					var rule = rules[i];
					if (filterValue(rule, node, options)) return rule;
				}
			}
			function filterValue(rule, node, options) {
				var filter = rule.filter;
				if (typeof filter === "string") {
					if (filter === node.nodeName.toLowerCase()) return true;
				} else if (Array.isArray(filter)) {
					if (filter.indexOf(node.nodeName.toLowerCase()) > -1) return true;
				} else if (typeof filter === "function") {
					if (filter.call(rule, node, options)) return true;
				} else throw new TypeError("`filter` needs to be a string, array, or function");
			}
			/**
			* The collapseWhitespace function is adapted from collapse-whitespace
			* by Luc Thevenard.
			*
			* The MIT License (MIT)
			*
			* Copyright (c) 2014 Luc Thevenard <lucthevenard@gmail.com>
			*
			* Permission is hereby granted, free of charge, to any person obtaining a copy
			* of this software and associated documentation files (the "Software"), to deal
			* in the Software without restriction, including without limitation the rights
			* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
			* copies of the Software, and to permit persons to whom the Software is
			* furnished to do so, subject to the following conditions:
			*
			* The above copyright notice and this permission notice shall be included in
			* all copies or substantial portions of the Software.
			*
			* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
			* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
			* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
			* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
			* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
			* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
			* THE SOFTWARE.
			*/
			/**
			* collapseWhitespace(options) removes extraneous whitespace from an the given element.
			*
			* @param {Object} options
			*/
			function collapseWhitespace(options) {
				var element = options.element;
				var isBlock = options.isBlock;
				var isVoid = options.isVoid;
				var isPre = options.isPre || function(node) {
					return node.nodeName === "PRE";
				};
				if (!element.firstChild || isPre(element)) return;
				var prevText = null;
				var keepLeadingWs = false;
				var prev = null;
				var node = next(prev, element, isPre);
				while (node !== element) {
					if (node.nodeType === 3 || node.nodeType === 4) {
						var text = node.data.replace(/[ \r\n\t]+/g, " ");
						if ((!prevText || / $/.test(prevText.data)) && !keepLeadingWs && text[0] === " ") text = text.substr(1);
						if (!text) {
							node = remove(node);
							continue;
						}
						node.data = text;
						prevText = node;
					} else if (node.nodeType === 1) {
						if (isBlock(node) || node.nodeName === "BR") {
							if (prevText) prevText.data = prevText.data.replace(/ $/, "");
							prevText = null;
							keepLeadingWs = false;
						} else if (isVoid(node) || isPre(node)) {
							prevText = null;
							keepLeadingWs = true;
						} else if (prevText) keepLeadingWs = false;
					} else {
						node = remove(node);
						continue;
					}
					var nextNode = next(prev, node, isPre);
					prev = node;
					node = nextNode;
				}
				if (prevText) {
					prevText.data = prevText.data.replace(/ $/, "");
					if (!prevText.data) remove(prevText);
				}
			}
			/**
			* remove(node) removes the given node from the DOM and returns the
			* next node in the sequence.
			*
			* @param {Node} node
			* @return {Node} node
			*/
			function remove(node) {
				var next = node.nextSibling || node.parentNode;
				node.parentNode.removeChild(node);
				return next;
			}
			/**
			* next(prev, current, isPre) returns the next node in the sequence, given the
			* current and previous nodes.
			*
			* @param {Node} prev
			* @param {Node} current
			* @param {Function} isPre
			* @return {Node}
			*/
			function next(prev, current, isPre) {
				if (prev && prev.parentNode === current || isPre(current)) return current.nextSibling || current.parentNode;
				return current.firstChild || current.nextSibling || current.parentNode;
			}
			var root = typeof window !== "undefined" ? window : {};
			function canParseHTMLNatively() {
				var Parser = root.DOMParser;
				var canParse = false;
				try {
					if (new Parser().parseFromString("", "text/html")) canParse = true;
				} catch (e) {}
				return canParse;
			}
			function createHTMLParser() {
				var Parser = function() {};
				var domino = require("@mixmark-io/domino");
				Parser.prototype.parseFromString = function(string) {
					return domino.createDocument(string);
				};
				return Parser;
			}
			var HTMLParser = canParseHTMLNatively() ? root.DOMParser : createHTMLParser();
			function RootNode(input, options) {
				var root;
				if (typeof input === "string") root = htmlParser().parseFromString("<x-turndown id=\"turndown-root\">" + input + "</x-turndown>", "text/html").getElementById("turndown-root");
				else root = input.cloneNode(true);
				collapseWhitespace({
					element: root,
					isBlock,
					isVoid,
					isPre: options.preformattedCode ? isPreOrCode : null
				});
				return root;
			}
			var _htmlParser;
			function htmlParser() {
				_htmlParser = _htmlParser || new HTMLParser();
				return _htmlParser;
			}
			function isPreOrCode(node) {
				return node.nodeName === "PRE" || node.nodeName === "CODE";
			}
			function Node(node, options) {
				node.isBlock = isBlock(node);
				node.isCode = node.nodeName === "CODE" || node.parentNode.isCode;
				node.isBlank = isBlank(node);
				node.flankingWhitespace = flankingWhitespace(node, options);
				return node;
			}
			function isBlank(node) {
				return !isVoid(node) && !isMeaningfulWhenBlank(node) && /^\s*$/i.test(node.textContent) && !hasVoid(node) && !hasMeaningfulWhenBlank(node);
			}
			function flankingWhitespace(node, options) {
				if (node.isBlock || options.preformattedCode && node.isCode) return {
					leading: "",
					trailing: ""
				};
				var edges = edgeWhitespace(node.textContent);
				if (edges.leadingAscii && isFlankedByWhitespace("left", node, options)) edges.leading = edges.leadingNonAscii;
				if (edges.trailingAscii && isFlankedByWhitespace("right", node, options)) edges.trailing = edges.trailingNonAscii;
				return {
					leading: edges.leading,
					trailing: edges.trailing
				};
			}
			function edgeWhitespace(string) {
				var m = string.match(/^(([ \t\r\n]*)(\s*))(?:(?=\S)[\s\S]*\S)?((\s*?)([ \t\r\n]*))$/);
				return {
					leading: m[1],
					leadingAscii: m[2],
					leadingNonAscii: m[3],
					trailing: m[4],
					trailingNonAscii: m[5],
					trailingAscii: m[6]
				};
			}
			function isFlankedByWhitespace(side, node, options) {
				var sibling;
				var regExp;
				var isFlanked;
				if (side === "left") {
					sibling = node.previousSibling;
					regExp = / $/;
				} else {
					sibling = node.nextSibling;
					regExp = /^ /;
				}
				if (sibling) {
					if (sibling.nodeType === 3) isFlanked = regExp.test(sibling.nodeValue);
					else if (options.preformattedCode && sibling.nodeName === "CODE") isFlanked = false;
					else if (sibling.nodeType === 1 && !isBlock(sibling)) isFlanked = regExp.test(sibling.textContent);
				}
				return isFlanked;
			}
			var reduce = Array.prototype.reduce;
			function TurndownService(options) {
				if (!(this instanceof TurndownService)) return new TurndownService(options);
				var defaults = {
					rules,
					headingStyle: "setext",
					hr: "* * *",
					bulletListMarker: "*",
					codeBlockStyle: "indented",
					fence: "```",
					emDelimiter: "_",
					strongDelimiter: "**",
					linkStyle: "inlined",
					linkReferenceStyle: "full",
					br: "  ",
					preformattedCode: false,
					blankReplacement: function(content, node) {
						return node.isBlock ? "\n\n" : "";
					},
					keepReplacement: function(content, node) {
						return node.isBlock ? "\n\n" + node.outerHTML + "\n\n" : node.outerHTML;
					},
					defaultReplacement: function(content, node) {
						return node.isBlock ? "\n\n" + content + "\n\n" : content;
					}
				};
				this.options = extend({}, defaults, options);
				this.rules = new Rules(this.options);
			}
			TurndownService.prototype = {
				/**
				* The entry point for converting a string or DOM node to Markdown
				* @public
				* @param {String|HTMLElement} input The string or DOM node to convert
				* @returns A Markdown representation of the input
				* @type String
				*/
				turndown: function(input) {
					if (!canConvert(input)) throw new TypeError(input + " is not a string, or an element/document/fragment node.");
					if (input === "") return "";
					var output = process.call(this, new RootNode(input, this.options));
					return postProcess.call(this, output);
				},
				/**
				* Add one or more plugins
				* @public
				* @param {Function|Array} plugin The plugin or array of plugins to add
				* @returns The Turndown instance for chaining
				* @type Object
				*/
				use: function(plugin) {
					if (Array.isArray(plugin)) for (var i = 0; i < plugin.length; i++) this.use(plugin[i]);
					else if (typeof plugin === "function") plugin(this);
					else throw new TypeError("plugin must be a Function or an Array of Functions");
					return this;
				},
				/**
				* Adds a rule
				* @public
				* @param {String} key The unique key of the rule
				* @param {Object} rule The rule
				* @returns The Turndown instance for chaining
				* @type Object
				*/
				addRule: function(key, rule) {
					this.rules.add(key, rule);
					return this;
				},
				/**
				* Keep a node (as HTML) that matches the filter
				* @public
				* @param {String|Array|Function} filter The unique key of the rule
				* @returns The Turndown instance for chaining
				* @type Object
				*/
				keep: function(filter) {
					this.rules.keep(filter);
					return this;
				},
				/**
				* Remove a node that matches the filter
				* @public
				* @param {String|Array|Function} filter The unique key of the rule
				* @returns The Turndown instance for chaining
				* @type Object
				*/
				remove: function(filter) {
					this.rules.remove(filter);
					return this;
				},
				/**
				* Escapes Markdown syntax
				* @public
				* @param {String} string The string to escape
				* @returns A string with Markdown syntax escaped
				* @type String
				*/
				escape: function(string) {
					return escapeMarkdown(string);
				}
			};
			/**
			* Reduces a DOM node down to its Markdown string equivalent
			* @private
			* @param {HTMLElement} parentNode The node to convert
			* @returns A Markdown representation of the node
			* @type String
			*/
			function process(parentNode) {
				var self = this;
				return reduce.call(parentNode.childNodes, function(output, node) {
					node = new Node(node, self.options);
					var replacement = "";
					if (node.nodeType === 3) replacement = node.isCode ? node.nodeValue : self.escape(node.nodeValue);
					else if (node.nodeType === 1) replacement = replacementForNode.call(self, node);
					return join(output, replacement);
				}, "");
			}
			/**
			* Appends strings as each rule requires and trims the output
			* @private
			* @param {String} output The conversion output
			* @returns A trimmed version of the ouput
			* @type String
			*/
			function postProcess(output) {
				var self = this;
				this.rules.forEach(function(rule) {
					if (typeof rule.append === "function") output = join(output, rule.append(self.options));
				});
				return output.replace(/^[\t\r\n]+/, "").replace(/[\t\r\n\s]+$/, "");
			}
			/**
			* Converts an element node to its Markdown equivalent
			* @private
			* @param {HTMLElement} node The node to convert
			* @returns A Markdown representation of the node
			* @type String
			*/
			function replacementForNode(node) {
				var rule = this.rules.forNode(node);
				var content = process.call(this, node);
				var whitespace = node.flankingWhitespace;
				if (whitespace.leading || whitespace.trailing) content = content.trim();
				return whitespace.leading + rule.replacement(content, node, this.options) + whitespace.trailing;
			}
			/**
			* Joins replacement to the current output with appropriate number of new lines
			* @private
			* @param {String} output The current conversion output
			* @param {String} replacement The string to append to the output
			* @returns Joined output
			* @type String
			*/
			function join(output, replacement) {
				var s1 = trimTrailingNewlines(output);
				var s2 = trimLeadingNewlines(replacement);
				var nls = Math.max(output.length - s1.length, replacement.length - s2.length);
				return s1 + "\n\n".substring(0, nls) + s2;
			}
			/**
			* Determines whether an input can be converted
			* @private
			* @param {String|HTMLElement} input Describe this parameter
			* @returns Describe what it returns
			* @type String|Object|Array|Boolean|Number
			*/
			function canConvert(input) {
				return input != null && (typeof input === "string" || input.nodeType && (input.nodeType === 1 || input.nodeType === 9 || input.nodeType === 11));
			}
			module.exports = TurndownService;
		}));
		//#endregion
		//#region node_modules/turndown-plugin-gfm/lib/turndown-plugin-gfm.cjs.js
		var require_turndown_plugin_gfm_cjs = /* @__PURE__ */ __commonJSMin(((exports) => {
			Object.defineProperty(exports, "__esModule", { value: true });
			var highlightRegExp = /highlight-(?:text|source)-([a-z0-9]+)/;
			function highlightedCodeBlock(turndownService) {
				turndownService.addRule("highlightedCodeBlock", {
					filter: function(node) {
						var firstChild = node.firstChild;
						return node.nodeName === "DIV" && highlightRegExp.test(node.className) && firstChild && firstChild.nodeName === "PRE";
					},
					replacement: function(content, node, options) {
						var language = ((node.className || "").match(highlightRegExp) || [null, ""])[1];
						return "\n\n" + options.fence + language + "\n" + node.firstChild.textContent + "\n" + options.fence + "\n\n";
					}
				});
			}
			function strikethrough(turndownService) {
				turndownService.addRule("strikethrough", {
					filter: [
						"del",
						"s",
						"strike"
					],
					replacement: function(content) {
						return "~" + content + "~";
					}
				});
			}
			var indexOf = Array.prototype.indexOf;
			var every = Array.prototype.every;
			var rules = {};
			rules.tableCell = {
				filter: ["th", "td"],
				replacement: function(content, node) {
					return cell(content, node);
				}
			};
			rules.tableRow = {
				filter: "tr",
				replacement: function(content, node) {
					var borderCells = "";
					var alignMap = {
						left: ":--",
						right: "--:",
						center: ":-:"
					};
					if (isHeadingRow(node)) for (var i = 0; i < node.childNodes.length; i++) {
						var border = "---";
						var align = (node.childNodes[i].getAttribute("align") || "").toLowerCase();
						if (align) border = alignMap[align] || border;
						borderCells += cell(border, node.childNodes[i]);
					}
					return "\n" + content + (borderCells ? "\n" + borderCells : "");
				}
			};
			rules.table = {
				filter: function(node) {
					return node.nodeName === "TABLE" && isHeadingRow(node.rows[0]);
				},
				replacement: function(content) {
					content = content.replace("\n\n", "\n");
					return "\n\n" + content + "\n\n";
				}
			};
			rules.tableSection = {
				filter: [
					"thead",
					"tbody",
					"tfoot"
				],
				replacement: function(content) {
					return content;
				}
			};
			function isHeadingRow(tr) {
				var parentNode = tr.parentNode;
				return parentNode.nodeName === "THEAD" || parentNode.firstChild === tr && (parentNode.nodeName === "TABLE" || isFirstTbody(parentNode)) && every.call(tr.childNodes, function(n) {
					return n.nodeName === "TH";
				});
			}
			function isFirstTbody(element) {
				var previousSibling = element.previousSibling;
				return element.nodeName === "TBODY" && (!previousSibling || previousSibling.nodeName === "THEAD" && /^\s*$/i.test(previousSibling.textContent));
			}
			function cell(content, node) {
				var index = indexOf.call(node.parentNode.childNodes, node);
				var prefix = " ";
				if (index === 0) prefix = "| ";
				return prefix + content + " |";
			}
			function tables(turndownService) {
				turndownService.keep(function(node) {
					return node.nodeName === "TABLE" && !isHeadingRow(node.rows[0]);
				});
				for (var key in rules) turndownService.addRule(key, rules[key]);
			}
			function taskListItems(turndownService) {
				turndownService.addRule("taskListItems", {
					filter: function(node) {
						return node.type === "checkbox" && node.parentNode.nodeName === "LI";
					},
					replacement: function(content, node) {
						return (node.checked ? "[x]" : "[ ]") + " ";
					}
				});
			}
			function gfm(turndownService) {
				turndownService.use([
					highlightedCodeBlock,
					strikethrough,
					tables,
					taskListItems
				]);
			}
			exports.gfm = gfm;
		}));
		//#endregion
		//#region src/client/message.ts
		var import_turndown_cjs = /* @__PURE__ */ __toESM(require_turndown_cjs(), 1);
		var import_turndown_plugin_gfm_cjs = require_turndown_plugin_gfm_cjs();
		/** 把宿主渲染出的消息节点整理成可脱离页面的导出副本。 */
		function applyStyles(element, styles) {
			Object.assign(element.style, styles);
		}
		function normalizeText(text) {
			return text?.replace(/\s+/g, " ").trim() ?? "";
		}
		/** 把摘要行里的交互控件转为静态元素，同时保留当前运行时的 class 和图标。 */
		function makeToolSummaryStatic(row) {
			for (const button of row.querySelectorAll("button")) {
				const replacement = row.ownerDocument.createElement("span");
				for (const attribute of button.attributes) if (attribute.name === "class" || attribute.name === "style" || attribute.name.startsWith("data-")) replacement.setAttribute(attribute.name, attribute.value);
				replacement.append(...button.childNodes);
				button.replaceWith(replacement);
			}
			for (const control of row.querySelectorAll("input, textarea, select, [role=\"tooltip\"]")) control.remove();
			for (const element of [row, ...row.querySelectorAll("*")]) {
				element.removeAttribute("aria-expanded");
				element.removeAttribute("data-expandable");
				element.removeAttribute("role");
				element.removeAttribute("tabindex");
			}
		}
		/**
		* 工具卡片内部可能包含展开面板和终端输出；这里只克隆原生折叠摘要行。
		* 摘要的运行时 class、图标和内容结构会被保留，不依赖写死的 CSS Module 类名。
		*/
		function cloneToolCallSummary(source, locale) {
			const clone = source.ownerDocument.createElement("div");
			clone.dataset.dshShareMessage = "";
			clone.dataset.dshShareToolCall = "";
			const summaryRows = source.querySelectorAll("[data-disclosure-row], [data-sample=\"bash\"]");
			for (const summary of summaryRows) {
				if (!normalizeText(summary.textContent)) continue;
				const row = summary.cloneNode(true);
				row.dataset.dshShareToolSummary = "";
				makeToolSummaryStatic(row);
				clone.append(row);
			}
			if (clone.childElementCount === 0) {
				const fallback = source.ownerDocument.createElement("div");
				fallback.dataset.dshShareToolSummary = "";
				fallback.textContent = locale === "zh" ? "工具调用" : "Tool call";
				clone.append(fallback);
			}
			applyStyles(clone, {
				boxSizing: "border-box",
				margin: "0",
				maxWidth: "none",
				width: "100%"
			});
			return clone;
		}
		function cloneShareMessage(source, locale, hideReasoning = false) {
			if (source.dataset.chatFlowKind === "tool-call") return cloneToolCallSummary(source, locale);
			const clone = source.cloneNode(true);
			clone.dataset.dshShareMessage = "";
			if (source.dataset.turnProcessMember === "true" && clone.getAttribute("hidden") === "until-found") clone.removeAttribute("hidden");
			clone.removeAttribute("data-turn-process-member");
			clone.removeAttribute("data-turn-process-hidden");
			clone.removeAttribute("data-turn-process-answer");
			if (hideReasoning) {
				for (const reasoning of clone.querySelectorAll("[data-turn-process-inline]")) reasoning.remove();
				for (const reasoning of clone.querySelectorAll("[data-variant=\"think\"]")) reasoning.remove();
			} else for (const reasoning of clone.querySelectorAll("[data-turn-process-inline]")) {
				if (reasoning.getAttribute("hidden") === "until-found") reasoning.removeAttribute("hidden");
				reasoning.removeAttribute("data-turn-process-inline");
			}
			for (const hoverRoot of clone.querySelectorAll("[data-time-hover-root]")) {
				const last = hoverRoot.lastElementChild;
				if (last?.querySelector("button")) last.remove();
			}
			for (const element of clone.querySelectorAll("button, input, textarea, select, [data-dsh-share-button], [role=\"tooltip\"]")) element.remove();
			clone.removeAttribute("data-chat-anchor-key");
			clone.removeAttribute("data-chat-flow-key");
			clone.removeAttribute("data-chat-flow-kind");
			applyStyles(clone, {
				boxSizing: "border-box",
				margin: "0",
				maxWidth: "none",
				width: "100%"
			});
			return clone;
		}
		/** 与 HTML 和 Markdown 导出共用的回答过程过滤规则。 */
		function visibleAssistantElements(elements, hideProcess) {
			if (!hideProcess) return [...elements];
			const assistantSteps = elements.filter((element) => element.dataset.chatFlowKind === "assistant-step" && element.dataset.chatGroupPart !== "reasoning");
			const explicitAnswers = assistantSteps.filter((element) => element.dataset.turnProcessAnswer === "true");
			if (explicitAnswers.length > 0) return explicitAnswers;
			if (elements.some((element) => element.dataset.turnProcessMember === "true")) {
				const answers = assistantSteps.filter((element) => element.dataset.turnProcessMember !== "true");
				if (answers.length > 0) return answers;
			}
			return assistantSteps.slice(-1);
		}
		//#endregion
		//#region src/client/markdown.ts
		function createConverter() {
			const converter = new import_turndown_cjs.default({
				bulletListMarker: "-",
				codeBlockStyle: "fenced",
				emDelimiter: "*",
				headingStyle: "atx",
				strongDelimiter: "**"
			});
			converter.use(import_turndown_plugin_gfm_cjs.gfm);
			converter.addRule("dsh-tool-summary", {
				filter: (node) => node.hasAttribute("data-dsh-share-tool-summary"),
				replacement: (_content, node) => {
					const parts = [...node.children].map((child) => child.textContent?.replace(/\s+/g, " ").trim() ?? "").filter(Boolean);
					const body = (parts.length > 0 ? parts.join(" · ") : node.textContent?.replace(/\s+/g, " ").trim() ?? "").replace(/^/gm, "> ");
					return body ? `\n\n${body}\n\n` : "";
				}
			});
			converter.addRule("dsh-reasoning", {
				filter: (node) => node.getAttribute("data-variant") === "think",
				replacement: (content) => {
					const body = content.trim().replace(/^/gm, "> ");
					return body ? `\n\n${body}\n\n` : "";
				}
			});
			return converter;
		}
		function convertMessages(converter, messages, locale, hideReasoning = false) {
			return messages.map((message) => converter.turndown(cloneShareMessage(message, locale, hideReasoning)).trim()).filter(Boolean).join("\n\n");
		}
		/** 将与 PNG 相同的可见内容导出为按原会话顺序排列的 GFM Markdown。 */
		function createShareMarkdown(messages, locale, settings) {
			const converter = createConverter();
			const parts = [locale === "zh" ? "# 对话分享" : "# Shared conversation"];
			for (const message of messages) {
				if (message.omittedBefore > 0) parts.push(locale === "zh" ? `> 中间省略 ${message.omittedBefore} 组对话` : `> ${message.omittedBefore} conversation ${message.omittedBefore === 1 ? "group was" : "groups were"} omitted`);
				const content = convertMessages(converter, message.role === "assistant" ? visibleAssistantElements(message.elements, settings.hideProcess) : message.elements, locale, message.role === "assistant" && settings.hideProcess);
				parts.push(`${message.role === "user" ? locale === "zh" ? "## 用户" : "## User" : "## DeepSeek"}\n\n${content}`);
				parts.push("---");
			}
			if (parts.at(-1) === "---") parts.pop();
			return `${parts.join("\n\n")}\n`;
		}
		//#endregion
		//#region src/client/html-style.ts
		/** 独立文档只保留会话布局及官方Markdown的核心排版规则。 */
		const HTML_STYLE = `
:root{color-scheme:light;--dsw-alias-bg-base:#fff;--dsw-alias-label-primary:#1f2329;--dsw-alias-label-secondary:#666;--dsw-alias-label-caption:#aaa;--dsw-alias-border-l1:#ddd;--dsw-alias-border-l2:#eee;--dsw-alias-link:#4d6bfe;--dsw-specific-bubble:#f3f4f6;--dsw-alias-markdown-inline-code:#f5f5f5;--dsw-alias-markdown-code-block:#f8f8fa;--dsw-alias-markdown-code-block-banner:#f1f1f4;--dsw-radius-sm:4px;--dsw-radius-lg:12px;--dsw-radius-xl:20px;--dsw-font-family:system-ui,sans-serif;--ds-font-family-code:ui-monospace,monospace}
*{box-sizing:border-box}body{margin:0;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:var(--dsw-font-markdown-base,16px/1.6 var(--dsw-font-family))}
main{max-width:800px;margin:0 auto;padding:32px 24px}section{margin:0 0 32px;min-width:0;overflow-wrap:anywhere}.user{display:flex;justify-content:flex-end}.user>.content{width:fit-content;max-width:100%;padding:10px 16px;border-radius:var(--dsw-radius-xl);background:var(--dsw-specific-bubble);font-size:var(--dsh-content-font-size,14px);line-height:calc(22px + var(--dsh-content-font-delta,0px));white-space:pre-wrap}.assistant>.content{min-width:0}.content>div+div{margin-top:16px}
.content :where(h1,h2,h3){margin:32px 0 16px}.content h1{font:var(--dsw-font-markdown-h1,600 28px/1.4 var(--dsw-font-family))}.content h2{font:var(--dsw-font-markdown-h2,600 24px/1.4 var(--dsw-font-family))}.content h3{font:var(--dsw-font-markdown-h3,600 20px/1.4 var(--dsw-font-family))}.content :where(h4,h5,h6){margin:16px 0;font-weight:600}.content strong{font-weight:600}.content p{margin:16px 0}.content p:first-child{margin-top:0}.content p:last-child{margin-bottom:0}.content :where(ul,ol){margin:16px 0;padding-left:18px}.content li+li{margin-top:6px}.content li>p{margin:8px 0}.content li::marker{color:var(--dsw-alias-label-secondary)}.content blockquote{border-left:2px solid var(--dsw-alias-label-caption);margin:16px 0 0;padding-left:14px}.content hr{border:0;height:1px;margin:32px 0;background:var(--dsw-alias-border-l2)}
a{color:var(--dsw-alias-link);font-weight:500;text-decoration:none}a:hover{text-decoration:underline}pre{margin:16px 0;padding:14px 16px;background:var(--dsw-alias-markdown-code-block);border-radius:var(--dsw-radius-lg);overflow:auto;white-space:pre;font:var(--dsw-font-markdown-code-block,14px/1.6 var(--ds-font-family-code))}code{font-family:var(--ds-font-family-code)}:not(pre)>code{font-size:.875em;background:var(--dsw-alias-markdown-inline-code);border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-sm);padding:0 5px}.code-banner{background:var(--dsw-alias-markdown-code-block-banner);padding:9px 14px;font-size:11px;border-radius:var(--dsw-radius-lg) var(--dsw-radius-lg) 0 0}.code-block{margin:16px 0;background:var(--dsw-alias-markdown-code-block);border-radius:var(--dsw-radius-lg);overflow:hidden}.code-block pre{margin:0;border-radius:0}
.table-scroll{max-width:100%;overflow:auto}table{border-collapse:collapse;width:100%;margin:16px 0}th,td{text-align:start;padding:10px 12px;border-bottom:.5px solid var(--dsw-alias-border-l2);white-space:pre-wrap;min-width:100px}th{font-weight:600}th:first-child,td:first-child{padding-left:0}th:last-child,td:last-child{padding-right:0}img{max-width:100%;height:auto}img.emoji{height:1.5em;width:auto;vertical-align:middle}.notice,.reasoning{color:var(--dsw-alias-label-secondary);font-size:.9em}.notice{margin:24px 0;text-align:center}.reasoning{border-left:2px solid var(--dsw-alias-border-l2);padding-left:14px}
@media(max-width:600px){main{padding:24px 16px}}@media print{main{max-width:none}pre{white-space:pre-wrap;overflow-wrap:anywhere}}
`;
		//#endregion
		//#region src/client/html.ts
		const TAGS = new Set("div p span br hr h1 h2 h3 h4 h5 h6 strong b em i u s del blockquote pre code ul ol li table thead tbody tfoot tr th td caption a sub sup details summary".split(" "));
		const DROP = new Set("script style link meta base iframe object embed form input button textarea select template svg canvas audio video source".split(" "));
		const IMAGE_TYPE = /^image\/(png|jpeg|gif|webp|avif)$/i;
		const MAX_IMAGE_BYTES = 8388608;
		const MAX_TOTAL_BYTES = 33554432;
		/** 只保留普通外部链接，排除宿主地址和携带认证参数的链接。 */
		function publicLink(value) {
			try {
				const url = new URL(value);
				if (!/^https?:$/.test(url.protocol) || url.username || url.password) return;
				if (/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[|0\.)/i.test(url.hostname) || !url.hostname.includes(".") || /\.(local|internal)$/i.test(url.hostname)) return;
				if ([...url.searchParams.keys()].some((key) => /token|secret|auth|key|signature|credential/i.test(key))) return;
				return url.href;
			} catch {
				return;
			}
		}
		/** 生成无脚本的独立阅读文档；只复制允许的标签和属性。 */
		async function createShareHtml(document, messages, locale, settings) {
			const output = document.implementation.createHTMLDocument(locale === "zh" ? "对话分享" : "Shared conversation");
			output.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
			const charset = output.createElement("meta");
			charset.setAttribute("charset", "utf-8");
			const csp = output.createElement("meta");
			csp.httpEquiv = "Content-Security-Policy";
			csp.content = "default-src 'none'; img-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'";
			const viewport = output.createElement("meta");
			viewport.name = "viewport";
			viewport.content = "width=device-width, initial-scale=1";
			const style = output.createElement("style");
			style.textContent = HTML_STYLE;
			output.head.prepend(charset, csp, viewport, style);
			const main = output.createElement("main");
			main.ariaLabel = output.title;
			applyHtmlExportTheme(output.body, messages.flatMap((message) => message.elements));
			output.body.append(main);
			const snapshots = messages.map((message) => ({
				role: message.role,
				omittedBefore: message.omittedBefore,
				elements: (message.role === "assistant" ? visibleAssistantElements(message.elements, settings.hideProcess) : message.elements).map((element) => cloneShareMessage(element, locale, message.role === "assistant" && settings.hideProcess))
			}));
			let missingImages = 0;
			let totalBytes = 0;
			let imageCount = 0;
			const deadline = Date.now() + 3e4;
			const cache = /* @__PURE__ */ new Map();
			/** 限时限量读取栅格图片，不携带跨站认证信息或保留资源地址。 */
			async function embedImage(source) {
				const image = output.createElement("img");
				image.alt = source.getAttribute("alt") ?? "";
				try {
					const raw = source.getAttribute("src") ?? "";
					const url = new URL(raw, document.baseURI);
					if (!raw || ![
						"http:",
						"https:",
						"blob:",
						"data:",
						"dsh-app:"
					].includes(url.protocol)) throw new Error("Unsupported image");
					if (url.username || url.password || ++imageCount > 100) throw new Error("Image budget exceeded");
					let cached = cache.get(url.href);
					if (!cached) {
						const remaining = deadline - Date.now();
						if (remaining <= 0) throw new Error("Image deadline exceeded");
						const response = await fetch(url.href, {
							credentials: "omit",
							referrerPolicy: "no-referrer",
							redirect: "error",
							signal: AbortSignal.timeout(Math.min(1e4, remaining))
						});
						const type = response.headers.get("content-type")?.split(";")[0] ?? "";
						if (!response.ok || !IMAGE_TYPE.test(type) || !response.body) throw new Error("Unsupported image");
						const reader = response.body.getReader();
						const chunks = [];
						let size = 0;
						try {
							while (true) {
								const { done, value } = await reader.read();
								if (done) break;
								size += value.byteLength;
								if (size > MAX_IMAGE_BYTES || totalBytes + size > MAX_TOTAL_BYTES) throw new Error("Image budget exceeded");
								chunks.push(new Uint8Array(value));
							}
						} finally {
							await reader.cancel();
						}
						const blob = new Blob(chunks, { type });
						cached = {
							data: await new Promise((resolve, reject) => {
								const reader = new FileReader();
								reader.onload = () => resolve(String(reader.result));
								reader.onerror = () => reject(/* @__PURE__ */ new Error("Image encoding failed"));
								reader.readAsDataURL(blob);
							}),
							size
						};
						cache.set(url.href, cached);
					}
					if (totalBytes + cached.size > MAX_TOTAL_BYTES) throw new Error("Image budget exceeded");
					totalBytes += cached.size;
					image.src = cached.data;
					const height = Number.parseFloat(source.getAttribute("height") ?? source.style?.height ?? "");
					if (height > 0 && height <= 64 || source.getAttribute("src")?.includes("/api/dsh-emoji/assets/")) image.className = "emoji";
					return image;
				} catch {
					missingImages++;
					const placeholder = output.createElement("span");
					placeholder.className = "notice";
					placeholder.textContent = locale === "zh" ? "[图片未能内嵌]" : "[Image could not be embedded]";
					return placeholder;
				}
			}
			/** 从不复制宿主属性、内联样式或可执行节点。 */
			async function sanitize(node) {
				if (node.nodeType === 3) return output.createTextNode(node.textContent ?? "");
				if (node.nodeType !== 1) return output.createDocumentFragment();
				const source = node;
				const tag = source.localName.toLowerCase();
				if (DROP.has(tag)) return output.createDocumentFragment();
				if (tag === "img") return embedImage(source);
				const result = TAGS.has(tag) ? output.createElement(tag) : output.createDocumentFragment();
				if (result.nodeType === 1) {
					const element = result;
					if (source.hasAttribute("data-code-block-banner")) element.className = "code-banner";
					else if (source.classList.contains("md-code-block")) element.className = "code-block";
					else if (source.getAttribute("data-variant") === "think") element.className = "reasoning";
					if (tag === "span" && source.closest("pre")) {
						const color = source.style.color;
						if (/^(?:#[\da-f]{3,8}|rgba?\([\d\s.,%]+\)|[a-z]+)$/i.test(color)) element.style.color = color;
					}
				}
				if (tag === "a" && result.nodeType === 1) {
					const href = publicLink(source.getAttribute("href") ?? "");
					if (href) result.setAttribute("href", href);
				}
				if (["td", "th"].includes(tag)) for (const attribute of ["colspan", "rowspan"]) {
					const value = source.getAttribute(attribute);
					if (value && /^\d{1,3}$/.test(value)) result.setAttribute(attribute, value);
				}
				for (const child of source.childNodes) result.appendChild(await sanitize(child));
				if (tag === "table") {
					const wrapper = output.createElement("div");
					wrapper.className = "table-scroll";
					wrapper.append(result);
					return wrapper;
				}
				return result;
			}
			for (const message of snapshots) {
				if (message.omittedBefore > 0) {
					const omission = output.createElement("p");
					omission.className = "notice";
					omission.textContent = locale === "zh" ? `中间省略 ${message.omittedBefore} 组对话` : `${message.omittedBefore} conversation groups omitted`;
					main.append(omission);
				}
				const section = output.createElement("section");
				section.className = message.role;
				section.ariaLabel = message.role === "user" ? locale === "zh" ? "用户" : "User" : "DeepSeek";
				const content = output.createElement("div");
				content.className = "content";
				for (const element of message.elements) content.append(await sanitize(element));
				section.append(content);
				main.append(section);
			}
			return {
				html: `<!doctype html>\n${output.documentElement.outerHTML}`,
				missingImages
			};
		}
		//#endregion
		//#region src/client/download-format.ts
		/** 复用宿主菜单的定位、选中标记和键盘操作。 */
		function FormatMenu({ locale, disabled, onChange }) {
			const [format, setFormat] = (0, react.useState)("markdown");
			const [open, setOpen] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				if (disabled) setOpen(false);
			}, [disabled]);
			return (0, react.createElement)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
				open: open && !disabled,
				side: "top",
				align: "end",
				portal: true,
				selectedId: format,
				items: [{
					id: "markdown",
					label: "Markdown"
				}, {
					id: "html",
					label: "HTML"
				}],
				onClose: () => setOpen(false),
				onSelect: (id) => {
					if (disabled || id !== "markdown" && id !== "html") return;
					setFormat(id);
					setOpen(false);
					onChange(id);
				},
				anchor: (0, react.createElement)("button", {
					type: "button",
					disabled,
					"data-dsh-share-format-trigger": "",
					"aria-label": `${t(locale).downloadFormat}: ${format === "html" ? "HTML" : "Markdown"}`,
					"aria-haspopup": "menu",
					"aria-expanded": open && !disabled,
					onClick: () => setOpen((value) => !value)
				}, format === "html" ? "HTML" : "Markdown", (0, react.createElement)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { size: 14 }))
			});
		}
		/** 在独立节点挂载宿主React菜单，仅在输入变化时更新，避免观察器回环。 */
		function mountDownloadFormat(element, onChange) {
			const root = (0, react_dom_client.createRoot)(element);
			let previous = "";
			return {
				update(locale, disabled) {
					const key = `${locale}:${disabled}`;
					if (key === previous) return;
					previous = key;
					root.render((0, react.createElement)(FormatMenu, {
						locale,
						disabled,
						onChange
					}));
				},
				dispose() {
					root.unmount();
				}
			};
		}
		//#endregion
		//#region src/client/filename.ts
		/** 清理跨平台文件名，并为缺少标题的会话生成时间兜底。 */
		function createDownloadFilename(extension, title, page, now = /* @__PURE__ */ new Date()) {
			const clean = (title ?? "").normalize("NFC").replace(/[<>:"/\\|?*\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, " ").replace(/\s+/g, " ").trim().replace(/^[. ]+|[. ]+$/g, "");
			let safe = "";
			let bytes = 0;
			for (const character of clean) {
				const size = new TextEncoder().encode(character).length;
				if (bytes + size > 180) break;
				safe += character;
				bytes += size;
			}
			safe = safe.replace(/[. ]+$/g, "");
			const pad = (value) => String(value).padStart(2, "0");
			const fallback = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
			return `dsh-${safe || fallback}${page === void 0 ? "" : `-${pad(page)}`}.${extension}`;
		}
		//#endregion
		//#region src/client/download.ts
		function downloadMarkdownFile(document, markdown, title) {
			if (!markdown) return;
			const objectUrl = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
			const anchor = document.createElement("a");
			anchor.href = objectUrl;
			anchor.download = createDownloadFilename("md", title);
			anchor.click();
			document.defaultView?.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
		}
		/** 下载独立HTML文档，给宿主留出读取Blob的时间。 */
		function downloadHtmlFile(document, html, title) {
			const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = createDownloadFilename("html", title);
			anchor.click();
			document.defaultView?.setTimeout(() => URL.revokeObjectURL(url), 6e4);
		}
		//#endregion
		//#region src/client/settings.ts
		/** 过程默认折叠：导出默认只含提问和最终回答。 */
		const DEFAULT_SHARE_SETTINGS = { hideProcess: true };
		const HIDE_PROCESS_STORAGE_KEY = "dsh-share.hide-process";
		/** 读取失败时回到默认值，避免隐私模式下 localStorage 异常阻断导出功能。 */
		function loadShareSettings(storage) {
			if (!storage) return { ...DEFAULT_SHARE_SETTINGS };
			try {
				const hideProcess = storage.getItem(HIDE_PROCESS_STORAGE_KEY);
				return { hideProcess: hideProcess === null ? DEFAULT_SHARE_SETTINGS.hideProcess : hideProcess === "true" };
			} catch {
				return { ...DEFAULT_SHARE_SETTINGS };
			}
		}
		function saveShareSettings(storage, settings) {
			if (!storage) return;
			try {
				storage.setItem(HIDE_PROCESS_STORAGE_KEY, String(settings.hideProcess));
			} catch {}
		}
		//#endregion
		//#region src/client/styles.ts
		const STYLE_ID = "dsh-share-style";
		const STYLE_TEXT = `
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
`;
		//#endregion
		//#region src/client/runtime.ts
		function selectableTurns(root) {
			const turns = [];
			for (const { content, turn } of findRenderedTurns(root)) {
				const questionAnchor = content.prompts[0];
				if (!questionAnchor || content.answers.length === 0) continue;
				turns.push({
					answerAnchors: [...new Set(content.answers.map((answer) => answer.closest("[data-step-process]") ?? answer))],
					content,
					id: String(turn),
					questionAnchor,
					turn
				});
			}
			return turns.sort((left, right) => left.turn - right.turn);
		}
		const SELECTION_OWNED_SELECTOR = ["[data-dsh-share-selection-footer]", "[data-dsh-share-select-region]"].join(",");
		function isSelectionOwnedNode(node) {
			const element = node instanceof Element ? node : node.parentElement;
			return Boolean(element?.matches(SELECTION_OWNED_SELECTOR) || element?.closest(SELECTION_OWNED_SELECTOR));
		}
		/** 插件自己的 footer、勾选框和文案更新不应再次触发整轮扫描。 */
		function mutationNeedsSelectionRefresh(record) {
			if (isSelectionOwnedNode(record.target)) return false;
			const changedNodes = [...record.addedNodes, ...record.removedNodes];
			return changedNodes.length === 0 || changedNodes.some((node) => !isSelectionOwnedNode(node));
		}
		function makeButton(document, dataName) {
			const button = document.createElement("button");
			button.type = "button";
			button.dataset[dataName] = "";
			return button;
		}
		function appendResponsiveLabel(document, button, wide, compact) {
			const wideLabel = document.createElement("span");
			wideLabel.dataset.dshShareLabel = "wide";
			wideLabel.textContent = wide;
			const compactLabel = document.createElement("span");
			compactLabel.dataset.dshShareLabel = "compact";
			compactLabel.textContent = compact;
			button.ariaLabel = wide;
			button.append(wideLabel, compactLabel);
		}
		function updateResponsiveLabel(button, wide, compact) {
			if (button.ariaLabel !== wide) button.ariaLabel = wide;
			const wideLabel = button.querySelector("[data-dsh-share-label=\"wide\"]");
			const compactLabel = button.querySelector("[data-dsh-share-label=\"compact\"]");
			if (wideLabel && wideLabel.textContent !== wide) wideLabel.textContent = wide;
			if (compactLabel && compactLabel.textContent !== compact) compactLabel.textContent = compact;
		}
		function createShareRuntime(document, options = {}) {
			const style = document.createElement("style");
			style.id = STYLE_ID;
			style.textContent = STYLE_TEXT;
			document.head.append(style);
			const currentLocale = options.getLocale ?? (() => getDocumentLocale(document));
			const selections = /* @__PURE__ */ new Map();
			const preserveScrollPosition = (scroll, scrollTop) => {
				const previousOverflowAnchor = scroll.style.overflowAnchor;
				scroll.style.overflowAnchor = "none";
				scroll.scrollTop = scrollTop;
				const requestFrame = document.defaultView?.requestAnimationFrame;
				if (!requestFrame) {
					scroll.style.overflowAnchor = previousOverflowAnchor;
					return;
				}
				requestFrame(() => {
					scroll.scrollTop = scrollTop;
					requestFrame(() => {
						scroll.scrollTop = scrollTop;
						scroll.style.overflowAnchor = previousOverflowAnchor;
					});
				});
			};
			const selectionFor = (sessionId) => {
				const existing = selections.get(sessionId);
				if (existing) return existing;
				const listeners = /* @__PURE__ */ new Set();
				const controller = {
					available: /* @__PURE__ */ new Map(),
					refreshScheduled: false,
					selected: /* @__PURE__ */ new Map(),
					selectNewTurns: true,
					sessionId,
					snapshots: /* @__PURE__ */ new Map(),
					snapshot: {
						active: false,
						allSelected: false,
						count: 0,
						selectedIds: /* @__PURE__ */ new Set(),
						total: 0
					},
					listeners,
					getSnapshot: () => controller.snapshot,
					subscribe: (listener) => {
						listeners.add(listener);
						return () => listeners.delete(listener);
					}
				};
				selections.set(sessionId, controller);
				return controller;
			};
			const refreshSelectionCopy = (controller) => {
				const strings = t(currentLocale());
				if (controller.scroll) for (const button of controller.scroll.querySelectorAll("[data-dsh-share-turn-select]")) {
					const id = button.dataset.turnId ?? "";
					const selected = controller.selected.has(id);
					button.setAttribute("aria-checked", String(selected));
					button.ariaLabel = selected ? t(currentLocale()).unselectTurn : t(currentLocale()).selectTurn;
				}
				if (controller.footer) {
					const all = controller.footer.querySelector("[data-dsh-share-select-all]");
					const allLabel = controller.footer.querySelector("[data-dsh-share-select-all-label]");
					const count = controller.footer.querySelector("[data-dsh-share-selection-count]");
					const cancel = controller.footer.querySelector("[data-dsh-share-selection-cancel]");
					const download = controller.footer.querySelector("[data-dsh-share-selection-download]");
					if (all) {
						all.setAttribute("aria-checked", String(controller.snapshot.allSelected));
						if (all.ariaLabel !== strings.selectAll) all.ariaLabel = strings.selectAll;
					}
					if (allLabel && allLabel.textContent !== strings.selectAll) allLabel.textContent = strings.selectAll;
					const nextCount = strings.selectedCount(controller.selected.size);
					if (count && count.textContent !== nextCount) count.textContent = nextCount;
					if (cancel && cancel.textContent !== strings.cancelSelection) cancel.textContent = strings.cancelSelection;
					if (download) updateResponsiveLabel(download, strings.downloadFile, strings.downloadFile);
					if (download) {
						download.disabled = controller.selected.size === 0 || download.dataset.busy === "true";
						controller.downloadFormat?.update(currentLocale(), download.disabled);
					}
				}
			};
			const publishSelection = (controller, active) => {
				const total = controller.available.size;
				controller.snapshot = {
					active,
					allSelected: total > 0 && controller.selected.size === total,
					count: controller.selected.size,
					selectedIds: new Set(controller.selected.keys()),
					total
				};
				refreshSelectionCopy(controller);
				for (const listener of controller.listeners) listener();
			};
			let unsubscribeLocale;
			const subscribeSelectionLocale = () => {
				if (unsubscribeLocale || !options.subscribeLocale) return;
				unsubscribeLocale = options.subscribeLocale(() => {
					for (const controller of selections.values()) if (controller.snapshot.active) refreshSelectionCopy(controller);
				});
			};
			const unsubscribeSelectionLocaleIfIdle = () => {
				if ([...selections.values()].some((controller) => controller.snapshot.active)) return;
				unsubscribeLocale?.();
				unsubscribeLocale = void 0;
			};
			const cleanupSelectionDom = (controller) => {
				const scroll = controller.scroll;
				const scrollTop = scroll?.scrollTop;
				controller.observer?.disconnect();
				controller.observer = void 0;
				controller.resizeObserver?.disconnect();
				controller.resizeObserver = void 0;
				controller.downloadFormat?.dispose();
				controller.downloadFormat = void 0;
				controller.footer?.remove();
				controller.footer = void 0;
				if (scroll) {
					if (controller.contentClickHandler) scroll.removeEventListener("click", controller.contentClickHandler);
					controller.contentClickHandler = void 0;
					for (const region of scroll.querySelectorAll("[data-dsh-share-select-region]")) region.remove();
					for (const button of scroll.querySelectorAll("[data-dsh-share-turn-select]")) button.remove();
					for (const content of scroll.querySelectorAll("[data-dsh-share-select-content]")) {
						delete content.dataset.dshShareSelectContent;
						delete content.dataset.dshShareSelectTurnId;
					}
					for (const anchor of scroll.querySelectorAll("[data-dsh-share-select-anchor]")) delete anchor.dataset.dshShareSelectAnchor;
					for (const root of scroll.querySelectorAll("[data-dsh-share-select-range-root]")) delete root.dataset.dshShareSelectRangeRoot;
					delete scroll.dataset.dshShareSelection;
					if (scrollTop !== void 0) preserveScrollPosition(scroll, scrollTop);
				}
				controller.scroll = void 0;
				controller.refreshScheduled = false;
			};
			const resetSelection = (controller) => {
				cleanupSelectionDom(controller);
				controller.available.clear();
				controller.selected.clear();
				controller.selectNewTurns = true;
				controller.snapshots.clear();
				publishSelection(controller, false);
				unsubscribeSelectionLocaleIfIdle();
			};
			const snapshotTurn = (controller, turn) => {
				const existing = controller.snapshots.get(turn.id);
				if (existing) return existing;
				const snapshot = {
					content: snapshotTurnContent(turn.content),
					id: turn.id,
					turn: turn.turn
				};
				controller.snapshots.set(turn.id, snapshot);
				return snapshot;
			};
			const toggleSelection = (controller, turnId) => {
				if (!controller.snapshot.active) return;
				const turn = controller.available.get(turnId);
				if (!turn) return;
				controller.selectNewTurns = false;
				if (controller.selected.has(turnId)) controller.selected.delete(turnId);
				else controller.selected.set(turnId, snapshotTurn(controller, turn));
				publishSelection(controller, true);
			};
			const toggleAll = (controller) => {
				if (controller.snapshot.allSelected) {
					controller.selected.clear();
					controller.selectNewTurns = false;
				} else {
					controller.selected = new Map([...controller.available.values()].map((turn) => [turn.id, snapshotTurn(controller, turn)]));
					controller.selectNewTurns = true;
				}
				publishSelection(controller, true);
			};
			const createTurnSelectionButton = (controller, turn, kind) => {
				const button = makeButton(document, "dshShareTurnSelect");
				button.role = "checkbox";
				button.dataset.turnId = turn.id;
				button.dataset.dshShareTurnSelectKind = kind;
				const box = document.createElement("span");
				box.dataset.dshShareTurnSelectBox = "";
				button.append(box);
				button.addEventListener("click", (event) => {
					event.preventDefault();
					event.stopPropagation();
					toggleSelection(controller, button.dataset.turnId ?? "");
				});
				return button;
			};
			const attachSelectionContent = (turn, anchor, kind) => {
				anchor.dataset.dshShareSelectContent = kind;
				anchor.dataset.dshShareSelectTurnId = turn.id;
			};
			const attachQuestionSelectionButton = (controller, turn) => {
				const anchor = turn.questionAnchor;
				anchor.dataset.dshShareSelectAnchor = "";
				attachSelectionContent(turn, anchor, "question");
				let region = [...anchor.children].find((child) => child instanceof HTMLElement && child.dataset.dshShareSelectRegion === "question");
				if (!region) {
					region = document.createElement("div");
					region.dataset.dshShareSelectRegion = "question";
					region.append(createTurnSelectionButton(controller, turn, "question"));
					anchor.prepend(region);
				}
				const button = region.querySelector("[data-dsh-share-turn-select]");
				if (button) button.dataset.turnId = turn.id;
			};
			/**
			* 用过程分组容器与独立回答节点作为布局锚点，内容节点仍用于导出与点击选择。
			* 在共同父容器上建立一个覆盖整段回答的绝对定位区间，
			* 内层 sticky 按钮才能像官网一样在长回答中吸顶，并在本轮回答末尾被推走。
			*/
			const attachAnswerSelectionButton = (controller, turn) => {
				const first = turn.answerAnchors[0];
				const last = turn.answerAnchors.at(-1);
				const root = first?.parentElement;
				if (!first || !last || !root || last.parentElement !== root) return;
				for (const content of turn.content.answers) attachSelectionContent(turn, content, "answer");
				root.dataset.dshShareSelectRangeRoot = "";
				controller.resizeObserver?.observe(root);
				let region = [...root.children].find((child) => child instanceof HTMLElement && child.dataset.dshShareSelectRegion === "answer" && child.dataset.turnId === turn.id);
				if (!region) {
					region = document.createElement("div");
					region.dataset.dshShareSelectRegion = "answer";
					region.dataset.turnId = turn.id;
					const sticky = document.createElement("div");
					sticky.dataset.dshShareSelectSticky = "";
					sticky.append(createTurnSelectionButton(controller, turn, "answer"));
					region.append(sticky);
					root.append(region);
				}
				const rootRect = root.getBoundingClientRect();
				const firstRect = first.getBoundingClientRect();
				const lastRect = last.getBoundingClientRect();
				region.style.top = `${Math.max(0, firstRect.top - rootRect.top)}px`;
				region.style.height = `${Math.max(44, lastRect.bottom - firstRect.top)}px`;
				const button = region.querySelector("[data-dsh-share-turn-select]");
				if (button) button.dataset.turnId = turn.id;
			};
			const attachSelectionButtons = (controller, turn) => {
				attachQuestionSelectionButton(controller, turn);
				attachAnswerSelectionButton(controller, turn);
			};
			const refreshSelection = (controller) => {
				const scroll = controller.scroll;
				if (!scroll || !controller.snapshot.active) return;
				for (const turn of selectableTurns(scroll)) {
					const isNew = !controller.available.has(turn.id);
					controller.available.set(turn.id, turn);
					if (isNew && controller.selectNewTurns) controller.selected.set(turn.id, snapshotTurn(controller, turn));
					attachSelectionButtons(controller, turn);
				}
				publishSelection(controller, true);
			};
			const scheduleRefresh = (controller) => {
				if (controller.refreshScheduled) return;
				controller.refreshScheduled = true;
				Promise.resolve().then(() => {
					controller.refreshScheduled = false;
					refreshSelection(controller);
				});
			};
			const createSelectionFooter = (controller) => {
				const strings = t(currentLocale());
				const footer = document.createElement("div");
				footer.dataset.dshShareSelectionFooter = "";
				const inner = document.createElement("div");
				inner.dataset.dshShareSelectionFooterInner = "";
				const selectAll = makeButton(document, "dshShareSelectAll");
				selectAll.role = "checkbox";
				selectAll.ariaLabel = strings.selectAll;
				const selectAllBox = document.createElement("span");
				selectAllBox.dataset.dshShareSelectAllBox = "";
				const selectAllLabel = document.createElement("span");
				selectAllLabel.dataset.dshShareSelectAllLabel = "";
				selectAllLabel.textContent = strings.selectAll;
				selectAll.append(selectAllBox, selectAllLabel);
				selectAll.addEventListener("click", () => toggleAll(controller));
				const divider = document.createElement("span");
				divider.dataset.dshShareSelectionDivider = "";
				const count = document.createElement("span");
				count.dataset.dshShareSelectionCount = "";
				const cancel = makeButton(document, "dshShareSelectionCancel");
				cancel.textContent = strings.cancelSelection;
				cancel.addEventListener("click", () => resetSelection(controller));
				const downloadGroup = document.createElement("div");
				downloadGroup.dataset.dshShareDownloadGroup = "";
				const download = makeButton(document, "dshShareSelectionDownload");
				appendResponsiveLabel(document, download, strings.downloadFile, strings.downloadFile);
				const formatMount = document.createElement("span");
				formatMount.dataset.dshShareFormatMount = "";
				let format = "markdown";
				controller.downloadFormat = mountDownloadFormat(formatMount, (value) => {
					format = value;
				});
				controller.downloadFormat.update(currentLocale(), controller.selected.size === 0);
				const hideProcessToggle = document.createElement("label");
				hideProcessToggle.dataset.dshShareSelectionHideProcess = "";
				const hideProcessInput = document.createElement("input");
				hideProcessInput.type = "checkbox";
				hideProcessInput.dataset.dshShareSelectionHideProcessInput = "";
				const hideProcessLabel = document.createElement("span");
				hideProcessLabel.dataset.dshShareSelectionHideProcessLabel = "";
				hideProcessLabel.textContent = strings.hideProcess;
				hideProcessToggle.append(hideProcessInput, hideProcessLabel);
				const selectionStorage = () => {
					try {
						return document.defaultView?.localStorage;
					} catch {
						return;
					}
				};
				const readSelectionSettings = () => ({
					...loadShareSettings(selectionStorage()),
					hideProcess: hideProcessInput.checked
				});
				const syncHideProcess = () => {
					hideProcessInput.checked = loadShareSettings(selectionStorage()).hideProcess;
					hideProcessLabel.textContent = t(currentLocale()).hideProcess;
				};
				syncHideProcess();
				hideProcessInput.addEventListener("change", () => {
					saveShareSettings(selectionStorage(), readSelectionSettings());
				});
				downloadGroup.append(formatMount, download);
				const htmlStatus = document.createElement("span");
				htmlStatus.role = "status";
				htmlStatus.dataset.dshShareHtmlStatus = "";
				download.addEventListener("click", async () => {
					if (download.dataset.busy === "true") return;
					const messages = selectedTurnsToShareMessages(controller.selected.values());
					if (!messages.length) return;
					const locale = currentLocale();
					const title = controller.title;
					const settings = readSelectionSettings();
					if (format === "markdown") {
						downloadMarkdownFile(document, createShareMarkdown(messages, locale, settings), title);
						htmlStatus.textContent = "";
						return;
					}
					download.dataset.busy = "true";
					download.disabled = true;
					controller.downloadFormat?.update(locale, true);
					htmlStatus.textContent = t(locale).htmlExporting;
					try {
						const result = await createShareHtml(document, messages, locale, settings);
						if (!footer.isConnected) return;
						downloadHtmlFile(document, result.html, title);
						htmlStatus.textContent = result.missingImages ? t(currentLocale()).htmlMissingImages : "";
					} catch {
						if (footer.isConnected) htmlStatus.textContent = t(currentLocale()).htmlExportFailed;
					} finally {
						delete download.dataset.busy;
						download.disabled = controller.selected.size === 0;
						if (controller.footer === footer) controller.downloadFormat?.update(currentLocale(), download.disabled);
					}
				});
				inner.append(selectAll, divider, count, cancel, hideProcessToggle, downloadGroup, htmlStatus);
				footer.append(inner);
				return footer;
			};
			const enterSelection = (sessionId, source, initialTurn, title) => {
				for (const [id, other] of selections) if (id !== sessionId && other.snapshot.active) resetSelection(other);
				const controller = selectionFor(sessionId);
				if (controller.snapshot.active) return;
				resetSelection(controller);
				controller.title = title;
				const scroll = (source?.closest("[data-phase]"))?.querySelector("[data-conversation-scroll]") ?? document.querySelector("[data-conversation-scroll]");
				if (!scroll) return;
				subscribeSelectionLocale();
				const scrollTop = scroll.scrollTop;
				controller.scroll = scroll;
				controller.selectNewTurns = initialTurn === void 0;
				scroll.dataset.dshShareSelection = "";
				controller.contentClickHandler = (event) => {
					const target = event.target;
					if (!(target instanceof Element)) return;
					if (target.closest("[data-dsh-share-turn-select]")) return;
					const content = target.closest("[data-dsh-share-select-content]");
					if (!content || !scroll.contains(content)) return;
					event.preventDefault();
					event.stopPropagation();
					toggleSelection(controller, content.dataset.dshShareSelectTurnId ?? "");
				};
				scroll.addEventListener("click", controller.contentClickHandler);
				const ResizeObserverConstructor = document.defaultView?.ResizeObserver;
				if (ResizeObserverConstructor) {
					controller.resizeObserver = new ResizeObserverConstructor(() => scheduleRefresh(controller));
					controller.resizeObserver.observe(scroll);
				}
				publishSelection(controller, true);
				refreshSelection(controller);
				if (initialTurn !== void 0) {
					const selected = controller.available.get(String(initialTurn));
					if (selected) controller.selected.set(selected.id, snapshotTurn(controller, selected));
				}
				controller.footer = createSelectionFooter(controller);
				scroll.append(controller.footer);
				publishSelection(controller, true);
				const MutationObserverConstructor = document.defaultView?.MutationObserver;
				if (MutationObserverConstructor) {
					controller.observer = new MutationObserverConstructor((records) => {
						if (records.some(mutationNeedsSelectionRefresh)) scheduleRefresh(controller);
					});
					controller.observer.observe(scroll, {
						childList: true,
						subtree: true
					});
				}
				preserveScrollPosition(scroll, scrollTop);
			};
			let disposed = false;
			return {
				document,
				getLocale: currentLocale,
				selectionFor,
				enterSelection,
				cancelSelection: (sessionId) => {
					resetSelection(selectionFor(sessionId));
				},
				toggleSelection: (sessionId, turnId) => toggleSelection(selectionFor(sessionId), turnId),
				dispose: () => {
					if (disposed) return;
					disposed = true;
					for (const controller of selections.values()) {
						cleanupSelectionDom(controller);
						controller.listeners.clear();
						controller.available.clear();
						controller.selected.clear();
						controller.snapshots.clear();
					}
					selections.clear();
					unsubscribeLocale?.();
					unsubscribeLocale = void 0;
					style.remove();
				}
			};
		}
		//#endregion
		//#region src/client/index.ts
		const name = "dsh-share/client";
		const inject = ["slots", "locale"];
		/** 官方 assistant-actions 插槽中的分享入口。 */
		function ShareAction({ sessionId, shareRuntime, useShareLocale, useSessions }) {
			const conversationTitle = useSessions((snapshot) => snapshot.byId[sessionId]?.title);
			const strings = t(normalizeShareLocale(useShareLocale((snapshot) => snapshot.active)));
			const button = (0, react.createElement)("button", {
				type: "button",
				"data-dsh-share-button": "",
				"aria-label": strings.share,
				onClick: (event) => {
					const turnValue = event.currentTarget.closest("[data-turn-tail]")?.dataset.turnTail;
					const turn = Number(turnValue);
					if (turnValue === void 0 || !Number.isFinite(turn)) return;
					if (event.detail > 0) event.currentTarget.blur();
					shareRuntime.enterSelection(String(sessionId), event.currentTarget, turn, conversationTitle);
				}
			}, (0, react.createElement)(_deepseek_ai_dsh_client_ui_primitives.IconShareOutlineRegular, { size: 16 }));
			return (0, react.createElement)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: strings.shareTooltip,
				side: "bottom",
				children: button
			});
		}
		/** 官方 Session Header 右侧 utilities 插槽中的多轮分享入口。 */
		function ShareConversationAction({ sessionId, shareRuntime, useShareLocale, useShareSelection, useSessions }) {
			const conversationTitle = useSessions((snapshot) => snapshot.byId[sessionId]?.title);
			const strings = t(normalizeShareLocale(useShareLocale((snapshot) => snapshot.active)));
			if (useShareSelection((snapshot) => snapshot.active)) return (0, react.createElement)(react.Fragment);
			const button = (0, react.createElement)("button", {
				type: "button",
				"data-dsh-share-conversation": "",
				"aria-label": strings.shareConversation,
				onClick: (event) => {
					if (event.detail > 0) event.currentTarget.blur();
					shareRuntime.enterSelection(String(sessionId), event.currentTarget, void 0, conversationTitle);
				}
			}, (0, react.createElement)(_deepseek_ai_dsh_client_ui_primitives.IconShareOutlineRegular, { size: 16 }));
			return (0, react.createElement)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: strings.shareConversation,
				side: "bottom",
				children: button
			});
		}
		function apply(ctx) {
			let sharedRuntime;
			let registrations = 0;
			const runtimeForRegistration = () => {
				sharedRuntime ??= createShareRuntime(document, {
					getLocale: () => normalizeShareLocale(ctx.locale.getLocale().active),
					subscribeLocale: (listener) => ctx.locale.subscribe(listener)
				});
				return sharedRuntime;
			};
			const injectFace = (sessionId) => {
				const runtime = runtimeForRegistration();
				return {
					hooks: {
						shareLocale: ctx.locale,
						shareSelection: runtime.selectionFor(String(sessionId))
					},
					shareRuntime: runtime
				};
			};
			const cleanup = (disposeRegistration) => {
				registrations += 1;
				return () => {
					disposeRegistration();
					registrations -= 1;
					if (registrations === 0) {
						sharedRuntime?.dispose();
						sharedRuntime = void 0;
					}
				};
			};
			ctx.slots.inject("conversation.chat.assistant-actions", () => {
				const disposeRegistration = ctx.slots.register({
					name: "conversation.chat.assistant-actions",
					id: "share",
					order: 20,
					inject: injectFace
				}, ShareAction);
				return cleanup(disposeRegistration);
			});
			ctx.slots.inject("conversation.session.header.utilities", () => {
				const disposeRegistration = ctx.slots.register({
					name: "conversation.session.header.utilities",
					id: "share-conversation",
					order: -10,
					inject: injectFace
				}, ShareConversationAction);
				return cleanup(disposeRegistration);
			});
		}
		//#endregion
		exports.DEFAULT_SHARE_SETTINGS = DEFAULT_SHARE_SETTINGS;
		exports.ShareAction = ShareAction;
		exports.ShareConversationAction = ShareConversationAction;
		exports.apply = apply;
		exports.createShareMarkdown = createShareMarkdown;
		exports.createShareRuntime = createShareRuntime;
		exports.findTurnContent = findTurnContent;
		exports.findTurnContentFromAction = findTurnContentFromAction;
		exports.inject = inject;
		exports.loadShareSettings = loadShareSettings;
		exports.name = name;
		exports.saveShareSettings = saveShareSettings;
		return module.exports;
	}
});
