chrome.runtime.onInstalled.addListener(function() {
    console.log('UX/UI Toolkit Pro installed');
});
// In background.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'exportPDF') {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'getDesignSystem'}, function(response) {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                } else if (response && response.designSystem) {
                    // Here you would typically use a library like jsPDF to generate the PDF
                    // For this example, we'll just download the HTML as a file
                    const blob = new Blob([response.designSystem], {type: 'text/html'});
                    const url = URL.createObjectURL(blob);
                    chrome.downloads.download({
                        url: url,
                        filename: 'design_system.html'
                    });
                }
            });
        });
    }
});

// In content.js, add this message listener
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'getDesignSystem') {
        sendResponse({designSystem: documentDesignSystem()});
    }
    return true;
});

