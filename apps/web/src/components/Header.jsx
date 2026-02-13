import React from 'react';

export default function Header({ onRefresh, onSave, isLoading, hasJobs }) {
  return (
    <header style={styles.header}>
      <div style={styles.titleContainer}>
        <h1 style={styles.title}>DOU Парсер</h1>
        <p style={styles.subtitle}>Аналіз вакансій IT-ринку</p>
      </div>
      <div style={styles.controls}>
        <button 
          onClick={onRefresh} 
          disabled={isLoading}
          style={{...styles.button, ...(isLoading ? styles.buttonDisabled : {})}}
        >
          {isLoading ? '⏳ Завантаження...' : 'Оновити дані'}
        </button>
        {hasJobs && (
          <button onClick={onSave} style={styles.saveButton}>
            Експортувати JSON
          </button>
        )}
      </div>
    </header>
  );
}

const styles = {
  header: {
    marginBottom: '24px',
    backgroundColor: '#fff',
    padding: '20px 24px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
    border: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  titleContainer: {
    flex: 1
  },
  title: {
    margin: '0 0 4px 0',
    color: '#1a3c34',
    fontSize: '1.5rem',
    fontWeight: '600',
    letterSpacing: '-0.02em'
  },
  subtitle: {
    margin: 0,
    color: '#6b8c85',
    fontSize: '0.9rem',
    fontWeight: '400'
  },
  controls: {
    display: 'flex',
    gap: '12px'
  },
  button: {
    padding: '10px 20px',
    cursor: 'pointer',
    backgroundColor: '#20c997',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    minWidth: '140px'
  },
  saveButton: {
    padding: '10px 20px',
    cursor: 'pointer',
    backgroundColor: '#f8f9fa',
    color: '#1a3c34',
    border: '1px solid #e0e6e3',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    minWidth: '140px'
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  }
};