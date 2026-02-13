import React from 'react';
import { useJobsStore } from '@dou-parser/store';
import { DOUParser, Job } from '@dou-parser/core';
import { Fetcher } from '@dou-parser/api';
import { StorageService } from '@dou-parser/utils';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import JobList from './components/JobList';
import './App.css';

function App() {
  const {
    jobs,
    isLoading,
    loadingDetails,
    searchQuery,
    setJobs,
    setLoading,
    updateJob,
    setLoadingDetails,
    setSearchQuery,
    getFilteredJobs
  } = useJobsStore();

  const parser = new DOUParser();
  const fetcher = new Fetcher();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const html = await fetcher.fetchHTML('https://jobs.dou.ua/vacancies/');
      const parsedJobs = parser.parseVacancyList(html);
      setJobs(parsedJobs.slice(0, 30));
    } catch (error) {
      console.error('Помилка завантаження:', error);
      alert('Не вдалося завантажити вакансії. Спробуйте пізніше.');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobDetails = async (job, index) => {
    setLoadingDetails(index, true);
    try {
      const html = await fetcher.fetchHTML(job.link);
      const details = parser.parseVacancyDetails(html);
      updateJob(index, { details });
    } catch (error) {
      console.error('Помилка завантаження деталей:', error);
      alert('Не вдалося завантажити деталі вакансії');
    } finally {
      setLoadingDetails(index, false);
    }
  };

  const handleSaveJSON = () => {
    StorageService.saveToJSON(jobs.map(job => job.toJSON()));
  };

  const filteredJobs = getFilteredJobs();

  return (
    <div className="container">
      <Header 
        onRefresh={fetchJobs}
        onSave={handleSaveJSON}
        isLoading={isLoading}
        hasJobs={jobs.length > 0}
      />
      
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        totalCount={jobs.length}
        filteredCount={filteredJobs.length}
      />
      
      <JobList 
        jobs={filteredJobs}
        onLoadDetails={fetchJobDetails}
        loadingDetails={loadingDetails}
      />

      {jobs.length === 0 && !isLoading && (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>Натисніть "Завантажити вакансії" для початку</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  emptyText: {
    color: '#7f8c8d',
    fontSize: '1.1rem',
    margin: 0
  }
};

export default App;