import {HTMLParser} from './htmlParser.js';
import {Job} from '../models/job.js';

export class DOUParser {
    constructor() {
        this.htmlParser = new HTMLParser();
        this.baseUrl = 'https://jobs.dou.ua';
    }

    parseVacancyList(html) {
        const document = this.htmlParser.parse(html);
        const vacancies = this.htmlParser.querySelectorAll(document, '.l-vacancy');
        console.log('Знайдено елементів .l-vacancy:', vacancies.length);
        const jobs = [];

        vacancies.forEach((element) => {
            const titleElement = this.htmlParser.querySelector(element, '.vt');
            const title = this.htmlParser.getText(titleElement);
            let link = this.htmlParser.getAttribute(titleElement, 'href');

            if (link && !link.startsWith('http')) {
                link = `${this.baseUrl}${link}`;
            }

            const company = this.htmlParser.getText(
                this.htmlParser.querySelector(element, '.company')
            ) || 'Не вказано';

            const salary = this.htmlParser.getText(
                this.htmlParser.querySelector(element, '.salary')
            ) || 'За домовленістю';

            const location = this.htmlParser.getText(
                this.htmlParser.querySelector(element, '.cities')
            ) || 'Не вказано';

            const description = this.htmlParser.getText(
                this.htmlParser.querySelector(element, '.sh-info')
            ) || '';

            const date = this.htmlParser.getText(
                this.htmlParser.querySelector(element, '.date')
            ) || '';

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

        const descriptionElement = this.htmlParser.querySelector(document, '.b-typo.vacancy-section');
        const fullDescription = this.htmlParser.getText(descriptionElement) || 'Опис недоступний';

        const requirements = [];
        const reqItems = this.htmlParser.querySelectorAll(document, '.b-typo.vacancy-section li');

        reqItems.forEach((item) => {
            const text = this.htmlParser.getText(item);
            if (text) requirements.push(text);
        });

        return {
            fullDescription,
            requirements: requirements.length > 0 ? requirements : ['Не вказано']
        }
    }
}