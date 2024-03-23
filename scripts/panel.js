let panel; 

function showTranslation(translation, rect) {
    // console.log('showTranslation called with translation:', translation);
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
    panel.style.overflowWrap = 'break-word';
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
