const moment = require('moment');

const Storage = require('../storage');
const Poster = require('../poster');

let seriesList = [];
let pageBody, openPage;

const createBar = () => {
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

    const sortGroup = document.createElement('div');
    sortGroup.setAttribute('class', 'btn-group pull-right');
    const createSortBtn = (name, icon, filterFn) => {
        const sortBtn = document.createElement('button');
        sortBtn.setAttribute('class', 'btn btn-sm btn-default');
        sortBtn.setAttribute('title', name);
        sortBtn.addEventListener('click', () => createList(filterFn));
        const sortIcon = document.createElement('span');
        sortIcon.setAttribute('class', 'glyphicon ' + icon);
        sortBtn.appendChild(sortIcon);
        sortGroup.appendChild(sortBtn);
    };
    createSortBtn('All', 'unchecked', null);
    createSortBtn('Monitored', 'bookmark', show => show.monitored);
    createSortBtn('Continuing', 'play', show => show.status == 'continuing');
    createSortBtn('Ended', 'stop', show => show.status == 'ended');
    createSortBtn('Missing', 'warning-sign', show => show.episodeFileCount < show.totalEpisodeCount);

    pageBody.appendChild(bar);
};

const createList = (filterFn = null) => {
    let series = seriesList;
    // Sort the series by next airing
    for(let s in series) {
        if(typeof series[s].nextAiring == 'undefined') {
            delete series[s];
        }
    }
    series = series.sort((a, b) => moment(a.nextAiring).diff(moment(b.nextAiring)));

    // If we are using a filter
    if(filterFn != null) {
        for(var s in series) {
            if(!filterFn(series[s])) {
                delete series[s];
            }
        }
    }

    // Create the list of series
    let posters = document.querySelector('.sonarr-posters');
    if(posters != null) {
        while(posters.hasChildNodes()) {
            posters.removeChild(posters.lastChild);
        }
    } else {
        posters = document.createElement('div');
        posters.classList.add('sonarr-posters');
        pageBody.appendChild(posters);
    }

    for(let s in series) {
        const poster = Poster.createSeries(series[s], () => openPage('seriesDetail', series[s]));
        posters.appendChild(poster);
    }
}

module.exports = (series, body, open) => {
    seriesList = series;
    pageBody = body;
    openPage = open;

    createBar();
    createList();
};
