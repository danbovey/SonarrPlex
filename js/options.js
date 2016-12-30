const Storage = require('./storage');

Storage.load()
    .then(options => {
        const submit = document.querySelector('#save');
        const status = document.querySelector('#status');
        const inputs = {
            base: document.querySelector('#base'),
            sonarr_base: document.querySelector('#sonarr_base'),
            key: document.querySelector('#key'),
            poll: document.querySelector('#poll')
        };

        for(let name in inputs) {
            if(typeof options.api[name] != 'undefined') {
                inputs[name].value = options.api[name];
            }
        }

        const plexUrlList = document.querySelector('#plex-url-list');
        const plexUrls = {
            list: options.plexUrls,
            add: (url) => {
                plexUrls.list.push(url);
                plexUrls.update();
            },
            remove: (url) => {
                const index = plexUrls.list.indexOf(url);
                if(index > -1) {
                    plexUrls.list.splice(index, 1);
                }
                plexUrls.update();
            },
            update: () => {
                while(plexUrlList.hasChildNodes()) {
                    plexUrlList.removeChild(plexUrlList.lastChild);
                }
                for(let u in plexUrls.list) {
                    const item = document.createElement('li');
                    item.textContent = options.plexUrls[u];
                    const removeBtn = document.createElement('button');
                    removeBtn.textContent = 'x';
                    removeBtn.addEventListener('click', plexUrls.remove.bind(null, plexUrls.list[u]));
                    item.appendChild(removeBtn);
                    plexUrlList.appendChild(item);
                }
            }
        };
        plexUrls.update();

        const newPlexUrl = document.querySelector('#new-plex-url');
        const plexUrlBtn = document.querySelector('#add-plex-url');
        plexUrlBtn.addEventListener('click', () => {
            plexUrls.add(newPlexUrl.value);
            newPlexUrl.value = '';
        });

        submit.addEventListener('click', e => {
            for(let name in inputs) {
                options.api[name] = inputs[name].value;
            }
            Storage.save(options)
                .then(() => {
                    status.textContent = 'Options saved.';

                    window.setTimeout(() => {
                        tick.remove();
                    }, 1000);
                });
        });
        document.body.appendChild(submit);
    });
