# Input Translation (输入翻译官) 🚀

[![许可证: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](https://opensource.org/licenses/GPL-3.0)
[![Vite](https://img.shields.io/badge/构建工具-Vite-646CFF?logo=vite)](https://vitejs.dev/)
<a href="https://www.buymeacoffee.com/kelinkong" target="_blank"><img src="https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support%20Me-FFDD00?style=flat&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee"></a>

[English](./README.md)

**Input Translation** 是一款功能强大的浏览器插件，旨在优化你的跨语言工作流。它提供了输入框即时翻译、划词翻译以及地址栏快速翻译功能。

## ✨ 核心功能

### 1. 输入框翻译 (键盘魔术)
通过在文本后输入 `/` + 语言代码，即可实现即时翻译。
- **使用方法:** 输入 `你好/en` -> 按空格或回车 -> 自动变为 `Hello`。完美支持 **ChatGPT、Claude** 等任何富文本输入框！
- **支持语言代码:** `en` (英), `zh` (中), `jp` (日), `kor` (韩), `fra` (法), `spa` (西), `de` (德), `it` (意), `ru` (俄), `pt` (葡), `ara` (阿), `nl` (荷)。

![输入翻译演示](./images/input.gif)

### 2. 地址栏快速翻译 (Omnibox)
直接在浏览器地址栏进行快速翻译并搜索，无需切换页面。
- **使用方法:** 在地址栏输入 `tr` + **空格** -> 输入 `apple/zh`。
- **即时预览:** 下拉列表会即刻显示翻译结果。
- **自动填充与搜索:** 选中结果后地址栏会自动填充翻译内容，按下**回车**将直接在 Google 中搜索该结果。

### 3. 划词/选区翻译
在网页上选中任何单词或段落，即可唤出一个优雅不打扰的翻译按钮，点击后弹出即时翻译窗口。

![划词翻译演示](images/select-trans.png)

---

## 🌐 网站支持情况

| 网站 | 支持状态 | 备注 |
| :---- | :----: | :---- |
| ChatGPT / Claude | ✅ | 完美支持 |
| Google / Bing | ✅ | 完美支持 |
| GitHub | ✅ | 完美支持 |
| 知乎 / 掘金 | ✅ | 完美支持 |

---

## 🛠️ 架构与构建

本项目采用了**端云结合的双通道降级架构**。默认情况下直接在客户端发起请求实现 0 延迟翻译；对于处于防火墙内（如中国大陆）的用户，会自动无缝降级到 Cloudflare Worker 边缘节点，通过安全的后端网关调用百度 API 进行兜底。

### 安装与配置
1. 克隆仓库并安装依赖: `npm install`
2. 使用 `proxy-worker.js` 中的代码创建一个 Cloudflare Worker。
3. 将 `background.js` 中的 `PROXY_URL` 替换为你自己的 Worker 链接。
4. 构建项目: `npm run build`
5. 在浏览器中加载 `dist/` 目录即可使用。

---

## 💖 支持与反馈

如果这个插件为你省下了几次复制粘贴的时间，或者让你的跨国沟通和查阅文献变得更顺畅了，请考虑请我喝杯咖啡，这将帮我覆盖后端的代理服务器 API 成本！

<a href="https://www.buymeacoffee.com/kelinkong" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 50px !important;width: 181px !important;" ></a>

**想要高级功能？**
如果你有关于接入 **DeepL API**、**大模型 (ChatGPT) 语气润色** 等 Pro 级功能的需求，欢迎通过邮件联系我：`1763605980@qq.com`。

---

## 📜 许可证
基于 GNU GPL v3.0 许可证发布。查看 `LICENSE` 文件了解更多详情。

---

*Made with ❤️ by [kelin]*
