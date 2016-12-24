const moment = require('moment');

const API = require('./api');
const Storage = require('./storage');
const Poster = require('./poster');

const pages = {
    series: require('./pages/series'),
    seriesDetail: require('./pages/seriesDetail'),
    addSeries: require('./pages/addSeries'),
    activity: require('./pages/activity')
};

const Page = {
    created: false,
    body: null,
    toggle: () => {
        const content = document.querySelector('#content');
        if(content.querySelector('.container.sonarr') != null) {
            Page.close();
        } else {
            Page.open();
        }
    },
    open: (openHomepage = true, callback) => {
        window.setTimeout(() => {
            document.querySelector('.activity-btn').click();
            const content = document.querySelector('#content');
            while(content.hasChildNodes()) {
                content.removeChild(content.lastChild);
            }

            const page = document.createElement('div');
            page.classList.add('container');
            page.classList.add('sonarr');

            const list = document.createElement('ul');
            list.setAttribute('class', 'nav nav-header pull-right');

            const createTab = (list, text, clickedFn) => {
                const item = document.createElement('li');
                
                const link = document.createElement('a');
                link.setAttribute('class', 'btn-gray');
                link.setAttribute('href', '#');
                link.textContent = text;
                link.addEventListener('click', e => {
                    e.preventDefault();
                    const links = e.target.parentNode.parentNode.querySelectorAll('li > a');
                    [].forEach.call(links, link => {
                        link.classList.remove('selected');
                    });
                    e.target.classList.add('selected');

                    clickedFn();
                });
                item.appendChild(link);

                list.appendChild(item);
            };
            createTab(list, 'Series', () => Page.openPage('series'));
            createTab(list, 'Activity', () => Page.openPage('activity'));
            createTab(list, 'Settings', () => chrome.runtime.sendMessage({ options: true }));
            page.appendChild(list);

            const heading = document.createElement('h2');
            heading.textContent = 'Sonarr';
            page.appendChild(heading);

            Page.body = document.createElement('div');
            Page.body.classList.add('sonarr-content');
            page.appendChild(Page.body);

            content.appendChild(page);

            Page.created = true;
            if(openHomepage) {
                Page.openPage('series');
            }

            if(typeof callback == 'function') {
                callback();
            }
        }, 100);
    },
    close: () => {
        document.querySelector('.activity-btn').click();
        window.setTimeout(() => {
            document.querySelector('.home-btn').click();
        }, 100);
    },
    empty: () => {
        while(Page.body.hasChildNodes()) {
            Page.body.removeChild(Page.body.lastChild);
        }
        const background = document.querySelector('#content .sonarr-background');
        if(background) {
            background.remove();
        }
    },
    selectTab: (text) => {
        Page.empty();

        const list = document.querySelector('#content .nav');
        const links = list.querySelectorAll('li > a');
        [].forEach.call(links, link => {
            link.classList.remove('selected');
            if(link.textContent == text) {
                link.classList.add('selected');
            }
        });
    },
    openPage: (page, data = {}) => {
        const loadPage = () => {
            Page.selectTab(page.charAt(0).toUpperCase() + page.slice(1));

            if(typeof Storage.collections[page] != 'undefined' && Storage.collections[page] == null) {
                chrome.runtime.sendMessage({ endpoint: page }, resp => {
                    if(!resp.err) {
                        pages[page](data, Page.body, Page.openPage);
                        Storage.collections[page] = resp.res.body;
                    } else {
                        const warning = document.createElement('p');
                        warning.classList.add('sonarr-alert');
                        warning.innerHTML = '<i class="sonarr-warn glyphicon circle-exclamation-mark"></i> Can\'t connect to Sonarr. Please check API settings.';
                        Page.body.appendChild(warning);
                    }
                });
            } else if(typeof Storage.collections[page] != 'undefined') {
                pages[page](Storage.collections[page], Page.body, Page.openPage);
            } else {
                pages[page](data, Page.body, Page.openPage);
            }
        };

        if(Page.created == false) {
            Page.open(false, () => {
                loadPage();
            });
        } else {
            loadPage();
        }
    }
};

module.exports = Page;
