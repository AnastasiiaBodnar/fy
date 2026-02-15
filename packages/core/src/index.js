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
        // Fallback for non-browser environments (using domutils)
        const found = this.querySelectorAll(document, selector);
        return found.length > 0 ? found[0] : null;
    }

    querySelectorAll(document, selector) {
        if (typeof document.querySelectorAll === 'function') {
            return Array.from(document.querySelectorAll(selector));
        }

        // Basic selector parser support for:
        // - multiple classes: .class1.class2
        // - descendant combinator: div span
        // - simple tag/id/class

        const selectors = selector.split(/\s+/); // Split by descendant combinator

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
            context = matches; // Next iteration searches within found elements (but wait, findAll searches subtree...)

            // Actually, DomUtils.findAll returns flattened list of all matches in subtree.
            // If we have "div span", first we find all "div"s. 
            // Then for EACH div, we need to find "span"s in its subtree.
            // The logic here needs to be:
            // 1. Find all matches for first selector part in current root.
            // 2. Set these matches as new roots.
            // 3. Repeat for next selector part.

            // Correction for loop:
            // On first iteration, context is root. matches = findAll(part, context).
            // On second iteration, context should be the *children* of the matches from previous step?
            // unique matches to avoid duplicates?
            if (selectors.indexOf(part) < selectors.length - 1) {
                // Prepare context for next iteration: direct children of all found matches
                // DomUtils.findAll already searches deep. 
                // We simply need to restrict search to the subtrees of fully matched elements?
                // Actually the standard way: 
                // Context = matches.map(m => m.children).flat().filter(Boolean)
                context = matches;
            }
        }

        // Wait, the logic above is slightly flawed for "div span". 
        // 1. Find all "div"s in Document. 
        // 2. For each "div", find all "span"s.
        // The loop above:
        // 1. matches = all divs.
        // 2. context = matches.
        // 3. find all "span"s in context... findAll accepts array of elements? Yes.
        // But findAll searches *recursively*. So if we pass a div, it searches inside it.
        // So yes, `DomUtils.findAll(predicate, context)` should work if context is array of nodes.

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

            // Company is usually in a div with class mt-xs, inside a span or directly text
            const companyElement = this.htmlParser.querySelector(element, 'div.mt-xs span.strong-600');
            const company = this.htmlParser.getText(companyElement) || 'Не вказано';

            // Salary might be in a div above company or part of different block
            // Often it's in <div><span class="strong-600">30 000 грн</span></div>
            // We search for a distinct strong-600 that contains digits/currency symbols
            // This is a heuristic
            let salary = 'За домовленістю';
            const strongElements = this.htmlParser.querySelectorAll(element, '.strong-600');

            for (let i = 0; i < strongElements.length; i++) {
                const text = this.htmlParser.getText(strongElements[i]);
                if (text && (text.includes('грн') || text.includes('$') || /\d/.test(text)) && text !== company) {
                    salary = text;
                    break;
                }
            }

            // Location is often in the same block as company but outside the strong tag, or separate
            // Simpler approach: get text of div.mt-xs and remove company name
            const locationContainer = this.htmlParser.querySelector(element, 'div.mt-xs');
            let location = 'Не вказано';
            if (locationContainer) {
                let fullText = this.htmlParser.getText(locationContainer);
                // Remove company name to isolate location (approximate)
                if (company && fullText.includes(company)) {
                    fullText = fullText.replace(company, '').trim();
                }
                // Cleanup common separators like ","
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

        // Work.ua details often in #job-description or similar card
        const descriptionElement = this.htmlParser.querySelector(document, '#job-description');
        const fullDescription = this.htmlParser.getText(descriptionElement) || 'Опис недоступний';

        // Helper to extract list items as requirements
        const requirements = [];

        // Try to find uls inside description
        if (descriptionElement) {
            // This is a limitation of simple htmlParser wrapper if querySelectorAll isn't scoped to element well in all implementations
            // But assuming basic functionality:
            //  const lists = this.htmlParser.querySelectorAll(descriptionElement, 'ul li');
            //  lists.forEach(li => requirements.push(this.htmlParser.getText(li)));
        }

        return {
            fullDescription,
            requirements: requirements.length > 0 ? requirements : ['Див. повний опис']
        }
    }
}