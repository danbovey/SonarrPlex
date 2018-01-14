const moment = require('moment');
const urljoin = require('url-join');

const Storage = require('./storage');
const Page = require('./page');
const imgUrl = require('./helpers/imgUrl');

const Poster = {
    createEpisode: (episode) => {
        const poster = document.createElement('div');
        poster.classList.add('sonarr-poster');

        const posterCard = Poster.createCard(episode.series);
        poster.appendChild(posterCard);

        const title = document.createElement('div');
        title.classList.add('sonarr-title');
        const series = document.createElement('a');
        series.setAttribute('href', '#');
        series.textContent = episode.series.title;
        title.appendChild(series);
        const episodeName = document.createElement('a');
        episodeName.classList.add('secondary');
        episodeName.setAttribute('href', '#');
        episodeName.textContent = episode.title;
        title.appendChild(episodeName);
        const metadata = document.createElement('div');
        metadata.classList.add('secondary');
        metadata.innerHTML = 'S' + episode.seasonNumber + '<span class="sonarr-season-separator">·</span>' + 'E' + episode.episodeNumber;
        title.appendChild(metadata);

        poster.appendChild(title);

        return poster;
    },
    createSeries: (series, clickFn, text = true) => {
        const poster = document.createElement('div');
        poster.classList.add('sonarr-poster');

        const posterCard = Poster.createCard(series, clickFn);
        poster.appendChild(posterCard);

        if(text) {
            // TODO: Generalize text captions
            const title = document.createElement('div');
            title.classList.add('sonarr-title');
            const srs = document.createElement('a');
            if(typeof clickFn == 'function') {
                srs.addEventListener('click', clickFn);
            }
            srs.setAttribute('href', '#');
            srs.textContent = series.title;
            title.appendChild(srs);
            if(series.nextAiring) {
                const nextAiring = document.createElement('div');
                nextAiring.classList.add('secondary');
                nextAiring.textContent = moment(series.nextAiring).fromNow();
                nextAiring.setAttribute('title', moment(series.nextAiring).toString());
                title.appendChild(nextAiring);
            }

            poster.appendChild(title);
        }

        return poster;
    },
    createCard: (series, clickFn) => {
        const posterCard = document.createElement('div');
        posterCard.classList.add('sonarr-postercard');
        if(typeof clickFn == 'function') {
            posterCard.addEventListener('click', clickFn);
        } else {
            posterCard.classList.add('postercard-noclick');
        }

        const cover = document.createElement('div');
        cover.classList.add('sonarr-cover');
        const coverImage = document.createElement('div');
        coverImage.classList.add('sonarr-cover-image');

        const options = Storage.get();
        for(let i in series.images) {
            if(series.images[i].coverType == 'poster') {
                let posterUrl = imgUrl(series.images[i].url, options);
                // If it's a Sonarr URL, request a smaller-sized poster
                if(posterUrl.indexOf(options.api.base) > -1) {
                    posterUrl.replace('.jpg', '-250.jpg');
                }
                coverImage.style.backgroundImage = 'url(' + posterUrl + ')';
            }
        }

        cover.appendChild(coverImage);
        posterCard.appendChild(cover);

        return posterCard;
    }
};

module.exports = Poster;
