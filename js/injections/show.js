const moment = require('moment');

const Page = require('../page');

module.exports = (openPage) => {
    const checkPage = () => {
        const check = () => {
            // Detect whether we are on a show homepage
            if(content.querySelector('.show-details-row') != null) {
                window.setTimeout(wait, 200);
            } else if(checkCount < 5) {
                checkCount++;
                window.setTimeout(check, 500);
            } else {
                // Check when any URL is changed
                window.addEventListener('hashchange', checkPage);
            }
        };
        const wait = () => {
            if(content.querySelector('.studio-flag-container') == null) {
                window.setTimeout(wait, 200);
            } else {
                inject();
            }
        };

        const content = document.querySelector('#content');
        let checkCount = 0;
        window.setTimeout(check, 500);
    };
    // Check a second after page load
    window.setTimeout(checkPage, 500);

    const inject = () => {
        const content = document.querySelector('#content');
        const showName = content.querySelector('.show-details-row .item-title').textContent;
        chrome.runtime.sendMessage({ endpoint: 'series' }, resp => {
            if(!resp.err) {
                let series = null;
                for(var s in resp.res.body) {
                    if(resp.res.body[s].title == showName) {
                        series = resp.res.body[s];
                    }
                }

                if(series != null) {
                    // Insert show status next to studio flag
                    const studio = content.querySelector('.studio-flag-container');

                    const showStatus = document.createElement('div');
                    showStatus.classList.add('sonarr-show-status');
                    let status = 'default';
                    switch(series.status) {
                        case 'ended':
                            status = 'danger';
                            break;
                        case 'continuing':
                            status = 'info';
                            break;
                    }
                    let html = '<span class="label label-' + status + '">' + series.status + '</span>';
                    if(series.nextAiring) {
                        html += ' Next airing ' + moment(series.nextAiring).fromNow();
                    }
                    showStatus.innerHTML = html;

                    studio.insertBefore(showStatus, studio.querySelector('.studio-flag'));

                    const metadata = content.querySelector('.show-details-metadata-container');
                    const manage = document.createElement('div');
                    const link = document.createElement('a');
                    link.setAttribute('href', '#');
                    link.textContent = 'Manage on Sonarr';
                    link.addEventListener('click', e => {
                        e.preventDefault();
                        openPage('seriesDetail', series);
                    });
                    manage.appendChild(link);
                    metadata.appendChild(manage);
                }
            }
        });
    };
};
