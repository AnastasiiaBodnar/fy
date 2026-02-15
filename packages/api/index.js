export class Fetcher {
    constructor() {
        this.isDev = true;
    }

    getProxyUrl(targetUrl) {
        if (this.isDev) {
            const path = targetUrl.replace('https://www.work.ua', '');
            return `/api${path}`;
        }
        return targetUrl;
    }

    async fetch(url) {
        try {
            const fetchUrl = this.getProxyUrl(url);
            console.log('Fetching URL:', fetchUrl);

            const response = await fetch(fetchUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.text();
            return data;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    async fetchHTML(url) {
        return await this.fetch(url);
    }
}