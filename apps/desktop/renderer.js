const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

let jobs = [];
let filteredJobs = [];
let loadingDetails = {};

const refreshBtn = document.getElementById('refreshBtn');
const saveBtn = document.getElementById('saveBtn');
const searchInput = document.getElementById('searchInput');
const searchPanel = document.getElementById('searchPanel');
const searchStats = document.getElementById('searchStats');
const loader = document.getElementById('loader');
const emptyState = document.getElementById('emptyState');
const jobsContainer = document.getElementById('jobsContainer');

async function fetchJobs() {
    refreshBtn.disabled = true;
    loader.style.display = 'block';
    emptyState.style.display = 'none';
    jobsContainer.innerHTML = '';

    try {
        const result = await ipcRenderer.invoke('fetch-jobs');

        if (result.success) {
            jobs = result.jobs;
            filteredJobs = [...jobs];
            renderJobs();

            searchPanel.style.display = 'block';
            saveBtn.disabled = false;
            updateSearchStats();
        } else {
            throw new Error(result.error);
        }

    } catch (error) {
        console.error('Помилка завантаження:', error);
        alert('Не вдалося завантажити вакансії. Перевірте підключення до інтернету.');
    } finally {
        loader.style.display = 'none';
        refreshBtn.disabled = false;
    }
}

async function fetchJobDetails(job, index) {
    loadingDetails[index] = true;
    updateJobCard(index);

    try {
        // Use IPC to fetch details via main process to avoid CORS and parsing issues
        const result = await ipcRenderer.invoke('fetch-job-details', job.link);

        if (result.success) {
            job.details = result.details;
        } else {
            console.error('Failed to load details:', result.error);
            alert('Не вдалося завантажити деталі вакансії');
        }

        updateJobCard(index);

    } catch (error) {
        console.error('Помилка завантаження деталей:', error);
        alert('Не вдалося завантажити деталі вакансії');
    } finally {
        loadingDetails[index] = false;
        // Trigger update to remove loading state
        updateJobCard(index);
    }
}

function renderJobs() {
    jobsContainer.innerHTML = '';

    if (filteredJobs.length === 0) {
        jobsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h2>Вакансій не знайдено</h2>
                <p>Спробуйте змінити параметри пошуку</p>
            </div>
        `;
        return;
    }

    filteredJobs.forEach((job, index) => {
        const card = createJobCard(job, index);
        jobsContainer.appendChild(card);
    });
}

function createJobCard(job, index) {
    const card = document.createElement('div');
    card.className = 'job-card';
    card.innerHTML = `
        <div class="job-header">
            <div class="job-title-section">
                <a href="${job.link}" class="job-title" target="_blank">${job.title}</a>
                <div class="job-meta">
                    <span class="job-company">🏢 ${job.company}</span>
                    <span>•</span>
                    <span class="job-date">📅 ${job.date}</span>
                </div>
            </div>
            <div class="job-info-section">
                <div class="job-salary">${job.salary}</div>
                <div class="job-location">${job.location}</div>
            </div>
        </div>
        
        ${job.description ? `
            <div class="job-description">${job.description}</div>
        ` : ''}
        
        <div class="job-actions">
            ${!job.details ? `
                <button class="btn-details" onclick="loadDetails(${index})" ${loadingDetails[index] ? 'disabled' : ''}>
                    ${loadingDetails[index] ? 'Завантаження...' : 'Показати деталі'}
                </button>
            ` : `
                <div class="job-details">
                    <h3 class="details-title">Повний опис</h3>
                    <div class="full-description">${job.details.fullDescription}</div>
                    
                    ${job.details.requirements.length > 0 && job.details.requirements[0] !== 'Не вказано' ? `
                        <div class="requirements-section">
                            <h4 class="requirements-title">Вимоги:</h4>
                            <ul class="requirements-list">
                                ${job.details.requirements.map(req => `<li class="requirement-item">${req}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `}
        </div>
    `;
    return card;
}

function updateJobCard(index) {
    const job = filteredJobs[index];
    const cards = document.querySelectorAll('.job-card');
    if (cards[index]) {
        const newCard = createJobCard(job, index);
        cards[index].replaceWith(newCard);
    }
}

window.loadDetails = function (index) {
    const job = filteredJobs[index];
    fetchJobDetails(job, index);
};

function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();

    if (!query) {
        filteredJobs = [...jobs];
    } else {
        filteredJobs = jobs.filter(job =>
            job.title.toLowerCase().includes(query) ||
            job.company.toLowerCase().includes(query) ||
            job.location.toLowerCase().includes(query)
        );
    }

    renderJobs();
    updateSearchStats();
}

function updateSearchStats() {
    searchStats.textContent = `Показано: ${filteredJobs.length} з ${jobs.length}`;
}

function saveToJSON() {
    const dataStr = JSON.stringify(jobs, null, 2);
    const filePath = path.join(require('os').homedir(), 'Desktop', 'dou_jobs.json');

    try {
        fs.writeFileSync(filePath, dataStr, 'utf-8');
        alert(`Файл збережено на робочому столі:\n${filePath}`);
    } catch (error) {
        console.error('Помилка збереження:', error);
        alert('Не вдалося зберегти файл');
    }
}

refreshBtn.addEventListener('click', fetchJobs);
saveBtn.addEventListener('click', saveToJSON);
searchInput.addEventListener('input', handleSearch);

console.log('DOU Parser Desktop готовий до роботи!');