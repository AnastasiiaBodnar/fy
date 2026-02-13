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