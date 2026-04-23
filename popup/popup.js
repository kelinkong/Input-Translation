/**
 * Input Translation
 * Copyright (C) 2026 kelin
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

console.log('popup.js loaded');

document.getElementById('auto-translate').addEventListener('change', saveSettings);
document.getElementById('target-language').addEventListener('change', saveSettings);
document.getElementById('input-translate').addEventListener('change', saveSettings);

window.onload = function () {
    chrome.storage.sync.get(['autoTranslate', 'targetLanguage', 'inputTranslate'], function (result) {
        document.getElementById('auto-translate').checked = result.autoTranslate;
        document.getElementById('target-language').value = result.targetLanguage;
        document.getElementById('input-translate').checked = result.inputTranslate;
        console.log('Settings loaded', result.autoTranslate, result.targetLanguage, result.inputTranslate);
    });
}

function saveSettings() {
    let autoTranslate = document.getElementById('auto-translate').checked;
    let targetLanguage = document.getElementById('target-language').value;
    let inputTranslate = document.getElementById('input-translate').checked;
    chrome.storage.sync.set({ autoTranslate: autoTranslate, targetLanguage: targetLanguage, inputTranslate: inputTranslate }, function () {
        sendMessageToContent(autoTranslate, targetLanguage, inputTranslate);
    });
    console.log('Settings saved', autoTranslate, targetLanguage, inputTranslate);
}

function sendMessageToContent(autoTranslate, targetLanguage, inputTranslate) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "updateSettings", autoTranslate: autoTranslate, targetLanguage: targetLanguage, inputTranslate: inputTranslate });
    });
}

document.getElementById('project-link').addEventListener('click', function () {
    chrome.tabs.create({ url: 'https://github.com/kelinkong/Input-Translation.git' });
});