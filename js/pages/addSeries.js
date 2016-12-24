const Poster = require('../poster');

module.exports = (data, pageBody, openPage) => {
    let profiles = [];
    let folders = [];

    chrome.runtime.sendMessage({ endpoint: 'profile' }, resp => {
        if(!resp.err) {
            profiles = resp.res.body;
        } else {
            // TODO: Warn
        }
    });
    chrome.runtime.sendMessage({ endpoint: 'rootfolder' }, resp => {
        if(!resp.err) {
            folders = resp.res.body;
        } else {
            // TODO: Warn
        }
    });

    const bar = document.createElement('div');
    bar.classList.add('filter-bar');
    const backBtn = document.createElement('button');
    backBtn.setAttribute('class', 'btn btn-sm btn-default');
    backBtn.innerHTML = '<span class="glyphicon chevron-left"></span> Back';
    backBtn.addEventListener('click', () => openPage('series'));
    bar.appendChild(backBtn);
    pageBody.appendChild(bar);

    const results = document.createElement('div');
    results.classList.add('sonarr-add-series-results');

    const termInput = document.createElement('input');
    termInput.setAttribute('type', 'text');
    termInput.setAttribute('placeholder', 'Start typing the name of series you want to add ...');
    termInput.setAttribute('class', 'form-control sonarr-series-add-input');
    termInput.addEventListener('keyup', e => {
        if(e.keyCode == 13) {
            const params = {
                term: e.target.value
            };
            while(results.hasChildNodes()) {
                results.removeChild(results.lastChild);
            }
            chrome.runtime.sendMessage({ endpoint: 'seriesLookup', params }, resp => {
                if(!resp.err) {
                    for(var s in resp.res.body) {
                        const series = resp.res.body[s];
                        const show = document.createElement('div');
                        show.classList.add('sonarr-show');
                        show.appendChild(Poster.createSeries(series, () => openPage('seriesDetail', series), false));

                        const title = document.createElement('h2');
                        const statusLabel = series.status == 'continuing' ? 'info' : 'danger';
                        title.innerHTML = series.title + ' <span class="year">(' + series.year + ')</span> <span class="label label-default">' + series.network + '</span><span class="label label-' + statusLabel + '">' + series.status + '</span>';
                        show.appendChild(title);

                        const overview = document.createElement('p');
                        overview.textContent = series.overview.slice(0, 300) + '...';
                        show.appendChild(overview);

                        const folderGroup = document.createElement('div');
                        folderGroup.classList.add('input');
                        show.appendChild(folderGroup);
                        const folderLabel = document.createElement('label');
                        folderLabel.textContent = 'Path';
                        folderGroup.appendChild(folderLabel);
                        const folderSelect = document.createElement('select');
                        for(var f in folders) {
                            const option = document.createElement('option');
                            option.setAttribute('value', folders[f].path);
                            option.textContent = folders[f].path;
                            folderSelect.appendChild(option);
                        }
                        folderGroup.appendChild(folderSelect);

                        const profileGroup = document.createElement('div');
                        profileGroup.classList.add('input');
                        show.appendChild(profileGroup);
                        const profileLabel = document.createElement('label');
                        profileLabel.textContent = 'Profile';
                        profileGroup.appendChild(profileLabel);
                        const profileSelect = document.createElement('select');
                        for(var p in profiles) {
                            const option = document.createElement('option');
                            option.setAttribute('value', profiles[p].id);
                            option.textContent = profiles[p].name;
                            profileSelect.appendChild(option);
                        }
                        profileGroup.appendChild(profileSelect);

                        const addBtn = document.createElement('button');
                        addBtn.setAttribute('class', 'btn btn-lg btn-success pull-right');
                        addBtn.innerHTML = '<span class="glyphicon plus"></span>';
                        addBtn.addEventListener('click', () => {
                            const params = {
                                tvdbId: series.tvdbId,
                                title: series.title,
                                qualityProfileId: profileSelect.value,
                                titleSlug: series.titleSlug,
                                images: [],
                                seasons: series.seasons,
                                rootFolderPath: folderSelect.value,
                                tvRageId: series.tvRageId,
                                seasonFolder: true,
                                monitored: true,
                                addOptions: {}
                            };
                            chrome.runtime.sendMessage({ endpoint: 'seriesAdd', params }, resp => {
                                if(!resp.err) {
                                    Storage.collections.series = null;
                                    openPage('series');
                                } else {
                                    // TODO: Warn
                                }
                            });
                        });
                        show.appendChild(addBtn);

                        results.appendChild(show);
                    }
                } else {
                    // TODO: Replace this with alert maker
                    const warning = document.createElement('p');
                    warning.classList.add('sonarr-alert');
                    warning.innerHTML = '<i class="sonarr-warn glyphicon circle-exclamation-mark"></i> Can\'t connect to Sonarr. Please check API settings.';
                    pageBody.appendChild(warning);
                }
            });
        }
    });
    pageBody.appendChild(termInput);
    pageBody.appendChild(results);
    termInput.focus();
};
