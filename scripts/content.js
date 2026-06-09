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

            // Check if extension context is still valid before sending message
            if (!chrome.runtime?.id) {
                console.warn("Extension context invalidated. Please refresh the page.");
                return;
            }

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
    // Remove translation panels
    const panels = document.querySelectorAll('#translate-panel');
    panels.forEach(p => {
        if (!p.contains(event.target)) {
            p.remove();
        }
    });

    // Remove quick translate button if clicked outside
    if (translateButton && !translateButton.contains(event.target)) {
        translateButton.remove();
        translateButton = null;
    }
});

let translateButton = null;

function translateSelectedText(event) {
    window.setTimeout(() => {
        const selectedText = window.getSelection();
        const text = selectedText.toString().trim();
        
        // Remove existing button
        if (translateButton) {
            translateButton.remove();
            translateButton = null;
        }

        // If no text or clicked inside existing panel, do nothing
        if (!text || isSelectionInInput(selectedText)) return;
        
        // Check if the click was on our own UI elements
        if (event && event.target) {
            const target = event.target;
            if (target.closest('#translate-panel') || target.closest('#quick-translate-btn')) {
                return;
            }
        }

        const rect = selectedText.getRangeAt(0).getBoundingClientRect();
        const absoluteRect = {
            top: rect.top + window.scrollY,
            bottom: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            right: rect.right + window.scrollX,
            width: rect.width,
            height: rect.height
        };

        showQuickTranslateButton(text, absoluteRect);
    }, 200);
}

function showQuickTranslateButton(text, absoluteRect) {
    translateButton = document.createElement('div');
    translateButton.id = 'quick-translate-btn';
    translateButton.title = 'Translate';
    translateButton.innerHTML = `<img src="${chrome.runtime.getURL('images/icon-32.png')}" style="width: 16px; height: 16px; display: block;">`;
    
    Object.assign(translateButton.style, {
        position: 'absolute',
        top: (absoluteRect.bottom + 5) + 'px',
        left: absoluteRect.right + 'px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '6px',
        padding: '4px',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: '2147483646',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.1s ease',
        userSelect: 'none'
    });

    translateButton.addEventListener('mouseover', () => {
        translateButton.style.transform = 'scale(1.1)';
        translateButton.style.backgroundColor = '#f8f9fa';
    });
    translateButton.addEventListener('mouseout', () => {
        translateButton.style.transform = 'scale(1)';
        translateButton.style.backgroundColor = '#fff';
    });

    translateButton.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevent selection clearing
        e.stopPropagation();
        
        translateButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
        <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>`;
        
        // Check if extension context is still valid
        if (!chrome.runtime?.id) {
            console.warn("Extension context invalidated. Please refresh the page.");
            translateButton.remove();
            return;
        }

        chrome.runtime.sendMessage({ text: text, lang: targetLanguage }, function (response) {
            translateButton.remove();
            translateButton = null;
            if (!response?.data?.trans_result) return;
            const translatedText = response.data.trans_result.map(res => res.dst).join('\n');
            showTranslation(translatedText, absoluteRect);
        });
    });

    document.body.appendChild(translateButton);
}

function isSelectionInInput(selection) {
    return isTextInInput(selection.anchorNode) || isTextInInput(selection.focusNode);
}

function isTextInInput(node) {
    if (!node) return false;
    const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
}
