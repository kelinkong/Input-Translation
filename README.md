# Input Translation 🚀

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](https://opensource.org/licenses/GPL-3.0)
[![Vite](https://img.shields.io/badge/build-Vite-646CFF?logo=vite)](https://vitejs.dev/)

[中文说明](./README-zh.md)

**Input Translation** is a powerful browser extension designed to enhance your multilingual workflow. It features instant input field translation, hover translation, and quick address bar translation.

## ✨ Features

### 1. Input Box Translation (Keyboard Magic)
Instantly translate your text by typing `/` followed by the language code.
- **Usage:** Type `Hello/zh` -> press space/enter -> turns into `你好`.
- **Supported Languages:** `en`, `zh`, `jp`, `kor`, `fra`, `spa`, `de`, `it`, `ru`, `pt`, `ara`, `nl`.

![Input Translation Demo](./images/input.gif)

### 2. Address Bar Quick Translation (Omnibox)
Translate directly from your browser's address bar and perform searches instantly.
- **Usage:** Type `tr` + **Space** in the address bar -> type `apple/zh`.
- **Instant Preview:** The translation result appears in the dropdown menu instantly.
- **Auto-fill & Search:** Select a result to fill the address bar, or press **Enter** to search for the translated text directly on Google.

### 3. Hover/Selection Translation
Select any word or paragraph on a webpage to get an instant translation popup.

![Selection Translation Demo](images/select-trans.png)

---

## 🌐 Website Compatibility

| Website | Status | Notes |
| :---- | :----: | :---- |
| Google Search | ✅ | Fully Supported |
| Bing Search | ✅ | Fully Supported |
| GitHub | ✅ | Fully Supported |
| Zhihu | ✅ | Fully Supported |
| Stack Overflow | ✅ | Fully Supported |
| YouTube | ✅ | Fully Supported |
| Twitter (X) | ✅ | Fully Supported |
| Quora | ✅ | Fully Supported |

---

## 🛠️ Development & Build

This project uses **Vite** for secure API key management and optimized builds.

### Setup & Build
1. Clone the repo and install dependencies: `npm install`
2. Create a `.env` file with your [Baidu Translation API](https://fanyi-api.baidu.com/) keys:
   ```env
   VITE_BAIDU_APP_ID=your_appid
   VITE_BAIDU_KEY=your_key
   ```
3. Build for production: `npm run build`
4. Load the `dist/` folder into your browser.

---

## 📜 License
Distributed under the GNU GPL v3.0 License. See `LICENSE` for more information.

---

*Made with ❤️ by [kelin]*
