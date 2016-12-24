module.exports = (data, pageBody) => {
    chrome.runtime.sendMessage({ endpoint: 'queue' }, resp => {
        if(!resp.err) {
            const table = document.createElement('table');
            table.classList.add('sonarr-table');
            const thead = document.createElement('thead');
            thead.innerHTML = '<tr><th>Series</th><th>Episode</th><th>Episode Title</th><th>Quality</th><th style="text-align:center">Protocol</th><th class="text-center">Time left</th><th>Progress</th>';
            table.appendChild(thead);
            const tbody = document.createElement('tbody');
            for(var d in resp.res.body) {
                const download = resp.res.body[d];
                const progress = (100 - (download.sizeleft / download.size * 100)).toFixed(1);

                const row = document.createElement('tr');
                row.innerHTML = '<td>' + download.series.title + '</td>' +
                    '<td>' + download.episode.seasonNumber + 'x' + download.episode.episodeNumber + '</td>' +
                    '<td>' + download.episode.title + '</td>' +
                    '<td><span class="label label-default">' + download.quality.quality.name + '</span></td>' +
                    '<td class="text-center"><span class="badge badge-success protocol-' + download.protocol + '">' + download.protocol + '</span></td>' +
                    '<td class="text-center">' + (typeof download.timeleft != 'undefined' ? download.timeleft : '-') + '</td>' +
                    '<td><div class="progress" title="' + progress + '%">' +
                        '<div class="progress-bar" role="progressbar" style="width: ' + progress +'%;"></div>' +
                    '</div></td>';
                tbody.appendChild(row);
            }
            table.appendChild(tbody);

            pageBody.appendChild(table);
        } else {
            const warning = document.createElement('p');
            warning.classList.add('sonarr-alert');
            warning.innerHTML = '<i class="sonarr-warn glyphicon circle-exclamation-mark"></i> Can\'t connect to Sonarr. Please check API settings.';
            pageBody.appendChild(warning);
        }
    });
};
