# Input Translation 🚀

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](https://opensource.org/licenses/GPL-3.0)
[![Vite](https://img.shields.io/badge/build-Vite-646CFF?logo=vite)](https://vitejs.dev/)
<a href="https://www.buymeacoffee.com/kelinkong" target="_blank"><img src="https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support%20Me-FFDD00?style=flat&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee"></a>

[中文说明](./README-zh.md)

**Input Translation** is a powerful browser extension designed to enhance your multilingual workflow. It features instant input field translation, hover translation, and quick address bar translation.

## ✨ Features

### 1. Input Box Translation (Keyboard Magic)
Instantly translate your text by typing `/` followed by the language code.
- **Usage:** Type `Hello/zh` -> press space/enter -> turns into `你好`. Works flawlessly in **ChatGPT, Claude**, and any rich-text editor!
- **Supported Languages:** `en`, `zh`, `jp`, `kor`, `fra`, `spa`, `de`, `it`, `ru`, `pt`, `ara`, `nl`.

![Input Translation Demo](./images/input.gif)

### 2. Address Bar Quick Translation (Omnibox)
Translate directly from your browser's address bar and perform searches instantly.
- **Usage:** Type `tr` + **Space** in the address bar -> type `apple/zh`.
- **Instant Preview:** The translation result appears in the dropdown menu instantly.
- **Auto-fill & Search:** Select a result to fill the address bar, or press **Enter** to search for the translated text directly on Google.

### 3. Hover/Selection Translation
Select any word or paragraph on a webpage to get a non-intrusive translate button and an instant translation popup.

![Selection Translation Demo](images/select-trans.png)

---

## 🌐 Website Compatibility

| Website | Status | Notes |
| :---- | :----: | :---- |
| ChatGPT / Claude | ✅ | Fully Supported |
| Google / Bing | ✅ | Fully Supported |
| GitHub | ✅ | Fully Supported |
| Reddit / Twitter (X)| ✅ | Fully Supported |

---

## 🛠️ Architecture & Build

This project utilizes a **zero-latency dual-channel fallback architecture**. By default, it securely routes translations through the client to minimize latency. For users behind firewalls (e.g., in mainland China), it seamlessly falls back to a secure Cloudflare Worker proxy running the Baidu API.

### Setup & Build
1. Clone the repo and install dependencies: `npm install`
2. Create a Cloudflare Worker using the code in `proxy-worker.js`.
3. Update the `PROXY_URL` in `background.js` to your worker's URL.
4. Build for production: `npm run build`
5. Load the `dist/` folder into your browser.

---

## 💖 Support & Feedback

If this extension has saved you a few copy-paste clicks or made your cross-border workflow smoother, consider buying me a coffee to help cover the server proxy costs!

<a href="https://www.buymeacoffee.com/kelinkong" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 50px !important;width: 181px !important;" ></a>

**Feature Requests or Pro Versions?**
If you need advanced features like **DeepL integration** or **AI text polishing**, feel free to reach out to me at `1763605980@qq.com`.

---

## 📜 License
Distributed under the GNU GPL v3.0 License. See `LICENSE` for more information.

---

*Made with ❤️ by [kelin]*
