/**
 * Input Translation
 * Copyright (C) 2026 kelin
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

let timer = null;
let targetLanguage;
let autoTranslate;
let inputTranslate;

const SUPPORTED_LANGS = 'en|zh|fra|de|kor|jp|spa|th|ara|ru|pt|it|el|nl';
const LANG_REGEX = new RegExp(`(.*)\\/(${SUPPORTED_LANGS})$`);

// Load settings
chrome.storage.sync.get({ autoTranslate: true, targetLanguage: 'zh', inputTranslate: true }, function (result) {
    targetLanguage = result.targetLanguage;
    autoTranslate = result.autoTranslate;
    inputTranslate = result.inputTranslate;
    if (autoTranslate) {
        document.addEventListener('mouseup', translateSelectedText);
    }
});

// Optimized Input Listener
document.addEventListener('keyup', function (event) {
    const el = event.target;
    if (!inputTranslate || !(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return;

    const text = el.value;
    
    // 预检测：如果输入不包含斜杠，或者斜杠后没有任何字符，直接跳过
    if (!text.includes('/')) return;

    clearTimeout(timer);
    timer = setTimeout(() => {
        const match = text.match(LANG_REGEX);
        if (match) {
            const textToTranslate = match[1].trim();
            const languageCode = match[2];

            if (!textToTranslate) return;

            console.log('Debounced translation triggering for:', textToTranslate);

            chrome.runtime.sendMessage({ text: textToTranslate, lang: languageCode }, function (response) {
                if (chrome.runtime.lastError || !response?.data?.trans_result) {
                    console.error('Translation message failed', chrome.runtime.lastError);
                    return;
                }

                const translatedText = response.data.trans_result[0].dst;
                el.value = translatedText;
                
                // 触发事件同步状态
                const events = ['input', 'change'];
                events.forEach(evt => {
                    el.dispatchEvent(new Event(evt, { bubbles: true }));
                });
            });
        }
    }, 600); // 优化后的防抖时间
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "updateSettings") {
        targetLanguage = request.targetLanguage;
        autoTranslate = request.autoTranslate;
        inputTranslate = request.inputTranslate;
        document.removeEventListener('mouseup', translateSelectedText);
        if (autoTranslate) {
            document.addEventListener('mouseup', translateSelectedText);
        }
    }
});

// Close panel when clicking outside
document.addEventListener('click', function (event) {
    const panel = document.getElementById('translate-panel');
    if (panel && !panel.contains(event.target)) {
        panel.remove();
    }
});

function translateSelectedText() {
    window.setTimeout(() => {
        const selectedText = window.getSelection();
        const text = selectedText.toString().trim();
        if (text && !isSelectionInInput(selectedText)) {
            const rect = selectedText.getRangeAt(0).getBoundingClientRect();
            chrome.runtime.sendMessage({ text: text, lang: targetLanguage }, function (response) {
                if (!response?.data?.trans_result) return;
                showTranslation(response.data.trans_result[0].dst, rect);
            });
        }
    }, 200);
}

function isSelectionInInput(selection) {
    return isTextInInput(selection.anchorNode) || isTextInInput(selection.focusNode);
}

function isTextInInput(node) {
    if (!node) return false;
    const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA');
}
