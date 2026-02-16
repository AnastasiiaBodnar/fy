export class Fetcher {
    constructor() {
        const isMobile = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
        this.isDev = !isMobile;
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

export class UrlBuilder {
    static build(query = '', city = 'khmelnytskyi') {
        const citySlug = city.toLowerCase();
        if (!query) {
            return `https://www.work.ua/jobs-${citySlug}/`;
        }
        const querySlug = query.toLowerCase().replace(/\s+/g, '+');
        return `https://www.work.ua/jobs-${citySlug}-${querySlug}/`;
    }
}