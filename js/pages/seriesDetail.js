const moment = require('moment');
const path = require('path');

const Storage = require('../storage');
const Poster = require('../poster');

const createSeasonList = (season, pageBody) => {
    const list = document.createElement('div');
    list.classList.add('sonarr-season-list');
    const heading = document.createElement('h2');
    if(season[0] != 0) {
        heading.textContent = 'Season ' + season[0];
    } else {
        heading.textContent = 'Specials';
    }
    list.appendChild(heading);

    const table = document.createElement('table');
    table.classList.add('sonarr-table');
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th></th><th>#</th><th>Title</th><th>Air Date</th><th>Status</th><th></th>';
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    for(var e in season[1]) {
        const episode = season[1][e];
        const row = document.createElement('tr');
        
        const monitorBtn = document.createElement('button');
        monitorBtn.setAttribute('class', 'btn btn-sm btn-default');
        monitorBtn.innerHTML = '<span class="glyphicon bookmark"></span>';
        monitorBtn.addEventListener('click', () => {
            console.log('toggle monitoring of episode ' + episode.id);
        });
        createCell(row, monitorBtn);
        createCell(row, episode.episodeNumber);
        createCell(row, episode.title);
        createCell(row, moment(episode.airDate).fromNow());
        const icon = document.createElement('span');
        icon.classList.add('glyphicon');
        createCell(row, icon);

        const searchBtn = document.createElement('button');
        searchBtn.setAttribute('class', 'btn btn-sm btn-default');
        searchBtn.innerHTML = '<span class="glyphicon search"></span>';
        searchBtn.addEventListener('click', () => {
            console.log('search for episode ' + episode.id);
        });
        createCell(row, searchBtn);
        tbody.appendChild(row);
    }
    table.appendChild(tbody);
    list.appendChild(table);

    pageBody.appendChild(list);
};

const createCell = (row, node) => {
    const cell = document.createElement('td');
    if(node.nodeType) {
        cell.appendChild(node);
    } else {
        cell.textContent = node;
    }
    row.appendChild(cell);
};

module.exports = (series, pageBody, openPage) => {
    chrome.runtime.sendMessage({ endpoint: 'seriesEpisodes', params: { seriesId: series.id } }, resp => {
        if(!resp.err) {
            const bg = document.createElement('div');
            bg.classList.add('sonarr-background');
            const url = path.join(Storage.get().api.base, series.images[0] ? series.images[0].url : '');
            bg.style.backgroundImage = 'url(' + url + ')';
            document.querySelector('#content').appendChild(bg);

            const show = document.createElement('div');
            show.classList.add('sonarr-show');
            show.appendChild(Poster.createSeries(series, null, false));
            const heading = document.createElement('h2');
            heading.textContent = series.title;
            show.appendChild(heading);
            pageBody.appendChild(show);

            let seasons = [];
            const seasonsArray = [];

            for(let e in resp.res.body) {
                const episode = resp.res.body[e];
                if(!seasons[episode.seasonNumber]) {
                    seasons[episode.seasonNumber] = [];
                }
                seasons[episode.seasonNumber].push(episode);
            }
            for(let n in seasons) {
                seasonsArray.push([n, seasons[n]]);
            }
            seasonsArray.sort((a, b) => a[0] < b[0]);
            for(let n in seasonsArray) {
                createSeasonList(seasonsArray[n], pageBody);
            }
        } else {
            // TODO: warn
        }
    });
};
