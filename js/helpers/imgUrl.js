const urljoin = require('url-join');

module.exports = (imgUrl, options) => {
    if(imgUrl.indexOf('http') == -1) {
        // Remove the URL Base from the relative URL and replace any double slashes
        if(options.api.sonarr_base) {
            imgUrl = imgUrl.replace(options.api.sonarr_base, '')
                .replace(/([^:]\/)\/+/g, '/');
        }

        imgUrl = urljoin(options.api.base, imgUrl);
    }

    return imgUrl;
};
