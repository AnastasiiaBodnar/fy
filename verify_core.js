import { WorkUaParser, Job, HTMLParser } from './packages/core/index.js';

console.log('Verifying imports from root index.js...');

try {
    const parser = new WorkUaParser();
    console.log('WorkUaParser instantiated successfully.');

    const html = `
        <div class="card job-link">
            <h2><a href="/jobs/12345/">Frontend Developer</a></h2>
            <div class="mt-xs">
                <span class="strong-600">Google</span>
                Kyiv
            </div>
            <div class="mt-xs">
                <span class="strong-600">5000$</span>
            </div>
            <p class="ellipsis">Best job ever</p>
            <time>Today</time>
        </div>
    `;

    const jobs = parser.parseVacancyList(html);
    console.log(`Parsed ${jobs.length} jobs.`);

    if (jobs.length === 1) {
        const job = jobs[0];
        console.log('Job details:', JSON.stringify(job, null, 2));
        if (job.title === 'Frontend Developer' && job.company === 'Google') {
            console.log('Verification PASSED!');
        } else {
            console.error('Verification FAILED: Incorrect data parsed.');
            process.exit(1);
        }
    } else {
        console.error('Verification FAILED: Expected 1 job.');
        process.exit(1);
    }

} catch (error) {
    console.error('Verification FAILED with error:', error);
    process.exit(1);
}
