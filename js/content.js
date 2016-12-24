const Storage = require('./storage');
const Navbar = require('./navbar');
const Page = require('./page');

const injectShow = require('./injections/show');
injectShow(Page.openPage);

const wait = () => {
    window.setTimeout(() => {
        if(document.querySelector('.nav-bar-right') != null) {
            window.setTimeout(init, 200);
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
