const API = require('./api');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(sender.tab ?
        "from a content script:" + sender.tab.url :
        "from the extension");

    if(request.options) {
        return chrome.tabs.create({ 'url': 'chrome://extensions/?options=' + chrome.runtime.id });
    }

    API[request.endpoint](request.params || {})
        .then(res => {
            sendResponse({ res });
        })
        .catch(err => {
            sendResponse({ err });
        });

    return true;
});

// Open options page on first install
chrome.runtime.onInstalled.addListener(details => {
    if(details.reason == 'install') {
        chrome.tabs.create({ 'url': 'chrome://extensions/?options=' + chrome.runtime.id });
    }
});
