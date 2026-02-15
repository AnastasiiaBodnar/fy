export class Fetcher {
    constructor(config = {}) {
        this.isDev = true;
        this.strategy = config.strategy || 'local'; // 'local' or 'allorigins'
    }

    getProxyUrl(targetUrl) {
        if (this.strategy === 'allorigins') {
            return `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
        }

        if (this.isDev) {
            const path = targetUrl.replace('https://www.work.ua', '');
            return `/api${path}`;
        }
        return targetUrl;
    }

    async fetch(url) {
        if (this.strategy === 'mobile') {
            return this.fetchWithFallback(url);
        }

        try {
            const fetchUrl = this.getProxyUrl(url);
            console.log('Fetching URL:', fetchUrl);

            const response = await fetch(fetchUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (this.strategy === 'allorigins') {
                const data = await response.json();
                return data.contents;
            }

            const data = await response.text();
            return data;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    async fetchWithFallback(targetUrl) {
        // 1. Try Direct Fetch
        try {
            console.log('Trying direct fetch...');
            const response = await fetch(targetUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            });

            if (response.ok) {
                const html = await response.text();
                if (html && html.length > 100) {
                    console.log('Success with direct fetch');
                    return html;
                }
            }
        } catch (error) {
            console.warn('Direct fetch failed:', error.message);
        }

        // 2. Try Proxies
        const proxies = [
            {
                name: 'AllOrigins',
                buildUrl: (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
                extract: (d) => d.contents
            },
            {
                name: 'CORS Anywhere',
                buildUrl: (u) => `https://cors-anywhere.herokuapp.com/${u}`,
                extract: (d) => d
            },
            {
                name: 'ThingProxy',
                buildUrl: (u) => `https://thingproxy.freeboard.io/fetch/${u}`,
                extract: (d) => d
            }
        ];

        for (const proxy of proxies) {
            try {
                console.log(`Trying proxy: ${proxy.name}`);
                const response = await fetch(proxy.buildUrl(targetUrl));

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const contentType = response.headers.get('content-type');
                let data;
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    data = await response.text();
                }

                const html = proxy.extract(data);
                if (html && html.length > 100) {
                    console.log(`Success with ${proxy.name}`);
                    return html;
                }
            } catch (error) {
                console.warn(`Failed with ${proxy.name}:`, error.message);
            }
        }

        throw new Error('All fetch methods failed');
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