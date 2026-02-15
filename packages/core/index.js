import { parseDocument } from 'htmlparser2';
import * as DomUtils from 'domutils';

export class HTMLParser {
    parse(html) {
        if (typeof DOMParser !== 'undefined') {
            const parser = new DOMParser();
            return parser.parseFromString(html, 'text/html');
        }

        return parseDocument(html);
    }

    querySelector(document, selector) {
        if (typeof document.querySelector === 'function') {
            return document.querySelector(selector);
        }

        const found = this.querySelectorAll(document, selector);
        return found.length > 0 ? found[0] : null;
    }

    querySelectorAll(document, selector) {
        if (typeof document.querySelectorAll === 'function') {
            return Array.from(document.querySelectorAll(selector));
        }

        const selectors = selector.split(/\s+/);

        let context = document.children || (Array.isArray(document) ? document : [document]);

        for (const part of selectors) {
            const predicate = (elem) => {
                if (!elem.attribs && !elem.name) return false;

                // Handle multiple classes e.g. .card.job-link
                if (part.startsWith('.')) {
                    const classes = part.split('.').filter(Boolean);
                    const elemClasses = (elem.attribs?.class || '').split(/\s+/);
                    return classes.every(cls => elemClasses.includes(cls));
                }

                // Handle ID
                if (part.startsWith('#')) {
                    return elem.attribs?.id === part.substring(1);
                }

                // Handle tag with classes e.g. div.mt-xs
                if (part.includes('.')) {
                    const [tag, ...classes] = part.split('.');
                    if (elem.name !== tag) return false;
                    const elemClasses = (elem.attribs?.class || '').split(/\s+/);
                    return classes.every(cls => elemClasses.includes(cls));
                }

                // Simple tag
                return elem.name === part;
            };

            // Find all matching elements in current context (recursive)
            let matches = [];
            DomUtils.findAll(predicate, context).forEach(match => matches.push(match));

            if (matches.length === 0) return [];
            context = matches;

            if (selectors.indexOf(part) < selectors.length - 1) {
                context = matches;
            }
        }



        return context;
    }

    getText(element) {
        if (!element) return '';

        if (element.textContent !== undefined) {
            return element.textContent.trim();
        }

        return DomUtils.textContent(element).trim();
    }

    getAttribute(element, attribute) {
        if (!element) return '';

        if (element.getAttribute) {
            return element.getAttribute(attribute) || '';
        }

        return element.attribs?.[attribute] || '';
    }
}

export class Job {
    constructor(data) {
        this.title = data.title || '';
        this.link = data.link || '';
        this.company = data.company || 'Не вказано';
        this.salary = data.salary || 'За домовленістю';
        this.location = data.location || 'Не вказано';
        this.description = data.description || '';
        this.date = data.date || '';
        this.details = data.details || null;
    }

    hasDetails() {
        return this.details !== null;
    }

    toJSON() {
        return {
            title: this.title,
            link: this.link,
            company: this.company,
            salary: this.salary,
            location: this.location,
            description: this.description,
            date: this.date,
            details: this.details
        };
    }
}

export class WorkUaParser {
    constructor() {
        this.htmlParser = new HTMLParser();
        this.baseUrl = 'https://www.work.ua';
    }

    parseVacancyList(html) {
        const document = this.htmlParser.parse(html);
        const vacancies = this.htmlParser.querySelectorAll(document, '.card.job-link');

        const jobs = [];

        vacancies.forEach((element) => {
            const titleElement = this.htmlParser.querySelector(element, 'h2 a');
            const title = this.htmlParser.getText(titleElement);
            let link = this.htmlParser.getAttribute(titleElement, 'href');

            if (link && !link.startsWith('http')) {
                link = `${this.baseUrl}${link}`;
            }

            const companyElement = this.htmlParser.querySelector(element, 'div.mt-xs span.strong-600');
            const company = this.htmlParser.getText(companyElement) || 'Не вказано';

            let salary = 'За домовленістю';
            const strongElements = this.htmlParser.querySelectorAll(element, '.strong-600');

            for (let i = 0; i < strongElements.length; i++) {
                const text = this.htmlParser.getText(strongElements[i]);
                if (text && (text.includes('грн') || text.includes('$') || /\d/.test(text)) && text !== company) {
                    salary = text;
                    break;
                }
            }

            const locationContainer = this.htmlParser.querySelector(element, 'div.mt-xs');
            let location = 'Не вказано';
            if (locationContainer) {
                let fullText = this.htmlParser.getText(locationContainer);
                if (company && fullText.includes(company)) {
                    fullText = fullText.replace(company, '').trim();
                }
                location = fullText.replace(/^,/, '').trim();
            }

            const description = this.htmlParser.getText(
                this.htmlParser.querySelector(element, 'p.ellipsis')
            ) || '';

            const dateElement = this.htmlParser.querySelector(element, 'time');
            const date = this.htmlParser.getText(dateElement) || '';

            if (title && link) {
                jobs.push(new Job({
                    title,
                    link,
                    company,
                    salary,
                    location,
                    description,
                    date
                }));
            }
        });

        return jobs;
    }

    parseVacancyDetails(html) {
        const document = this.htmlParser.parse(html);

        const descriptionElement = this.htmlParser.querySelector(document, '#job-description');
        const fullDescription = this.htmlParser.getText(descriptionElement) || 'Опис недоступний';

        const requirements = [];

        if (descriptionElement) {
        }

        return {
            fullDescription,
            requirements: requirements.length > 0 ? requirements : ['Див. повний опис']
        }
    }
}