import React from 'react';
import JobCard from './JobCard';

export default function JobList({ jobs, onLoadDetails, loadingDetails }) {
  if (jobs.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>📄</div>
        <p style={styles.emptyTitle}>Вакансій не знайдено</p>
        <p style={styles.emptyText}>Спробуйте змінити параметри пошуку</p>
      </div>
    );
  }

  return (
    <main style={styles.list}>
      {jobs.map((job, index) => (
        <JobCard
          key={index}
          job={job}
          index={index}
          onLoadDetails={onLoadDetails}
          isLoadingDetails={loadingDetails[index]}
        />
      ))}
    </main>
  );
}

const styles = {
  list: {
    display: 'grid',
    gap: '16px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
    border: '1px solid #f0f0f0'
  },
  emptyIcon: {
    fontSize: '3rem',
    opacity: 0.3,
    marginBottom: '16px'
  },
  emptyTitle: {
    color: '#1a3c34',
    fontSize: '1.1rem',
    fontWeight: '600',
    margin: '0 0 8px 0'
  },
  emptyText: {
    color: '#6b8c85',
    fontSize: '0.9rem',
    margin: 0
  }
};