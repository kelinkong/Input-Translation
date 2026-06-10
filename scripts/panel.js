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

function showTranslation(translation, absoluteRect) {
    // Clean up any existing panels to prevent duplicates getting stuck
    const existingPanels = document.querySelectorAll('#translate-panel');
    existingPanels.forEach(p => p.remove());

    panel = document.createElement('div');
    panel.id = 'translate-panel';
    
    // Modern UI with Copy button
    let innerHTMLContent = `
    <div class="translate-panel-header" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f8f9fa; border-bottom: 1px solid #eaeaea; border-top-left-radius: 10px; border-top-right-radius: 10px; cursor: default; user-select: none;">
        <div style="display: inline-flex; align-items: center; gap: 6px;">
            <img class="logo" src="${chrome.runtime.getURL('images/icon-32.png')}" style="width: 16px; height: 16px;">
            <span style="font-size: 13px; font-weight: 600; color: #555;">Translation</span>
        </div>
        <div style="display: flex; gap: 10px; align-items: center; justify-content: center; height: 16px;">
            <button class="copy-button" title="Copy to clipboard" style="border: none; background: transparent; cursor: pointer; color: #777; display: flex; align-items: center; justify-content: center; padding: 0; margin: 0; transition: color 0.2s; height: 16px; width: 16px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
            <button class="close-button" title="Close" style="border: none; background: transparent; font-size: 18px !important; line-height: 16px; font-family: Arial, sans-serif; cursor: pointer; color: #999; padding: 0; margin: 0; display: flex; align-items: center; justify-content: center; transition: color 0.2s; height: 16px; width: 16px;">×</button>
        </div>
    </div>
    <div class="translate-panel-content" style="padding: 12px 15px; margin: 0; text-align: justify; font-size: 14px; line-height: 1.5; color: #333; max-height: 300px; overflow-y: auto;">
        ${translation.replace(/\n/g, '<br>')}
    </div>
    `;

    panel.innerHTML = innerHTMLContent;
    
    // Base styles with animation
    Object.assign(panel.style, {
        position: 'absolute', // Scrolls naturally with the page
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        width: 'auto',
        minWidth: '280px',
        maxWidth: '450px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        borderRadius: '10px',
        zIndex: '2147483647',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        opacity: '0',
        transform: 'translateY(5px)',
        transition: 'opacity 0.2s ease, transform 0.2s ease'
    });

    document.body.appendChild(panel);

    // Calculate smart positioning to prevent overflow
    const panelRect = panel.getBoundingClientRect(); // Get rendered width/height
    let top = absoluteRect.bottom + 8;
    let left = absoluteRect.left;

    // Viewport boundaries check
    const maxLeft = window.innerWidth + window.scrollX - panelRect.width - 16;
    if (left > maxLeft) left = maxLeft;
    if (left < window.scrollX + 16) left = window.scrollX + 16;

    const maxTop = window.innerHeight + window.scrollY - panelRect.height - 16;
    if (top > maxTop) {
        // If it goes below the visible screen, render it ABOVE the selected text
        top = absoluteRect.top - panelRect.height - 8;
    }

    panel.style.top = top + 'px';
    panel.style.left = left + 'px';

    // Trigger smooth fade-in
    requestAnimationFrame(() => {
        panel.style.opacity = '1';
        panel.style.transform = 'translateY(0)';
    });
    
    // Copy Button Logic
    const copyButton = panel.querySelector('.copy-button');
    if (copyButton) {
        copyButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                await navigator.clipboard.writeText(translation);
                // Show success checkmark
                copyButton.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#28a745" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                copyButton.style.color = '#28a745';
                setTimeout(() => {
                    // Revert back to copy icon
                    copyButton.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
                    copyButton.style.color = '#777';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy', err);
            }
        });
    }

    // Bind Close Button
    const closeButton = panel.querySelector('.close-button');
    if (closeButton) {
        closeButton.addEventListener('mouseover', () => closeButton.style.color = '#ff4444');
        closeButton.addEventListener('mouseout', () => closeButton.style.color = '#999');
        closeButton.addEventListener('click', function (event) {
            panel.remove();
            window.getSelection().removeAllRanges();
        });
    }

    // Prevent clicks inside the panel from propagating and triggering the outside-click closer
    panel.addEventListener('click', function(event) {
        event.stopPropagation();
    });
}
