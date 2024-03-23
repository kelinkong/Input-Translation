/**
 * @license MIT
 */

let timer = null;
let targetLanguage;
let autoTranslate;
let inputTranslate;

// Load settings from browser storage
chrome.storage.sync.get({ autoTranslate: true, targetLanguage: 'zh', inputTranslate: true }, function (result) {
    console.log('Settings loaded:', result);
    targetLanguage = result.targetLanguage;
    autoTranslate = result.autoTranslate;
    inputTranslate = result.inputTranslate;
    console.log('autoTranslate:', autoTranslate);
    if (autoTranslate) {
        document.addEventListener('mouseup', translateSelectedText);
    }
});

// Listen for keyup events
document.addEventListener('keyup', function (event) {
    if (event.target.tagName.toLowerCase() === 'input' && inputTranslate) {
        clearTimeout(timer);
        timer = setTimeout(() => { // Set a timeout to limit the number of requests
            console.log('translateText called with text:');
            var text = event.target.value;
            console.log(event);
            var match = text.match(/(.*)(\/en|\/zh|\/fra|\/de|\/kor|\/jp|\/spa|\/th|\/ara|\/ru|\/pt|\/it|\/el|\/nl)$/);
            if (match) {
                console.log("start to translate");
                var textToTranslate = match[1];
                var languageCode = match[2].slice(1);
                chrome.runtime.sendMessage({ text: textToTranslate, lang: languageCode }, function (response) {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError);
                        return;
                    }
                    console.log(response.data);
                    event.target.value = response.data.trans_result[0].dst;
                });
            }
        }, 1000);
    }
});

// Listen for messages from the popup，update settings
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('Message received from popup:', request);
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

// close the panel when clicking outside
document.addEventListener('click', function (event) {
    if (panel && !panel.contains(event.target)) {
        panel.remove();
    }
});

function translateSelectedText() {
    console.log('translateSelectedText called');
    window.setTimeout(() => { // Set a timeout to wait for the selection to be completed
        var selectedText = window.getSelection();
        var text = selectedText.toString();
        if (text && !isSelectionInInput(selectedText)) {
            var rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
            chrome.runtime.sendMessage({ text: text, lang: targetLanguage }, function (response) {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    return;
                }
                if (!response || !response.data || !response.data.trans_result || response.data.trans_result.length === 0) {
                    console.error('Unexpected response', response);
                    return;
                }
                console.log(response.data);
                showTranslation(response.data.trans_result[0].dst, rect);
            });
        }
    });
}

function isSelectionInInput(selection) {
    return isTextInInput(selection.anchorNode) || isTextInInput(selection.focusNode);
}

function isTextInInput(node) {
    console.log(node);
    if (node.nodeType === Node.ELEMENT_NODE && (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA')) {
        return true;
    }
    for (var i = 0; i < node.childNodes.length; i++) {
        if (isTextInInput(node.childNodes[i])) {
            return true;
        }
    }
    return false;
}
