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
const LANG_REGEX = new RegExp(`([\\s\\S]*)\\/(${SUPPORTED_LANGS})$`);

// Smart default language detection based on user's browser setting
const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
let defaultTargetLang = 'en';
if (browserLang.startsWith('zh')) defaultTargetLang = 'zh';
else if (browserLang.startsWith('ko')) defaultTargetLang = 'kor';
else if (browserLang.startsWith('ja')) defaultTargetLang = 'jp';
else if (browserLang.startsWith('es')) defaultTargetLang = 'spa';
else if (browserLang.startsWith('fr')) defaultTargetLang = 'fra';
else if (browserLang.startsWith('de')) defaultTargetLang = 'de';

// Load settings
chrome.storage.sync.get({ autoTranslate: true, targetLanguage: defaultTargetLang, inputTranslate: true }, function (result) {
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
    
    const isInputOrTextarea = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
    const isContentEditable = el.isContentEditable;
    
    if (!inputTranslate || !(isInputOrTextarea || isContentEditable)) return;

    // Use value for inputs, and innerText/textContent for contenteditable
    const text = isInputOrTextarea ? el.value : (el.innerText || el.textContent);
    
    // 预检测：如果输入不包含斜杠，或者斜杠后没有任何字符，直接跳过
    if (!text || !text.includes('/')) return;

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

                const translatedText = response.data.trans_result.map(res => res.dst).join('\n');
                
                if (isContentEditable) {
                    el.focus();
                    // Select all text using Selection API
                    const selection = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(el);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    
                    // Insert translated text
                    document.execCommand('insertText', false, translatedText);
                } else {
                    // For React/Vue controlled inputs, directly setting value might not trigger state update.
                    // We attempt to use native setters.
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
                    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
                    
                    if (el.tagName === 'INPUT' && nativeInputValueSetter) {
                        nativeInputValueSetter.call(el, translatedText);
                    } else if (el.tagName === 'TEXTAREA' && nativeTextAreaValueSetter) {
                        nativeTextAreaValueSetter.call(el, translatedText);
                    } else {
                        el.value = translatedText;
                    }
                    
                    // 触发事件同步状态
                    const events = ['input', 'change'];
                    events.forEach(evt => {
                        el.dispatchEvent(new Event(evt, { bubbles: true }));
                    });
                }
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
    const panels = document.querySelectorAll('#translate-panel');
    panels.forEach(p => {
        if (!p.contains(event.target)) {
            p.remove();
        }
    });
});

function translateSelectedText() {
    window.setTimeout(() => {
        const selectedText = window.getSelection();
        const text = selectedText.toString().trim();
        if (text && !isSelectionInInput(selectedText)) {
            const rect = selectedText.getRangeAt(0).getBoundingClientRect();
            chrome.runtime.sendMessage({ text: text, lang: targetLanguage }, function (response) {
                if (!response?.data?.trans_result) return;
                const translatedText = response.data.trans_result.map(res => res.dst).join('\n');
                showTranslation(translatedText, rect);
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
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
}
