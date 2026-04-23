/**
 * Input Translation
 * Copyright (C) 2026 kelin
 */

import { MD5 } from './scripts/lib/md5.js';

console.log('Background script initialized');

// --- Omnibox (Address Bar) Support ---
const SUPPORTED_LANGS = 'en|zh|fra|de|kor|jp|spa|th|ara|ru|pt|it|el|nl';
const LANG_REGEX = new RegExp(`(.*)\\/(${SUPPORTED_LANGS})$`);

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
    const match = text.match(LANG_REGEX);
    if (match) {
        const textToTranslate = match[1].trim();
        const languageCode = match[2];
        
        translateText(textToTranslate, languageCode, data => {
            if (data?.trans_result) {
                const translated = data.trans_result[0].dst;
                suggest([
                    { content: translated, description: `Translation: ${translated}` }
                ]);
                // 更新默认建议（第一行）
                chrome.omnibox.setDefaultSuggestion({
                    description: `Result: ${translated}`
                });
            }
        });
    } else {
        chrome.omnibox.setDefaultSuggestion({
            description: "Format: text/lang (e.g., hello/zh)"
        });
    }
});

chrome.omnibox.onInputEntered.addListener((text) => {
    // 检查输入是否符合 text/lang 格式
    const match = text.match(LANG_REGEX);
    if (match) {
        // 如果用户直接对原始输入按回车，先翻译再搜索
        const textToTranslate = match[1].trim();
        const languageCode = match[2];
        translateText(textToTranslate, languageCode, data => {
            if (data?.trans_result) {
                const translated = data.trans_result[0].dst;
                performSearch(translated);
            }
        });
    } else {
        // 如果用户选中了建议项（已经是翻译结果）按回车，直接搜索
        performSearch(text);
    }
});

function performSearch(query) {
    // 使用 Google 搜索翻译后的结果
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    chrome.tabs.update({ url: searchUrl });
}
// -------------------------------------

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in background script:', request);
    translateText(request.text, request.lang, data => {
        // 同时发送回 content script
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs && tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { data: data });
            }
        });
        sendResponse({ data: data });
    });
    return true;
});

function translateText(text, lang, callback) {
    console.log('Translating text:', text);
    const appid = import.meta.env.VITE_BAIDU_APP_ID;
    const key = import.meta.env.VITE_BAIDU_KEY;
    const salt = (new Date).getTime();
    const str1 = appid + text + salt + key;
    const sign = MD5(str1);

    // 使用 URLSearchParams 构造 POST body
    const body = new URLSearchParams({
        q: text,
        appid: appid,
        salt: salt,
        from: 'auto',
        to: lang,
        sign: sign
    });

    console.log('Requesting Baidu API via POST...');

    fetch('https://api.fanyi.baidu.com/api/trans/vip/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Baidu API Response:', data);
        if (data.error_code) {
            console.error('Baidu API Error:', data.error_code, data.error_msg);
        }
        callback(data);
    })
    .catch(error => {
        console.error('Fetch Error:', error);
        callback(null);
    });
}
