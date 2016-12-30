const Storage = require('./storage');
const Navbar = require('./navbar');
const Page = require('./page');

const injectShow = require('./injections/show');
injectShow(Page.openPage);

const wait = () => {
    window.setTimeout(() => {
        if(document.querySelector('.nav-bar-right') != null) {
            var ob = new MutationObserver(e => {
                if(e[0].removedNodes) {
                    window.setTimeout(init, 500);
                }
            });
            ob.observe(document.querySelector('.nav-bar-right'), { childList: true });

            window.setTimeout(init, 500);
        } else {
            wait();
        }
    }, 200);
};

wait();

const init = () => {
    Storage.load()
        .then(() => {
            Navbar.create(Page.toggle);
        });
};
