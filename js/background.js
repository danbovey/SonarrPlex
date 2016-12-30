const API = require('./api');
const Storage = require('./storage');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.options) {
        return chrome.tabs.create({ 'url': 'chrome://extensions/?options=' + chrome.runtime.id });
    }

    Storage.load()
        .then(() => {
            API[request.endpoint](request.params || {})
                .then(res => {
                    sendResponse({ res });
                })
                .catch(err => {
                    sendResponse({ err });
                });
        });

    return true;
});

// Open options page on first install
chrome.runtime.onInstalled.addListener(details => {
    if(details.reason == 'install') {
        chrome.tabs.create({ 'url': 'chrome://extensions/?options=' + chrome.runtime.id });
    }
});
