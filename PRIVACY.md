# Privacy Policy for Input Translation

**Last Updated:** June 18, 2026

**Input Translation** (the "Extension") is an open-source browser extension designed to help users translate text directly in input fields, web page selections, and the address bar. We value your privacy and are committed to protecting any information processed through the Extension. 

This Privacy Policy explains what information is processed, how it is used, and your choices regarding that information.

---

## 1. No Data Collection by the Developer

**We do not collect, harvest, store, or sell your personal data.** 

Unlike many commercial services, the Extension does not require user registration or account creation, and the developer does not operate any centralized servers to collect, analyze, or aggregate user data. All translation operations are executed locally on your device or routed directly to authorized third-party APIs.

---

## 2. What Information Is Processed and How

To provide its core translation features, the Extension interacts with the following data:

### A. Text Submitted for Translation (User Content)
*   **What we process:** The text you highlight/select on a webpage, type in the address bar (with the translation trigger), or type in any input box (ending with a translation trigger like `/zh`).
*   **How it is processed:** This text is processed temporarily in the browser memory and transmitted securely via HTTPS directly to either:
    1.  The official **Baidu Translation API** (`https://api.fanyi.baidu.com`).
    2.  Your own **self-hosted proxy server** (e.g., Cloudflare Workers) if you choose to configure one.
*   **Retention:** We do not save or log your translated text. Once the translation is returned and inserted into your input box or displayed on your screen, it is cleared from the Extension's active memory (except for a temporary in-memory session cache to prevent duplicate network calls for the same phrase, which is cleared when you close the tab or browser).

### B. Extension Settings and Preferences
*   **What we process:** Your preferences, such as default target language, auto-translate toggles, and any custom API keys or proxy URLs you configure.
*   **How it is processed:** These configurations are saved directly in your browser's local synchronized storage (`chrome.storage.sync`).
*   **Retention:** This data remains on your local machine and may be synchronized across your devices via your browser's built-in secure sync service (e.g., Microsoft Account Sync or Google Account Sync). The developer has no access to this storage.

---

## 3. Required Permissions and Why We Need Them

To function properly, the Extension requests specific permissions in the browser manifest. Here is why they are needed:

*   **`storage`:** Required to save your extension configurations and preferences (e.g., target language, toggles, API keys) so you do not have to reconfigure them every time.
*   **`activeTab` and `tabs`:** Required to detect when you select text or focus on input fields inside an active browser tab, allowing the Extension to render translation bubbles and insert translated text.
*   **`contextMenus`:** Required to add the "Translate Selected Text" shortcut to your browser's right-click context menu.
*   **`host_permissions` (`<all_urls>`, `https://api.fanyi.baidu.com/*`):** Required to run content scripts on webpages so you can translate text inline across any site (e.g., ChatGPT, Claude, GitHub), and to authorize network requests to the Baidu Translation API or your custom Cloudflare Worker proxy.

---

## 4. Third-Party Services

When you request a translation, the selected text is transmitted to third-party services to generate translation results. Depending on your configuration, these services may include:

*   **Baidu Translate API:** Translation requests are handled by Baidu. We recommend reviewing the [Baidu Privacy Policy](https://fanyi.baidu.com/) to understand how they process and protect your data.
*   **Your Deployed Proxy (Cloudflare Workers):** If you run a custom Cloudflare Worker proxy to route requests, the transmission and processing are governed by Cloudflare's privacy practices and your own configuration.

---

## 5. Security

We take the security of your data seriously. All communications between the Extension and translation APIs are encrypted in transit using industry-standard **HTTPS** protocols.

---

## 6. Children's Privacy

The Extension is not designed to attract, nor do we knowingly target, collect, or process any information from children. Because we do not collect any personal data, we do not store children's data.

---

## 7. Compliance with Store Developer Policies

This Extension complies with the **Microsoft Edge Add-ons Store Developer Policies** and the **Chrome Web Store Developer Program Policies** regarding user data protection, single-purpose use, and permission minimization.

---

## 8. Open Source and Transparency

The Extension is open-source, and its full source code is available for public audit at:  
[https://github.com/kelinkong/Input-Translation](https://github.com/kelinkong/Input-Translation)

You can inspect the code at any time to verify that no personal data is collected or transmitted to any unauthorized servers.

---

## 9. Changes to This Privacy Policy

We may update this Privacy Policy from time to time to reflect changes in our technical design, functionality, or store requirements. Any updates will be pushed directly to our GitHub repository. We encourage you to review this page periodically.

---

## 10. Contact Us

If you have any questions or suggestions about this Privacy Policy, please feel free to open an issue on our GitHub repository or contact us directly at:  
**Email:** 1763605980@qq.com
