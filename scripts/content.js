/**
 * @license MIT
 */

let timer = null;
let targetLanguage;
let autoTranslate;
let inputTranslate;

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

document.addEventListener('keyup', function (event) {
    if (event.target.tagName.toLowerCase() === 'input' && inputTranslate) {
        clearTimeout(timer); // 清除之前的定时器
        timer = setTimeout(() => { // 设置新的定时器
            console.log('translateText called with text:');
            var text = event.target.value;
            console.log(event);
            var match = text.match(/(.*)(\/en|\/zh|\/fra|\/de|\/kor|\/jp|\/spa|\/th|\/ara|\/ru|\/pt|\/it|\/el|\/nl)$/);
            if (match) {
                console.log("start to translate");
                var textToTranslate = match[1]; // 匹配到的文本，不包括语言代码
                var languageCode = match[2].slice(1); // 匹配到的语言代码
                chrome.runtime.sendMessage({ text: textToTranslate, lang: languageCode }, function (response) {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError);
                        return;
                    }
                    console.log(response.data);
                    event.target.value = response.data.trans_result[0].dst;
                });
            }
        }, 1000); // 延迟1000毫秒
    }
});

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
function translateSelectedText() {
    console.log('translateSelectedText called');
    window.setTimeout(() => {
        var selectedText = window.getSelection().toString();
        if (selectedText) {
            var rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
            chrome.runtime.sendMessage({ text: selectedText, lang: targetLanguage }, function (response) {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    return;
                }
                console.log(response.data);
                showTranslation(response.data.trans_result[0].dst, selectedText, rect);
            });
        }
    });
}

function showTranslation(translation, originalText, rect) {
    console.log('showTranslation called with translation:', translation);
    panel = document.createElement('div');
    panel.id = 'translate-panel';
    let innerHTMLContent = `
    <div id="translate-panel-header" style="display: flex; justify-content: space-between; align-items: center; padding: 5px 10px; background: #F5F5F5; border-top-left-radius: 10px; border-top-right-radius: 10px;">
        <div style="display: inline-flex; align-items: center;">
            <img id="logo" src="${chrome.runtime.getURL('images/icon-32.png')}" style="width: 18px; height: 18px;">
            <span style="margin-left: 5px;">Input Translation</span>
        </div>
        <button id="close-button" style="border: none; background: transparent; font-size: 25px; margin-top: -5px;">×</button>
    </div>
    <div id="translate-panel-content" style="padding: 5px 15px; margin-top: 0; margin-bottom: 0;">${translation}</div>
`;
    panel.innerHTML = innerHTMLContent;
    panel.style.position = 'fixed';
    panel.style.top = rect.bottom + 10 + 'px';
    panel.style.left = rect.left + 'px';
    panel.style.backgroundColor = '#FFFFFF';
    panel.style.border = '1px solid #CCCCCC';
    panel.style.width = '250px';
    panel.style.height = 'auto';
    panel.style.overflow = 'visible';
    panel.style.wordWrap = 'break-word';
    panel.style.zIndex = '1000';
    panel.style.fontSize = '16px';
    panel.style.borderRadius = '10px';
    panel.style.color = '#333';
    document.body.appendChild(panel);
    var closeButton = document.getElementById('close-button');
    closeButton.addEventListener('click', function () {
        panel.remove();
        window.getSelection().removeAllRanges();
    });
}

document.addEventListener('click', function (event) {
    var isClickInside = panel.contains(event.target);
    if (!isClickInside) {
        // 用户点击了面板外部，关闭面板
        panel.remove();
    }
});