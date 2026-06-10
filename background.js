/**
 * Input Translation
 * Copyright (C) 2026 kelin
 */

console.log('Background script initialized');

// REPLACE THIS with your actual deployed proxy URL
const PROXY_URL = 'https://baidu-translate-proxy.kelin-kong13.workers.dev/';

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

// --- Translation Cache ---
const translationCache = new Map();
const MAX_CACHE_SIZE = 500;

function getCacheKey(text, lang) {
    return `${lang}:${text}`;
}

function getFromCache(text, lang) {
    const key = getCacheKey(text, lang);
    if (translationCache.has(key)) {
        // Move to top to simulate LRU
        const value = translationCache.get(key);
        translationCache.delete(key);
        translationCache.set(key, value);
        return value;
    }
    return null;
}

function setInCache(text, lang, data) {
    const key = getCacheKey(text, lang);
    if (translationCache.size >= MAX_CACHE_SIZE) {
        // Remove the oldest entry (the first item in the Map)
        const oldestKey = translationCache.keys().next().value;
        translationCache.delete(oldestKey);
    }
    translationCache.set(key, data);
}

// --- Network State ---
let canReachGoogle = null; // null = untested, true = connected, false = blocked

// Function to silently ping Google to check for GFW
async function checkNetworkEnvironment() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        // Ping the actual translation endpoint we intend to use, rather than a generic 204 endpoint 
        // which might be intercepted or ignored by certain proxy rules.
        const testUrl = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=en&dt=t&q=test';
        const res = await fetch(testUrl, { 
            method: 'GET', 
            signal: controller.signal 
        });
        clearTimeout(timeoutId);
        if (res.ok) {
            canReachGoogle = true;
            console.log('Network Check: Google Translate is reachable (Overseas/Proxy).');
        } else {
            throw new Error('Google Translate HTTP Error');
        }
    } catch (e) {
        canReachGoogle = false;
        console.log('Network Check: Google Translate is blocked or timed out. Skipping Google API.', e.message);
    }
}

// Check network on extension load
checkNetworkEnvironment();
// Re-check every 30 minutes in case they toggle their VPN
setInterval(checkNetworkEnvironment, 30 * 60 * 1000);


// Helper to map Baidu language codes to Google Translate language codes
function mapBaiduToGoogleLang(baiduLang) {
    const map = {
        'zh': 'zh-CN',
        'jp': 'ja',
        'kor': 'ko',
        'spa': 'es',
        'fra': 'fr',
        'ara': 'ar'
    };
    return map[baiduLang] || baiduLang;
}

async function fetchGoogleTranslate(text, lang) {
    // If we already know Google is blocked, fail fast! No need to wait 1.5s.
    if (canReachGoogle === false) {
        throw new Error('Google is blocked in current network environment. Fast fallback triggered.');
    }
    const googleLang = mapBaiduToGoogleLang(lang);
    const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${googleLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    // 2000ms hard timeout for Google API to accommodate slower proxies while still failing fast for GFW
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    try {
        const response = await fetch(googleUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error('Google Translate HTTP Error');
        
        const googleData = await response.json();
        let translatedText = '';
        
        if (googleData && googleData[0]) {
            googleData[0].forEach(item => {
                if (item[0]) translatedText += item[0];
            });
        }

        if (translatedText) {
            // Mock Baidu's response structure so the content script doesn't need to change
            return {
                from: 'auto',
                to: lang,
                trans_result: [{
                    src: text,
                    dst: translatedText
                }]
            };
        }
        throw new Error('Google Translate empty result');
    } catch (error) {
        clearTimeout(timeoutId);
        throw error; // Let the caller handle the fallback
    }
}

async function fetchBaiduProxy(text, lang) {
    const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text: text,
            lang: lang
        })
    });

    if (!response.ok) {
        throw new Error('Proxy response was not ok');
    }
    
    const data = await response.json();
    if (data.error_code) {
        console.error('Baidu API Error:', data.error_code, data.error_msg);
    }
    return data;
}

function translateText(text, lang, callback) {
    console.log('Translating text:', text);
    
    // Check Cache first
    const cachedData = getFromCache(text, lang);
    if (cachedData) {
        console.log('Serving translation from cache');
        callback(cachedData);
        return;
    }

    // Scheme B: Dual-Channel Waterfall -> Google -> Baidu(Proxy)
    fetchGoogleTranslate(text, lang)
        .then(data => {
            console.log('Google Translate Success (Channel 1)');
            if (data && data.trans_result) setInCache(text, lang, data);
            callback(data);
        })
        .catch(googleError => {
            console.warn('Google failed or skipped:', googleError.message);
            console.log('Falling back to Worker Proxy/Baidu (Channel 2 - Failsafe)...');
            
            fetchBaiduProxy(text, lang)
                .then(data => {
                    console.log('Proxy/Baidu Translate Success (Channel 2)');
                    if (data && data.trans_result) setInCache(text, lang, data);
                    callback(data);
                })
                .catch(proxyError => {
                    console.error('All translation channels (Google, Baidu) exhausted and failed:', proxyError);
                    callback(null);
                });
        });
}
