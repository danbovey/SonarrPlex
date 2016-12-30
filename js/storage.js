let options = {
    api: {
        key: '',
        base: 'http://localhost:8989',
        sonarr_base: '',
        poll: 60
    },
    plexUrls: []
};

const Storage = {
    load: () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get(null, (items) => {
                Object.assign(options, items);
                resolve(options);
            });
        });
    },
    save: (opts) => {
        return new Promise((resolve) => {
            chrome.storage.sync.set(opts, () => {
                options = opts;
                resolve();
            });
        });
    },
    get: () => {
        return options;
    },
    collections: {
        series: null
    }
};

module.exports = Storage;
