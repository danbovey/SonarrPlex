const Navbar = {
    create: (pageToggle) => {
        const navbar = document.querySelector('.nav-bar-right');
        const existingBtn = navbar.querySelector('.activity-btn').parentNode;
        const btn = existingBtn.cloneNode(true);
        btn.classList.remove('active');

        const link = btn.querySelector('a');
        link.setAttribute('class', 'sonarr-btn');
        link.setAttribute('href', '#');
        link.setAttribute('title', 'Sonarr');

        const icon = link.querySelector('i');
        const svg = document.createElement('img');
        svg.setAttribute('src', chrome.extension.getURL('img/Sonarr.svg'));
        svg.setAttribute('width', 24);
        link.replaceChild(svg, icon);

        link.addEventListener('click', e => {
            e.preventDefault();
            pageToggle();
        });

        navbar.insertBefore(btn, existingBtn);

        const number = link.querySelector('.badge');
        number.classList.add('hidden');

        // Check the status of Sonarr
        chrome.runtime.sendMessage({ endpoint: 'queue' }, resp => {
            if(!resp.err) {
                number.textContent = resp.res.length;
                number.classList.remove('hidden');
            } else {
                if(resp.err) {
                    Navbar.warn();
                }
            }
        });
    },
    warn: () => {
        const navbar = document.querySelector('.nav-bar-right');
        const btn = navbar.querySelector('.sonarr-btn');

        const warning = document.createElement('i');
        warning.classList.add('sonarr-warn');
        warning.classList.add('glyphicon');
        warning.classList.add('circle-exclamation-mark');
        btn.appendChild(warning);
    },
    removeWarn: () => {
        const navbar = document.querySelector('.nav-bar-right');
        const btn = navbar.querySelector('.sonarr-btn');
        btn.querySelector('.sonarr-warn').remove();
    }
};

module.exports = Navbar;
