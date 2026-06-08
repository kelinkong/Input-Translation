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

let panel; 

function showTranslation(translation, rect) {
    // Clean up any existing panels to prevent duplicates getting stuck
    const existingPanels = document.querySelectorAll('#translate-panel');
    existingPanels.forEach(p => p.remove());

    panel = document.createElement('div');
    panel.id = 'translate-panel';
    let innerHTMLContent = `
    <div class="translate-panel-header" style="display: flex; justify-content: space-between; align-items: center; padding: 5px 10px; background: #F5F5F5; border-top-left-radius: 10px; border-top-right-radius: 10px; cursor: default;">
        <div style="display: inline-flex; align-items: center;">
            <img class="logo" src="${chrome.runtime.getURL('images/icon-32.png')}" style="width: 18px; height: 18px;">
            <span style="margin-left: 5px;">Input Translation</span>
        </div>
        <button class="close-button" style="border: none; background: transparent; font-size: 25px !important; margin-top: -5px; padding: 0; cursor: pointer;">×</button>
    </div>
    <div class="translate-panel-content" style="padding: 5px 15px; margin-top: 0; margin-bottom: 0;text-align: justify;">${translation}</div>
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
    panel.style.overflowWrap = 'break-word';
    panel.style.zIndex = '1000';
    panel.style.fontSize = '16px';
    panel.style.borderRadius = '10px';
    panel.style.color = '#333';
    
    // Bind event directly to the button within this specific panel
    const closeButton = panel.querySelector('.close-button');
    if (closeButton) {
        closeButton.addEventListener('click', function (event) {
            panel.remove();
            window.getSelection().removeAllRanges();
        });
    }

    // Prevent clicks inside the panel from propagating and triggering the outside-click closer
    panel.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    document.body.appendChild(panel);
}
