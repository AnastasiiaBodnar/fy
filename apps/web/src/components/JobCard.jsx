import React from 'react';

export default function JobCard({ job, index, onLoadDetails, isLoadingDetails }) {
  return (
    <article style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.titleWrapper}>
          <h2 style={styles.jobTitle}>
            <a href={job.link} target="_blank" rel="noopener noreferrer" style={styles.link}>
              {job.title}
            </a>
          </h2>
          <div style={styles.metaInfo}>
            <span style={styles.company}>{job.company}</span>
            <span style={styles.divider}>•</span>
            <span style={styles.date}>{job.date}</span>
          </div>
        </div>
        <div style={styles.rightColumn}>
          <div style={styles.salary}>{job.salary}</div>
          <div style={styles.location}>{job.location}</div>
        </div>
      </div>

      {job.description && (
        <div style={styles.descriptionWrapper}>
          <p style={styles.description}>{job.description}</p>
        </div>
      )}

      {!job.details ? (
        <div style={styles.actions}>
          <button
            onClick={() => onLoadDetails(job, index)}
            disabled={isLoadingDetails}
            style={{ ...styles.detailsButton, ...(isLoadingDetails ? styles.buttonDisabled : {}) }}
          >
            {isLoadingDetails ? 'Завантаження...' : 'Детальніше'}
          </button>
        </div>
      ) : (
        <div style={styles.details}>
          <div style={styles.detailsHeader}>
            <h3 style={styles.detailsTitle}>Опис вакансії</h3>
          </div>
          <p style={styles.detailsText}>{job.details.fullDescription}</p>

          {job.details.requirements.length > 0 && job.details.requirements[0] !== 'Не вказано' && (
            <div style={styles.requirementsSection}>
              <h4 style={styles.requirementsTitle}>Вимоги:</h4>
              <ul style={styles.requirementsList}>
                {job.details.requirements.map((req, i) => (
                  <li key={i} style={styles.requirementItem}>
                    <span style={styles.bullet}>•</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

const styles = {
  card: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
    border: '1px solid #f0f0f0',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    gap: '20px'
  },
  titleWrapper: {
    flex: 1
  },
  jobTitle: {
    margin: '0 0 6px 0',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1a3c34'
  },
  link: {
    textDecoration: 'none',
    color: '#ff4965',
    transition: 'color 0.2s ease'
  },
  metaInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
    color: '#6b8c85'
  },
  company: {
    fontWeight: '500'
  },
  divider: {
    opacity: 0.6
  },
  date: {
    color: '#8fa8a0'
  },
  rightColumn: {
    textAlign: 'right',
    minWidth: '150px'
  },
  salary: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1a3c34',
    marginBottom: '4px'
  },
  location: {
    fontSize: '0.85rem',
    color: '#6b8c85'
  },
  descriptionWrapper: {
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#f9fbfa',
    borderRadius: '6px',
    borderLeft: '3px solid #ff4965'
  },
  description: {
    color: '#4a645c',
    lineHeight: '1.5',
    fontSize: '0.9rem',
    margin: 0
  },
  actions: {
    paddingTop: '12px',
    borderTop: '1px solid #f0f0f0'
  },
  detailsButton: {
    padding: '8px 16px',
    cursor: 'pointer',
    backgroundColor: '#f9fbfa',
    color: '#ff4965',
    border: '1px solid #ffdce2',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  details: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#f9fbfa',
    borderRadius: '8px'
  },
  detailsHeader: {
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid #e0e6e3'
  },
  detailsTitle: {
    margin: 0,
    color: '#1a3c34',
    fontSize: '0.95rem',
    fontWeight: '600'
  },
  detailsText: {
    color: '#4a645c',
    lineHeight: '1.6',
    fontSize: '0.9rem',
    marginBottom: '16px'
  },
  requirementsSection: {
    marginTop: '16px'
  },
  requirementsTitle: {
    margin: '0 0 8px 0',
    color: '#1a3c34',
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  requirementsList: {
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },
  requirementItem: {
    color: '#4a645c',
    marginBottom: '6px',
    lineHeight: '1.5',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px'
  },
  bullet: {
    color: '#ff4965',
    flexShrink: 0
  }
};