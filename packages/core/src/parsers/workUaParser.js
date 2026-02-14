import { HTMLParser } from './htmlParser.js';
import { Job } from '../models/job.js';

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
