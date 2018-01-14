const request = require('superagent');
const urljoin = require('url-join');

const Storage = require('./storage');

const API = {
    series: () => API.get('series'),
    seriesLookup: ({ term }) => API.get('series/lookup', { term }),
    seriesAdd: (params) => API.post('series', params),
    seriesEpisodes: ({ seriesId }) => API.get('episode', { seriesId }),
    status: () => API.get('system/status'),
    calendar: ({ start, end }) => API.get('calendar', { start, end }),
    queue: () => API.get('queue'),
    profile: () => API.get('profile'),
    rootfolder: () => API.get('rootfolder'),
    commandRun: ({ name }) => {
        return new Promise(resolve => {
            const checkCommand = (id) => {
                API.get('command/' + id)
                    .then((res) => {
                        if(res.body.state != 'completed') {
                            window.setTimeout(() => checkCommand(id), 1000);
                        } else {
                            resolve();
                        }
                    });
            };

            API.post('command', { name })
                .then(res => {
                    window.setTimeout(() => checkCommand(res.body.id), 1000);
                });
        });
    },
    get: (endpoint, params = {}) => {
        const options = Storage.get();

        return request.get(urljoin(options.api.base, 'api', endpoint))
            .set('X-Api-Key', options.api.key)
            .query(params);
    },
    post: (endpoint, params = {}) => {
        const options = Storage.get();

        return request.post(urljoin(options.api.base, 'api', endpoint))
            .set('X-Api-Key', options.api.key)
            .send(params);
    }
};

module.exports = API;
