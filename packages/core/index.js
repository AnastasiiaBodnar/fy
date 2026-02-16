import { parseDocument } from 'htmlparser2';
import * as DomUtils from 'domutils';

// Helper functions for DOM manipulation
const parse = (html) => {
    if (typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        return parser.parseFromString(html, 'text/html');
    }
    return parseDocument(html);
};

const querySelectorAll = (document, selector) => {
    if (typeof document.querySelectorAll === 'function') {
        return Array.from(document.querySelectorAll(selector));
    }

    const selectors = selector.split(/\s+/);
    let context = document.children || (Array.isArray(document) ? document : [document]);

    for (const part of selectors) {
        const predicate = (elem) => {
            if (!elem.attribs && !elem.name) return false;

            if (part.startsWith('.')) {
                const classes = part.split('.').filter(Boolean);
                const elemClasses = (elem.attribs?.class || '').split(/\s+/);
                return classes.every(cls => elemClasses.includes(cls));
            }

            if (part.startsWith('#')) {
                return elem.attribs?.id === part.substring(1);
            }

            if (part.includes('.')) {
                const [tag, ...classes] = part.split('.');
                if (elem.name !== tag) return false;
                const elemClasses = (elem.attribs?.class || '').split(/\s+/);
                return classes.every(cls => elemClasses.includes(cls));
            }

            return elem.name === part;
        };

        let matches = [];
        DomUtils.findAll(predicate, context).forEach(match => matches.push(match));

        if (matches.length === 0) return [];
        context = matches;

        if (selectors.indexOf(part) < selectors.length - 1) {
            context = matches;
        }
    }
    return context;
};

const querySelector = (document, selector) => {
    if (typeof document.querySelector === 'function') {
        return document.querySelector(selector);
    }
    const found = querySelectorAll(document, selector);
    return found.length > 0 ? found[0] : null;
};

const getText = (element) => {
    if (!element) return '';
    if (element.textContent !== undefined) {
        return element.textContent.trim();
    }
    return DomUtils.textContent(element).trim();
};

const getAttribute = (element, attribute) => {
    if (!element) return '';
    if (element.getAttribute) {
        return element.getAttribute(attribute) || '';
    }
    return element.attribs?.[attribute] || '';
};

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
        this.baseUrl = 'https://www.work.ua';
    }

    parseVacancyList(html) {
        const document = parse(html);
        const vacancies = querySelectorAll(document, '.card.job-link');

        const jobs = [];

        vacancies.forEach((element) => {
            const titleElement = querySelector(element, 'h2 a');
            const title = getText(titleElement);
            let link = getAttribute(titleElement, 'href');

            if (link && !link.startsWith('http')) {
                link = `${this.baseUrl}${link}`;
            }

            const companyElement = querySelector(element, 'div.mt-xs span.strong-600');
            const company = getText(companyElement) || 'Не вказано';

            let salary = 'За домовленістю';
            const strongElements = querySelectorAll(element, '.strong-600');

            for (let i = 0; i < strongElements.length; i++) {
                const text = getText(strongElements[i]);
                if (text && (text.includes('грн') || text.includes('$') || /\d/.test(text)) && text !== company) {
                    salary = text;
                    break;
                }
            }

            const locationContainer = querySelector(element, 'div.mt-xs');
            let location = 'Не вказано';
            if (locationContainer) {
                let fullText = getText(locationContainer);
                if (company && fullText.includes(company)) {
                    fullText = fullText.replace(company, '').trim();
                }
                location = fullText.replace(/^,/, '').trim();
            }

            const description = getText(
                querySelector(element, 'p.ellipsis')
            ) || '';

            const dateElement = querySelector(element, 'time');
            const date = getText(dateElement) || '';

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
        const document = parse(html);
        const descriptionElement = querySelector(document, '#job-description');
        const fullDescription = getText(descriptionElement) || 'Опис недоступний';

        return {
            fullDescription
        }
    }
}