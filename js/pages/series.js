const moment = require('moment');

const Storage = require('../storage');
const Poster = require('../poster');

const listSeries = (series, pageBody, openPage) => {
    const bar = document.createElement('div');
    bar.classList.add('filter-bar');
    const addBtn = document.createElement('button');
    addBtn.setAttribute('class', 'btn btn-sm btn-default');
    addBtn.innerHTML = '<span class="glyphicon plus"></span> Add Series';
    addBtn.addEventListener('click', () => openPage('addSeries'));
    bar.appendChild(addBtn);

    const syncBtn = document.createElement('button');
    syncBtn.setAttribute('class', 'btn btn-sm btn-default');
    const syncContent = '<span class="glyphicon signal"></span> RSS Sync';
    syncBtn.innerHTML = syncContent;
    syncBtn.addEventListener('click', () => {
        syncBtn.innerHTML = '<div class="loading"></div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; RSS Sync';
        chrome.runtime.sendMessage({ endpoint: 'commandRun', params: { name: 'RssSync' } }, resp => {
            syncBtn.innerHTML = syncContent;
        });
    });
    bar.appendChild(syncBtn);

    const updateBtn = document.createElement('button');
    updateBtn.setAttribute('class', 'btn btn-sm btn-default');
    const updateContent = '<span class="glyphicon refresh"></span> Update Library';
    updateBtn.innerHTML = updateContent;
    updateBtn.addEventListener('click', () => {
        updateBtn.innerHTML = '<div class="loading"></div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Update Library';
        chrome.runtime.sendMessage({ endpoint: 'commandRun', params: { name: 'RefreshSeries' } }, resp => {
            updateBtn.innerHTML = updateContent;
        });
    });
    bar.appendChild(updateBtn);

    pageBody.appendChild(bar);

    const posters = document.createElement('div');
    posters.classList.add('sonarr-posters');

    // Sort the series by next airing
    for(let s in series) {
        if(typeof series[s].nextAiring == 'undefined') {
            delete series[s];
        }
    }
    series = series.sort((a, b) => moment(a.nextAiring).diff(moment(b.nextAiring)));

    for(let s in series) {
        const poster = Poster.createSeries(series[s], () => openPage('seriesDetail', series[s]));
        posters.appendChild(poster);
    }

    pageBody.appendChild(posters);
}

module.exports = (series, pageBody, openPage) => {
    if(typeof Storage.collections.series == 'undefined' || Storage.collections.series == null) {
        chrome.runtime.sendMessage({ endpoint: 'series' }, resp => {
            if(!resp.err) {
                listSeries(resp.res.body, pageBody, openPage);
                Storage.collections.series = resp.res.body;
            } else {
                const warning = document.createElement('p');
                warning.classList.add('sonarr-alert');
                warning.innerHTML = '<i class="sonarr-warn glyphicon circle-exclamation-mark"></i> Can\'t connect to Sonarr. Please check API settings.';
                pageBody.appendChild(warning);
            }
        });
    } else {
        listSeries(series, pageBody, openPage);
    }
};
