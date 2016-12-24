const Storage = require('./storage');

Storage.load()
    .then(options => {
        const submit = document.querySelector('#save');
        const status = document.querySelector('#status');
        const inputs = {
            base: document.querySelector('#base'),
            key: document.querySelector('#key'),
            poll: document.querySelector('#poll')
        };

        for(let name in inputs) {
            inputs[name].value = options.api[name];
        }

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
