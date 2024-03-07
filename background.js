/**
 * @license MIT
 */

console.log('Adding listener');
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in content script:', request);
    translateText(request.text, request.lang, data => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { data: data });
        });
        sendResponse({ data: data });
    });
    return true;
});

try {
    importScripts('scripts/lib/md5.js');
} catch (e) {
    console.error(e);
}

function translateText(text, lang, callback) {
    console.log('Translating text:', text);
    var appid = process.env.API_ID;
    var key = process.env.API_SECRET;
    var salt = (new Date).getTime();
    var str1 = appid + text + salt + key;
    var sign = MD5(str1);

    var params = new URLSearchParams({
        q: text,
        appid: appid,
        salt: salt,
        from: 'auto',
        to: lang,
        sign: sign
    });

    fetch('https://api.fanyi.baidu.com/api/trans/vip/translate?' + params, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
        .then(response => {
            console.log('Response:', response);
            return response.json();
        })
        .then(data => {
            console.log(data);
            callback(data);
        })
        .catch(error => {
            console.error('Error:', error);
            callback(null);
        });
}