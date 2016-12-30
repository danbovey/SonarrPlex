const API = require('./api');
const Storage = require('./storage');

// Inject the content script into all User Plex URLs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    Storage.load()
        .then(options => {
            const isInUserList = (url) => {
                for(let u in options.plexUrls) {
                    if(url.indexOf(options.plexUrls[u]) > -1) {
                        return true;
                    }
                }

                return false;
            };

            if(changeInfo.status == 'complete' && isInUserList(tab.url)) {
                chrome.tabs.insertCSS(tabId, { file: 'css/style.css' })
                chrome.tabs.executeScript(tabId, { file: 'js/content.js' });
            }
        });
});

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
